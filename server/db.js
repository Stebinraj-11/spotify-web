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

const DEFAULT_SEED_TRACKS = [
  {
    id: '549c296b26bddb49',
    filePath: 'sneaky-by-kevin-macleod.mp3',
    title: 'Sneaky',
    artist: 'Kevin MacLeod',
    album: 'Royalty Free',
    albumArtist: 'Kevin MacLeod',
    genre: 'Classical',
    year: 2010,
    durationSec: 150.9,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 6038494,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1789799388/sneaky-by-kevin-macleod.mp3',
    isLiked: 0,
  },
  {
    id: 'bfb115d4ca226de8',
    filePath: 'Love_Me_Not.mp3',
    title: 'Love Me Not',
    artist: 'Ravyn Lenae',
    album: 'Singles & Unknown',
    albumArtist: 'Ravyn Lenae',
    genre: 'R&B',
    year: 2024,
    durationSec: 209.4,
    trackNumber: null,
    albumArtPath: '/covers/aa6b47db12ea23354c4287847cd71d16.jpg',
    fileSize: 3386617,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1789799268/Love_Me_Not.mp3',
    isLiked: 0,
  },
  {
    id: '5e096f1789dc716c',
    filePath: 'Sia_-_Snowman.mp3',
    title: 'Snowman',
    artist: 'Sia',
    album: 'Singles & Unknown',
    albumArtist: 'Sia',
    genre: 'Pop',
    year: 2017,
    durationSec: 168.2,
    trackNumber: null,
    albumArtPath: '/covers/1948bc6f1625a5fb209a21a9f7209b78.jpg',
    fileSize: 4168742,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1789799286/Sia_-_Snowman.mp3',
    isLiked: 0,
  },
  {
    id: '9b502910d72539fb',
    filePath: 'Christina_Perri_-_A_Thousand_Years.mp3',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    album: 'The Twilight Saga',
    albumArtist: 'Christina Perri',
    genre: 'Pop',
    year: 2011,
    durationSec: 288,
    trackNumber: 1,
    albumArtPath: null,
    fileSize: 5087534,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1789799490/Christina_Perri_-_A_Thousand_Years.mp3',
    isLiked: 1,
  },
  {
    id: '69938eb7efc47eca',
    filePath: 'I_Think_They_Call_This_Love_-_Elliot_James_Reay_-_US-UK.mp3',
    title: 'I Think They Call This Love',
    artist: 'Elliot James Reay',
    album: 'Singles & Unknown',
    albumArtist: 'Elliot James Reay',
    genre: 'Retro Pop',
    year: 2024,
    durationSec: 193.7,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 4651563,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1789799350/I_Think_They_Call_This_Love_-_Elliot_James_Reay_-_US-UK.mp3',
    isLiked: 0,
  },
  {
    id: 'b81b60e6a77802b5',
    filePath: 'Lana-Del-Rey-Summertime-Sadness-_RawPraise.ng.mp3',
    title: 'Summertime Sadness',
    artist: 'Lana Del Rey',
    album: 'Born to Die',
    albumArtist: 'Lana Del Rey',
    genre: 'Alternative',
    year: 2012,
    durationSec: 265.5,
    trackNumber: 1,
    albumArtPath: '/covers/668a68d373700a55678b9cec316c83af.jpg',
    fileSize: 4365000,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1789799351/Lana-Del-Rey-Summertime-Sadness-_RawPraise.ng.mp3',
    isLiked: 1,
  },
  {
    id: '893ca588b316c585',
    filePath: 'Tom_Odell_-_Another_Love_Lyrics.mp3',
    title: 'Another Love',
    artist: 'Tom Odell',
    album: 'Long Way Down',
    albumArtist: 'Tom Odell',
    genre: 'Indie Pop',
    year: 2013,
    durationSec: 241.6,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 5798693,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1789799423/Tom_Odell_-_Another_Love_Lyrics.mp3',
    isLiked: 1,
  },
];

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

  // Seed default tracks if database is brand new / empty
  const count = db.prepare('SELECT COUNT(*) as c FROM tracks').get().c;
  if (count === 0) {
    const insertTrack = db.prepare(`
      INSERT OR IGNORE INTO tracks (
        id, filePath, title, artist, album, albumArtist, genre, year,
        durationSec, trackNumber, albumArtPath, fileSize, format, originalUrl,
        mtime, dateAdded, isLiked
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);

    const now = new Date().toISOString();
    const seedTx = db.transaction(() => {
      for (const t of DEFAULT_SEED_TRACKS) {
        insertTrack.run(
          t.id,
          t.filePath,
          t.title,
          t.artist,
          t.album,
          t.albumArtist,
          t.genre,
          t.year,
          t.durationSec,
          t.trackNumber,
          t.albumArtPath,
          t.fileSize,
          t.format,
          t.originalUrl,
          Date.now(),
          now,
          t.isLiked || 0
        );
      }

      // Seed a starter playlist
      const plId = 'chill-vibes-seed';
      db.prepare(`
        INSERT OR IGNORE INTO playlists (id, name, description, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(plId, 'Chill Vibes', 'Personal favorite tracks', now, now);

      db.prepare(`
        INSERT OR IGNORE INTO playlist_tracks (playlistId, trackId, position, addedAt)
        VALUES (?, ?, ?, ?)
      `).run(plId, '9b502910d72539fb', 0, now);

      db.prepare(`
        INSERT OR IGNORE INTO playlist_tracks (playlistId, trackId, position, addedAt)
        VALUES (?, ?, ?, ?)
      `).run(plId, 'b81b60e6a77802b5', 1, now);
    });

    try {
      seedTx();
      console.log('[DB] Seeded initial tracks and playlist');
    } catch (err) {
      console.warn('[DB] Seed error:', err.message);
    }
  }
}
