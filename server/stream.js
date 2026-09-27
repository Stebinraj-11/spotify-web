import fs from 'fs';
import path from 'path';
import { db } from './db.js';
import { DEFAULT_MUSIC_DIR } from './config.js';

const MIME_MAP = {
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.wma': 'audio/x-ms-wma',
  '.opus': 'audio/opus',
};

export function handleStream(req, res) {
  const { trackId } = req.params;

  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }

  let filePath = track.filePath;

  // If path stored in DB does not exist directly (e.g. database migrated between Windows/Linux/Docker),
  // fallback to search inside current music directory by filename!
  if (!fs.existsSync(filePath)) {
    const musicSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('musicDir');
    const musicDir = musicSetting ? musicSetting.value : DEFAULT_MUSIC_DIR;
    const baseName = path.basename(filePath);

    const candidates = [
      path.join(musicDir, baseName),
      path.join(musicDir, 'downloads', baseName),
      path.join(DEFAULT_MUSIC_DIR, baseName),
      path.join(DEFAULT_MUSIC_DIR, 'downloads', baseName),
    ];

    const found = candidates.find((p) => fs.existsSync(p));
    if (found) {
      filePath = found;
      // Self-heal: update DB with new valid path
      try {
        db.prepare('UPDATE tracks SET filePath = ? WHERE id = ?').run(found, trackId);
      } catch (err) {
        // ignore
      }
    } else {
      return res.status(404).json({ error: 'Audio file not found on disk' });
    }
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'audio/mpeg';

  const range = req.headers.range;

  if (range) {
    // Parse range: "bytes=start-end"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || start >= fileSize || (parts[1] && end >= fileSize) || start > end) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return res.status(416).send('Requested Range Not Satisfiable');
    }

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    });

    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error(`Stream error for ${trackId}:`, err);
      if (!res.headersSent) {
        res.status(500).end();
      }
    });
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error(`Stream error for ${trackId}:`, err);
      if (!res.headersSent) {
        res.status(500).end();
      }
    });
  }
}
