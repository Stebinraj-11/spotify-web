import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { parseFile, parseBuffer } from 'music-metadata';
import { db } from './db.js';

const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.flac', '.m4a', '.aac', '.ogg', '.wav', '.wma', '.opus']);
const COVER_FILENAMES = ['cover.jpg', 'cover.png', 'folder.jpg', 'folder.png', 'album.jpg', 'album.png'];

export let scanStatus = {
  isScanning: false,
  totalFiles: 0,
  processedFiles: 0,
  currentFile: '',
  errorCount: 0,
  lastScanTime: null,
};

function cleanFilename(fileName) {
  const base = path.basename(fileName, path.extname(fileName));
  let cleaned = base.replace(/[\-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/\s*\(?(lyrics|official video|audio|remastered|rawpraise\.ng|us uk)\)?/gi, '').trim();

  // Pattern: "Artist - Title"
  if (base.includes(' - ') || base.includes(' _ ')) {
    const parts = base.split(/\s*[-_]\s*/);
    if (parts.length >= 2) {
      return {
        artist: parts[0].replace(/[_\-]+/g, ' ').trim(),
        title: parts.slice(1).join(' - ').replace(/[\-_]+/g, ' ').replace(/\s*\(?(lyrics|official video|audio|remastered|rawpraise\.ng|us uk)\)?/gi, '').trim(),
      };
    }
  }
  // Pattern: "title by artist"
  const byMatch = cleaned.match(/^(.+?)\s+by\s+(.+)$/i);
  if (byMatch) {
    return {
      title: byMatch[1].trim(),
      artist: byMatch[2].trim(),
    };
  }

  return { title: cleaned, artist: 'Unknown Artist' };
}

export async function extractAndSaveCover(picture, coversDir) {
  if (!picture || !picture.data) return null;
  const hash = crypto.createHash('md5').update(picture.data).digest('hex');
  const ext = picture.format?.includes('png') ? '.png' : '.jpg';
  const fileName = `${hash}${ext}`;
  const filePath = path.join(coversDir, fileName);

  if (!fs.existsSync(filePath)) {
    await fs.promises.writeFile(filePath, picture.data);
  }
  return `/covers/${fileName}`;
}

export async function findFolderCover(dirPath, coversDir) {
  try {
    for (const name of COVER_FILENAMES) {
      const p = path.join(dirPath, name);
      if (fs.existsSync(p)) {
        const data = await fs.promises.readFile(p);
        const hash = crypto.createHash('md5').update(data).digest('hex');
        const ext = path.extname(name);
        const coverFileName = `${hash}${ext}`;
        const targetPath = path.join(coversDir, coverFileName);
        if (!fs.existsSync(targetPath)) {
          await fs.promises.writeFile(targetPath, data);
        }
        return `/covers/${coverFileName}`;
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

export function getAllAudioFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllAudioFiles(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

export async function parseAndSaveTrack(filePath, coversDir, originalUrl = null) {
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  let metadata = null;

  try {
    metadata = await parseFile(filePath, { duration: true, skipCovers: false });
  } catch (err) {
    console.warn(`[Scanner] Warning parsing metadata for ${filePath}:`, err.message);
  }

  const common = metadata?.common || {};
  const format = metadata?.format || {};
  const fallback = cleanFilename(filePath);

  let title = (common.title && common.title.trim()) || fallback.title || path.basename(filePath);
  let artist = (common.artist && common.artist.trim()) || fallback.artist || 'Unknown Artist';
  let album = (common.album && common.album.trim()) || 'Singles & Unknown';
  let albumArtist = common.albumartist || artist;
  let genre = Array.isArray(common.genre) ? common.genre.join(', ') : (common.genre || null);
  let year = common.year || null;
  let durationSec = format.duration ? Math.round(format.duration * 10) / 10 : 0;
  let trackNumber = common.track?.no || null;
  let albumArtPath = null;

  if (common.picture && common.picture.length > 0) {
    albumArtPath = await extractAndSaveCover(common.picture[0], coversDir);
  }

  if (!albumArtPath) {
    albumArtPath = await findFolderCover(path.dirname(filePath), coversDir);
  }

  const trackId = crypto.createHash('sha1').update(filePath).digest('hex').substring(0, 16);
  const now = new Date().toISOString();

  const insertTrack = db.prepare(`
    INSERT INTO tracks (
      id, filePath, title, artist, album, albumArtist, genre, year,
      durationSec, trackNumber, albumArtPath, fileSize, format, originalUrl,
      mtime, dateAdded
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
    ON CONFLICT(filePath) DO UPDATE SET
      title = excluded.title,
      artist = excluded.artist,
      album = excluded.album,
      albumArtist = excluded.albumArtist,
      genre = excluded.genre,
      year = excluded.year,
      durationSec = excluded.durationSec,
      trackNumber = excluded.trackNumber,
      albumArtPath = COALESCE(excluded.albumArtPath, tracks.albumArtPath),
      fileSize = excluded.fileSize,
      format = excluded.format,
      originalUrl = COALESCE(excluded.originalUrl, tracks.originalUrl),
      mtime = excluded.mtime
  `);

  insertTrack.run(
    trackId,
    filePath,
    title,
    artist,
    album,
    albumArtist,
    genre,
    year,
    durationSec,
    trackNumber,
    albumArtPath,
    stats.size,
    ext.replace('.', ''),
    originalUrl,
    stats.mtimeMs,
    now
  );

  return db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
}

export async function scanLibrary(musicDir, coversDir) {
  if (scanStatus.isScanning) {
    return { message: 'Scan already in progress', status: scanStatus };
  }

  scanStatus.isScanning = true;
  scanStatus.errorCount = 0;
  scanStatus.processedFiles = 0;

  try {
    const files = getAllAudioFiles(musicDir);
    scanStatus.totalFiles = files.length;

    // Prune tracks whose files were deleted
    const allDbTracks = db.prepare('SELECT id, filePath FROM tracks').all();
    const deleteTrack = db.prepare('DELETE FROM tracks WHERE id = ?');
    const deletePlaylistTrack = db.prepare('DELETE FROM playlist_tracks WHERE trackId = ?');

    const dbDeleteTx = db.transaction(() => {
      for (const track of allDbTracks) {
        if (!fs.existsSync(track.filePath)) {
          deletePlaylistTrack.run(track.id);
          deleteTrack.run(track.id);
        }
      }
    });
    dbDeleteTx();

    // Check existing mtimes to skip unchanged files
    const existingMap = new Map();
    db.prepare('SELECT filePath, mtime, durationSec FROM tracks').all().forEach(t => {
      existingMap.set(t.filePath, t);
    });

    for (const filePath of files) {
      try {
        scanStatus.currentFile = path.basename(filePath);
        const stat = fs.statSync(filePath);
        const existing = existingMap.get(filePath);

        // If file unchanged and duration valid, skip parsing
        if (existing && existing.mtime === stat.mtimeMs && existing.durationSec > 0) {
          scanStatus.processedFiles++;
          continue;
        }

        await parseAndSaveTrack(filePath, coversDir);
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
        scanStatus.errorCount++;
      } finally {
        scanStatus.processedFiles++;
      }
    }

    scanStatus.lastScanTime = new Date().toISOString();
  } finally {
    scanStatus.isScanning = false;
    scanStatus.currentFile = '';
  }

  return { message: 'Scan completed', status: scanStatus };
}
