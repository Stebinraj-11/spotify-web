import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db, initDatabase } from './db.js';
import { scanLibrary, scanStatus } from './scanner.js';
import { handleStream } from './stream.js';
import { downloadTrackFromUrl, activeDownloads, SAMPLE_REMOTE_TRACKS } from './downloader.js';
import {
  PORT,
  HOST,
  COVERS_DIR,
  DEFAULT_MUSIC_DIR,
  APP_PASSWORD,
  SESSION_SECRET,
  rootDir,
} from './config.js';

initDatabase();

const app = express();

// Trust reverse proxies (Nginx, Caddy, Cloudflare, Render, Railway, Fly.io)
app.enable('trust proxy');

app.use(cors());
app.use(express.json());

// Serve extracted album art with long caching
app.use('/covers', express.static(COVERS_DIR, { maxAge: '7d' }));
app.use('/covers', express.static(path.join(rootDir, 'data', 'covers'), { maxAge: '7d' }));

// Helper to get active music directory from settings
function getMusicDir() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('musicDir');
  return row ? row.value : DEFAULT_MUSIC_DIR;
}

// ----------------- AUTHENTICATION & ACCOUNT PROFILE -----------------
function getActivePassword() {
  if (APP_PASSWORD && APP_PASSWORD.trim().length > 0) return APP_PASSWORD.trim();
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('appPassword');
    return row ? row.value : null;
  } catch (err) {
    return null;
  }
}

function generateToken() {
  const pwd = getActivePassword() || '';
  return crypto.createHmac('sha256', SESSION_SECRET).update(pwd).digest('hex');
}

function checkTokenValid(token) {
  const pwd = getActivePassword();
  if (!pwd) return true;
  if (!token) return false;
  return token === generateToken();
}

app.get('/api/auth/status', (req, res) => {
  const token = req.headers['x-auth-token'] || req.query.token;
  const pwd = getActivePassword();
  res.json({
    authRequired: Boolean(pwd && pwd.length > 0),
    authenticated: checkTokenValid(token),
  });
});

app.post('/api/auth/login', (req, res) => {
  const pwd = getActivePassword();
  if (!pwd) {
    return res.json({ success: true, token: 'open' });
  }

  const { password } = req.body;
  if (password === pwd) {
    const token = generateToken();
    return res.json({ success: true, token });
  }

  res.status(401).json({ error: 'Incorrect password' });
});

// ----------------- ACCOUNT PROFILE MANAGEMENT -----------------
app.get('/api/account', (req, res) => {
  const getSetting = (key, fallback) => {
    try {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return row ? row.value : fallback;
    } catch {
      return fallback;
    }
  };

  const trackCount = db.prepare('SELECT COUNT(*) as count FROM tracks').get().count;
  const playlistCount = db.prepare('SELECT COUNT(*) as count FROM playlists').get().count;
  const likedCount = db.prepare('SELECT COUNT(*) as count FROM tracks WHERE isLiked = 1').get().count;
  const pwd = getActivePassword();

  res.json({
    username: getSetting('accountUsername', 'Stebin Raj'),
    email: getSetting('accountEmail', 'stebin@spotify.local'),
    avatarColor: getSetting('accountAvatarColor', '#1db954'),
    streamingQuality: getSetting('streamingQuality', 'Very High (320 kbps)'),
    plan: 'Spotify Premium',
    isPasswordProtected: Boolean(pwd && pwd.length > 0),
    isEnvPasswordLocked: Boolean(APP_PASSWORD && APP_PASSWORD.trim().length > 0),
    trackCount,
    playlistCount,
    likedCount,
  });
});

app.post('/api/account', (req, res) => {
  const { username, email, avatarColor, streamingQuality } = req.body;

  const setSetting = (key, value) => {
    if (value !== undefined) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
    }
  };

  setSetting('accountUsername', username);
  setSetting('accountEmail', email);
  setSetting('accountAvatarColor', avatarColor);
  setSetting('streamingQuality', streamingQuality);

  res.json({ success: true });
});

