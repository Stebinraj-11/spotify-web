import fs from 'fs';
import path from 'path';
import { db } from './db.js';
import { DEFAULT_MUSIC_DIR, IS_VERCEL } from './config.js';

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

// Max chunk size: 2MB (prevents hitting Vercel's 4.5MB payload limit and speeds up seek buffering)
const MAX_CHUNK_SIZE = 2 * 1024 * 1024;

export function handleStream(req, res) {
  const { trackId } = req.params;

  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }

  // On Vercel (or cloud serverless), if originalUrl is present (e.g. Cloudinary),
  // redirect directly so Cloudinary's high-speed CDN handles the range stream without Vercel payload limits!
  if (IS_VERCEL && track.originalUrl) {
    return res.redirect(302, track.originalUrl);
  }

  let filePath = track.filePath;

  // If path stored in DB does not exist directly, try relative lookup in active musicDir
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
      try {
        db.prepare('UPDATE tracks SET filePath = ? WHERE id = ?').run(found, trackId);
      } catch (err) {
        // ignore
      }
    } else if (track.originalUrl) {
      // Fallback: If local file is missing on serverless, stream from original remote URL!
      return res.redirect(302, track.originalUrl);
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
    // Cap chunk size to MAX_CHUNK_SIZE
    const requestedEnd = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const end = Math.min(requestedEnd, start + MAX_CHUNK_SIZE - 1, fileSize - 1);

    if (isNaN(start) || start >= fileSize || start > end) {
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
    // Without Range header, send first chunk to avoid huge payload on serverless
    const end = Math.min(MAX_CHUNK_SIZE - 1, fileSize - 1);
    const chunksize = end + 1;

    res.writeHead(206, {
      'Content-Range': `bytes 0-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });

    const fileStream = fs.createReadStream(filePath, { start: 0, end });
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error(`Stream error for ${trackId}:`, err);
      if (!res.headersSent) {
        res.status(500).end();
      }
    });
  }
}
