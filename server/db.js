import Database from 'better-sqlite3';
import { DB_PATH, DEFAULT_MUSIC_DIR } from './config.js';

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency and performance
try {
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
} catch (err) {
  console.warn('[DB] SQLite PRAGMA note:', err.message);
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      filePath TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      albumArtist TEXT,
      genre TEXT,
      year INTEGER,
      durationSec REAL DEFAULT 0,
      trackNumber INTEGER,
      albumArtPath TEXT,
      fileSize INTEGER,
      format TEXT,
      originalUrl TEXT,
      mtime INTEGER,
      dateAdded TEXT NOT NULL,
      isLiked INTEGER DEFAULT 0,
      playCount INTEGER DEFAULT 0,
      lastPlayed TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);
    CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
    CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album);
    CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
    CREATE INDEX IF NOT EXISTS idx_tracks_isLiked ON tracks(isLiked);

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      coverArt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlistId TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
      trackId TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      addedAt TEXT NOT NULL,
      UNIQUE(playlistId, trackId)
    );

    CREATE INDEX IF NOT EXISTS idx_playlist_tracks ON playlist_tracks(playlistId, position);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default settings
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');

  if (!getSetting.get('musicDir')) {
    setSetting.run('musicDir', DEFAULT_MUSIC_DIR);
  }
}