app.post('/api/account/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const activePwd = getActivePassword();

  // If there's already an active password, currentPassword must match
  if (activePwd && currentPassword !== activePwd) {
    return res.status(401).json({ error: 'Current password does not match' });
  }

  if (!newPassword || newPassword.trim().length < 3) {
    return res.status(400).json({ error: 'New password must be at least 3 characters' });
  }

  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('appPassword', newPassword.trim());

  const token = generateToken();
  res.json({ success: true, message: 'Password updated successfully', token });
});

app.post('/api/account/remove-password', (req, res) => {
  const { currentPassword } = req.body;
  const activePwd = getActivePassword();

  if (APP_PASSWORD) {
    return res.status(400).json({ error: 'Password is enforced via server environment variable (APP_PASSWORD).' });
  }

  if (activePwd && currentPassword !== activePwd) {
    return res.status(401).json({ error: 'Current password does not match' });
  }

  db.prepare('DELETE FROM settings WHERE key = ?').run('appPassword');
  res.json({ success: true, message: 'Password protection removed. Server is now in open mode.' });
});

// Auth protection middleware for API
app.use('/api', (req, res, next) => {
  const activePwd = getActivePassword();
  // Free endpoints
  if (
    req.path === '/auth/status' ||
    req.path === '/auth/login' ||
    !activePwd
  ) {
    return next();
  }

  const token = req.headers['x-auth-token'] || req.query.token;
  if (checkTokenValid(token)) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized. Please unlock the web player.' });
});

// ----------------- TRACKS -----------------
app.get('/api/tracks', (req, res) => {
  const { q, sort = 'order', order = 'asc', genre, liked, album, artist } = req.query;

  let query = 'SELECT * FROM tracks WHERE 1=1';
  const params = [];

  if (q && q.trim()) {
    const searchTerm = `%${q.trim()}%`;
    query += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ? OR genre LIKE ?)';
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (liked === 'true' || liked === '1') {
    query += ' AND isLiked = 1';
  }

  if (genre) {
    query += ' AND genre LIKE ?';
    params.push(`%${genre}%`);
  }

  if (album) {
    query += ' AND album = ?';
    params.push(album);
  }

  if (artist) {
    query += ' AND (artist = ? OR albumArtist = ?)';
    params.push(artist, artist);
  }

  const validSorts = {
    order: 'COALESCE(trackNumber, rowid)',
    title: 'title COLLATE NOCASE',
    artist: 'artist COLLATE NOCASE',
    album: 'album COLLATE NOCASE',
    dateAdded: 'dateAdded',
    durationSec: 'durationSec',
    year: 'year',
    playCount: 'playCount',
    trackNumber: 'COALESCE(trackNumber, rowid)',
  };

  const sortCol = validSorts[sort] || 'COALESCE(trackNumber, rowid)';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortCol} ${sortOrder}`;

  const tracks = db.prepare(query).all(...params);
  res.json(tracks);
});

app.get('/api/tracks/:id', (req, res) => {
  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  res.json(track);
});

app.post('/api/tracks', (req, res) => {
  const { title, artist, album, audioUrl, albumArtPath, genre, year, durationSec } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Song title is required' });
  }
  if (!audioUrl || !audioUrl.trim()) {
    return res.status(400).json({ error: 'Audio URL is required' });
  }

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const now = new Date().toISOString();
  const cleanUrl = audioUrl.trim();
  const filePath = cleanUrl.split('/').pop() || `${id}.mp3`;

  try {
    const maxRow = db.prepare('SELECT MAX(trackNumber) as maxNum FROM tracks').get();
    const nextTrackNum = (maxRow && maxRow.maxNum ? maxRow.maxNum : 0) + 1;

    const insert = db.prepare(`
      INSERT INTO tracks (
        id, filePath, title, artist, album, albumArtist, genre, year,
        durationSec, trackNumber, albumArtPath, fileSize, format, originalUrl,
        mtime, dateAdded, isLiked
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);

    insert.run(
      id,
      filePath,
      title.trim(),
      (artist && artist.trim()) || 'Unknown Artist',
      (album && album.trim()) || 'Single',
      (artist && artist.trim()) || 'Unknown Artist',
      (genre && genre.trim()) || 'Pop',
      year ? parseInt(year, 10) : new Date().getFullYear(),
      durationSec ? parseFloat(durationSec) : 210,
      nextTrackNum,
      (albumArtPath && albumArtPath.trim()) || null,
      5000000,
      'mp3',
      cleanUrl,
      Date.now(),
      now,
      0
    );

    const newTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(id);
    res.status(201).json(newTrack);
  } catch (err) {
    console.error('Add track error:', err);
    res.status(500).json({ error: 'Failed to add track: ' + err.message });
  }
});

