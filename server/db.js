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
  {
    id: 'f82054bc1b5638c1',
    filePath: 'eminem-s-song_eminem-superman.mp3',
    title: 'Superman',
    artist: 'Eminem',
    album: 'The Eminem Show',
    albumArtist: 'Eminem',
    genre: 'Hip-Hop',
    year: 2002,
    durationSec: 350.35,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 5607362,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503355/eminem-s-song_eminem-superman.mp3',
    isLiked: 1,
  },
  {
    id: 'b98c392fa9418652',
    filePath: 'Hypnotize_-_2007_Remaster.mp3',
    title: 'Hypnotize',
    artist: 'The Notorious B.I.G.',
    album: 'Life After Death',
    albumArtist: 'The Notorious B.I.G.',
    genre: 'Hip-Hop',
    year: 1997,
    durationSec: 230.01,
    trackNumber: null,
    albumArtPath: '/covers/2d1323023730f35871761acbd0d72ad6.jpg',
    fileSize: 9213426,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503355/Hypnotize_-_2007_Remaster.mp3',
    isLiked: 1,
  },
  {
    id: 'c12d4a57f89b3421',
    filePath: '7_Years_-_Lukas_Graham.mp3',
    title: '7 Years',
    artist: 'Lukas Graham',
    album: 'Lukas Graham',
    albumArtist: 'Lukas Graham',
    genre: 'Pop',
    year: 2015,
    durationSec: 235.23,
    trackNumber: null,
    albumArtPath: '/covers/a44be4aa5b91372b4dcb918d143222f6.png',
    fileSize: 3897387,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503351/7_Years_-_Lukas_Graham.mp3',
    isLiked: 0,
  },
  {
    id: 'e4590bb8d21c47ea',
    filePath: 'Still_D.R.E.mp3',
    title: 'Still D.R.E.',
    artist: 'Dr. Dre ft. Snoop Dogg',
    album: '2001',
    albumArtist: 'Dr. Dre',
    genre: 'Hip-Hop',
    year: 1999,
    durationSec: 270.08,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 6482546,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503350/Still_D.R.E.mp3',
    isLiked: 1,
  },
  {
    id: 'd92a14e6b78c9032',
    filePath: 'fairytale_Alexander_rybak.mp3',
    title: 'Fairytale',
    artist: 'Alexander Rybak',
    album: 'Fairytales',
    albumArtist: 'Alexander Rybak',
    genre: 'Folk Pop',
    year: 2009,
    durationSec: 184.37,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 3130759,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503349/fairytale_Alexander_rybak.mp3',
    isLiked: 0,
  },
  {
    id: 'a718293cde458129',
    filePath: 'TMACKLEMORE_-Thrift_Shop.mp3',
    title: 'Thrift Shop',
    artist: 'Macklemore & Ryan Lewis ft. Wanz',
    album: 'The Heist',
    albumArtist: 'Macklemore & Ryan Lewis',
    genre: 'Hip-Hop',
    year: 2012,
    durationSec: 237.43,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 6763593,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503349/TMACKLEMORE_-Thrift_Shop.mp3',
    isLiked: 0,
  },
  {
    id: 'b62940af71829e51',
    filePath: 'Mask_Off.mp3',
    title: 'Mask Off',
    artist: 'Future',
    album: 'FUTURE',
    albumArtist: 'Future',
    genre: 'Trap',
    year: 2017,
    durationSec: 205.04,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 4921468,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503346/Mask_Off.mp3',
    isLiked: 1,
  },
  {
    id: '984102bc736a5120',
    filePath: 'The_Neighbourhood_-_Sweater_Weather_Official_Video.mp3',
    title: 'Sweater Weather',
    artist: 'The Neighbourhood',
    album: 'I Love You.',
    albumArtist: 'The Neighbourhood',
    genre: 'Alternative Rock',
    year: 2013,
    durationSec: 252.47,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 6059989,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503345/The_Neighbourhood_-_Sweater_Weather_Official_Video.mp3',
    isLiked: 1,
  },
  {
    id: 'ca481029df6178a3',
    filePath: 'Eminem_Without_Me_Official_Music_Video.mp3',
    title: 'Without Me',
    artist: 'Eminem',
    album: 'The Eminem Show',
    albumArtist: 'Eminem',
    genre: 'Hip-Hop',
    year: 2002,
    durationSec: 297.65,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 8871597,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503343/Eminem_Without_Me_Official_Music_Video.mp3',
    isLiked: 1,
  },
  {
    id: 'e1029348bc7192a5',
    filePath: 'Daylight.mp3',
    title: 'Daylight',
    artist: 'David Kushner',
    album: 'Daylight',
    albumArtist: 'David Kushner',
    genre: 'Indie Pop',
    year: 2023,
    durationSec: 213.11,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 3179482,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503339/Daylight.mp3',
    isLiked: 0,
  },
  {
    id: 'f938201a47b19283',
    filePath: 'Eminem_The_Real_Slim_Shady_Official_Video_Clean_Version.mp3',
    title: 'The Real Slim Shady',
    artist: 'Eminem',
    album: 'The Marshall Mathers LP',
    albumArtist: 'Eminem',
    genre: 'Hip-Hop',
    year: 2000,
    durationSec: 268.08,
    trackNumber: null,
    albumArtPath: null,
    fileSize: 9343677,
    format: 'mp3',
    originalUrl: 'https://res.cloudinary.com/fbombvjp/video/upload/v1790503337/Eminem_The_Real_Slim_Shady_Official_Video_Clean_Version.mp3',
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

  // Seed default tracks (INSERT OR IGNORE keeps existing database data intact)
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

    // Seed a starter playlist if none exists
    const playlistCount = db.prepare('SELECT COUNT(*) as c FROM playlists').get().c;
    if (playlistCount === 0) {
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
    }

    // Ensure all tracks have sequential trackNumber order (1..18+)
    const allTracks = db.prepare('SELECT rowid, id FROM tracks ORDER BY rowid ASC').all();
    const updateStmt = db.prepare('UPDATE tracks SET trackNumber = ? WHERE id = ?');
    allTracks.forEach((t, idx) => updateStmt.run(idx + 1, t.id));
  });

  try {
    seedTx();
    console.log('[DB] Synchronized seed tracks');
  } catch (err) {
    console.warn('[DB] Seed error:', err.message);
  }
}