app.delete('/api/tracks/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM playlist_tracks WHERE trackId = ?').run(id);
    db.prepare('DELETE FROM tracks WHERE id = ?').run(id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tracks/:id/like', (req, res) => {
  const { id } = req.params;
  const track = db.prepare('SELECT isLiked FROM tracks WHERE id = ?').get(id);
  if (!track) return res.status(404).json({ error: 'Track not found' });

  const newLiked = track.isLiked === 1 ? 0 : 1;
  db.prepare('UPDATE tracks SET isLiked = ? WHERE id = ?').run(newLiked, id);
  res.json({ id, isLiked: newLiked });
});

app.post('/api/tracks/:id/played', (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();
  db.prepare('UPDATE tracks SET playCount = playCount + 1, lastPlayed = ? WHERE id = ?').run(now, id);
  res.json({ success: true });
});

// ----------------- ALBUMS -----------------
app.get('/api/albums', (req, res) => {
  const albums = db.prepare(`
    SELECT
      album as name,
      COALESCE(albumArtist, artist) as artist,
      MAX(year) as year,
      COUNT(*) as trackCount,
      SUM(durationSec) as totalDurationSec,
      MAX(albumArtPath) as albumArtPath
    FROM tracks
    WHERE album IS NOT NULL AND album != ''
    GROUP BY album, COALESCE(albumArtist, artist)
    ORDER BY album COLLATE NOCASE ASC
  `).all();
  res.json(albums);
});

app.get('/api/albums/:albumName', (req, res) => {
  const albumName = decodeURIComponent(req.params.albumName);
  const tracks = db.prepare(`
    SELECT * FROM tracks
    WHERE album = ?
    ORDER BY trackNumber ASC, title COLLATE NOCASE ASC
  `).all(albumName);

  if (tracks.length === 0) return res.status(404).json({ error: 'Album not found' });

  const albumInfo = {
    name: albumName,
    artist: tracks[0].albumArtist || tracks[0].artist,
    year: tracks[0].year,
    albumArtPath: tracks.find((t) => t.albumArtPath)?.albumArtPath || null,
    trackCount: tracks.length,
    totalDurationSec: tracks.reduce((sum, t) => sum + (t.durationSec || 0), 0),
    tracks,
  };

  res.json(albumInfo);
});

// ----------------- ARTISTS -----------------
app.get('/api/artists', (req, res) => {
  const artists = db.prepare(`
    SELECT
      artist as name,
      COUNT(*) as trackCount,
      COUNT(DISTINCT album) as albumCount,
      MAX(albumArtPath) as albumArtPath
    FROM tracks
    WHERE artist IS NOT NULL AND artist != ''
    GROUP BY artist
    ORDER BY artist COLLATE NOCASE ASC
  `).all();
  res.json(artists);
});

app.get('/api/artists/:artistName', (req, res) => {
  const artistName = decodeURIComponent(req.params.artistName);
  const tracks = db.prepare(`
    SELECT * FROM tracks
    WHERE artist = ? OR albumArtist = ?
    ORDER BY album COLLATE NOCASE ASC, trackNumber ASC, title COLLATE NOCASE ASC
  `).all(artistName, artistName);

  if (tracks.length === 0) return res.status(404).json({ error: 'Artist not found' });

  const artistInfo = {
    name: artistName,
    trackCount: tracks.length,
    albumCount: new Set(tracks.map((t) => t.album)).size,
    albumArtPath: tracks.find((t) => t.albumArtPath)?.albumArtPath || null,
    tracks,
  };

  res.json(artistInfo);
});

// ----------------- GENRES -----------------
app.get('/api/genres', (req, res) => {
  const rows = db.prepare(`
    SELECT genre, COUNT(*) as trackCount
    FROM tracks
    WHERE genre IS NOT NULL AND genre != ''
    GROUP BY genre
    ORDER BY trackCount DESC
  `).all();
  res.json(rows);
});

// ----------------- PLAYLISTS -----------------
app.get('/api/playlists', (req, res) => {
  const playlists = db.prepare(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.coverArt,
      p.createdAt,
      p.updatedAt,
      COUNT(pt.trackId) as trackCount,
      (SELECT t.albumArtPath FROM playlist_tracks pt2
       JOIN tracks t ON pt2.trackId = t.id
       WHERE pt2.playlistId = p.id AND t.albumArtPath IS NOT NULL
       LIMIT 1) as previewArt
    FROM playlists p
    LEFT JOIN playlist_tracks pt ON p.id = pt.playlistId
    GROUP BY p.id
    ORDER BY p.updatedAt DESC
  `).all();
  res.json(playlists);
});

app.post('/api/playlists', (req, res) => {
  const { name, description = '' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Playlist name is required' });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO playlists (id, name, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name.trim(), description.trim(), now, now);

  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
  res.status(201).json(playlist);
});

app.get('/api/playlists/:id', (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  const tracks = db.prepare(`
    SELECT t.*, pt.position, pt.addedAt
    FROM playlist_tracks pt
    JOIN tracks t ON pt.trackId = t.id
    WHERE pt.playlistId = ?
    ORDER BY pt.position ASC
  `).all(req.params.id);

  res.json({
    ...playlist,
    tracks,
    totalDurationSec: tracks.reduce((sum, t) => sum + (t.durationSec || 0), 0),
  });
});

app.patch('/api/playlists/:id', (req, res) => {
  const { name, description } = req.body;
  const now = new Date().toISOString();

  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push('name = ?');
    params.push(name.trim());
  }
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description.trim());
  }

  if (updates.length === 0) return res.json({ success: true });

  updates.push('updatedAt = ?');
  params.push(now);
  params.push(req.params.id);

  db.prepare(`UPDATE playlists SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  res.json(updated);
});

app.delete('/api/playlists/:id', (req, res) => {
  db.prepare('DELETE FROM playlist_tracks WHERE playlistId = ?').run(req.params.id);
  db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/playlists/:id/tracks', (req, res) => {
  const { trackId } = req.body;
  const playlistId = req.params.id;

  const playlist = db.prepare('SELECT id FROM playlists WHERE id = ?').get(playlistId);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(trackId);
  if (!track) return res.status(404).json({ error: 'Track not found' });

  const maxPosRow = db.prepare('SELECT MAX(position) as maxPos FROM playlist_tracks WHERE playlistId = ?').get(playlistId);
  const nextPos = maxPosRow && maxPosRow.maxPos !== null ? maxPosRow.maxPos + 1 : 0;
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO playlist_tracks (playlistId, trackId, position, addedAt)
      VALUES (?, ?, ?, ?)
    `).run(playlistId, trackId, nextPos, now);

    db.prepare('UPDATE playlists SET updatedAt = ? WHERE id = ?').run(now, playlistId);
    res.status(201).json({ success: true, position: nextPos });
  } catch (err) {
    res.json({ success: true, message: 'Track already in playlist' });
  }
});

app.delete('/api/playlists/:id/tracks/:trackId', (req, res) => {
  const { id: playlistId, trackId } = req.params;
  db.prepare('DELETE FROM playlist_tracks WHERE playlistId = ? AND trackId = ?').run(playlistId, trackId);
  db.prepare('UPDATE playlists SET updatedAt = ? WHERE id = ?').run(new Date().toISOString(), playlistId);
  res.json({ success: true });
});

app.put('/api/playlists/:id/reorder', (req, res) => {
  const { trackIds } = req.body;
  const playlistId = req.params.id;

  if (!Array.isArray(trackIds)) {
    return res.status(400).json({ error: 'trackIds array required' });
  }

  const updatePos = db.prepare('UPDATE playlist_tracks SET position = ? WHERE playlistId = ? AND trackId = ?');
  const reorderTx = db.transaction(() => {
    trackIds.forEach((tId, idx) => {
      updatePos.run(idx, playlistId, tId);
    });
  });

  reorderTx();
  db.prepare('UPDATE playlists SET updatedAt = ? WHERE id = ?').run(new Date().toISOString(), playlistId);
  res.json({ success: true });
});

// ----------------- SCANNER -----------------
app.get('/api/scan/status', (req, res) => {
  res.json(scanStatus);
});

app.post('/api/scan', async (req, res) => {
  const musicDir = getMusicDir();
  scanLibrary(musicDir, COVERS_DIR).catch((err) => {
    console.error('Library scan error:', err);
  });
  res.json({ message: 'Scan started', musicDir });
});

// ----------------- REMOTE DOWNLOADS -----------------
app.get('/api/samples', (req, res) => {
  res.json(SAMPLE_REMOTE_TRACKS);
});

app.get('/api/downloads', (req, res) => {
  res.json(Array.from(activeDownloads.values()));
});

app.get('/api/downloads/:id', (req, res) => {
  const download = activeDownloads.get(req.params.id);
  if (!download) return res.status(404).json({ error: 'Download not found' });
  res.json(download);
});

app.post('/api/tracks/from-url', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const downloadId = crypto.randomUUID();
  const musicDir = getMusicDir();

  downloadTrackFromUrl(downloadId, url.trim(), musicDir, COVERS_DIR).catch((err) => {
    console.error(`Download failed for ${url}:`, err);
  });

  res.status(202).json({
    message: 'Download initiated',
    downloadId,
  });
});

app.post('/api/tracks/import-samples', async (req, res) => {
  const musicDir = getMusicDir();
  const jobIds = [];

  for (const sample of SAMPLE_REMOTE_TRACKS) {
    const downloadId = crypto.randomUUID();
    jobIds.push({ downloadId, ...sample });
    downloadTrackFromUrl(downloadId, sample.url, musicDir, COVERS_DIR).catch((err) => {
      console.error(`Sample download failed: ${sample.title}`, err);
    });
  }

  res.status(202).json({
    message: 'Started importing cloud sample tracks',
    jobs: jobIds,
  });
});

// ----------------- SETTINGS & STATS -----------------
app.get('/api/settings', (req, res) => {
  const musicDir = getMusicDir();
  const trackCount = db.prepare('SELECT COUNT(*) as count FROM tracks').get().count;
  const albumCount = db.prepare('SELECT COUNT(DISTINCT album) as count FROM tracks').get().count;
  const artistCount = db.prepare('SELECT COUNT(DISTINCT artist) as count FROM tracks').get().count;
  const playlistCount = db.prepare('SELECT COUNT(*) as count FROM playlists').get().count;

  res.json({
    musicDir,
    trackCount,
    albumCount,
    artistCount,
    playlistCount,
    scanStatus,
  });
});

app.post('/api/settings', (req, res) => {
  const { musicDir } = req.body;
  if (!musicDir || !musicDir.trim()) {
    return res.status(400).json({ error: 'musicDir is required' });
  }

  const cleanDir = path.resolve(musicDir.trim());
  if (!fs.existsSync(cleanDir)) {
    return res.status(400).json({ error: `Directory does not exist: ${cleanDir}` });
  }

  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('musicDir', cleanDir);
  scanLibrary(cleanDir, COVERS_DIR).catch((err) => console.error(err));

  res.json({ success: true, musicDir: cleanDir });
});

// ----------------- STREAMING (RANGE SUPPORT) -----------------
app.get('/api/stream/:trackId', handleStream);

// Serve built frontend if exists
const clientDist = path.join(rootDir, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/covers')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// Start server on 0.0.0.0 for standalone / cloud hosting (not called inside Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`[Server] Spotify Streaming Server running on http://${HOST}:${PORT}`);
    console.log(`[Server] Music directory: ${getMusicDir()}`);
    console.log(`[Server] Covers directory: ${COVERS_DIR}`);
    if (APP_PASSWORD) {
      console.log(`[Server] 🔒 Single-user password protection is ENABLED.`);
    } else {
      console.log(`[Server] 🌐 Open mode (no password required). Set APP_PASSWORD to secure.`);
    }
  });
}

export default app;
