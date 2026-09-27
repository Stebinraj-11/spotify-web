import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = path.resolve(__dirname, '..');

// Vercel Serverless Detection
export const IS_VERCEL = Boolean(process.env.VERCEL || process.env.NOW_REGION);

// Allow custom DATA_DIR for cloud persistent storage volumes (e.g. /data or /app/data)
// In Vercel serverless functions, the only writable directory is /tmp
export const DATA_DIR = IS_VERCEL
  ? '/tmp/spotify_data'
  : process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(rootDir, 'data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[Config] mkdir DATA_DIR note:', err.message);
  }
}

// Database path
export const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(DATA_DIR, 'library.db');

// If on Vercel or if DB doesn't exist in DATA_DIR, seed from root data/library.db or library.db
const sourceDbCandidates = [
  path.join(rootDir, 'data', 'library.db'),
  path.join(rootDir, 'library.db'),
];

if (!fs.existsSync(DB_PATH)) {
  for (const src of sourceDbCandidates) {
    if (fs.existsSync(src) && src !== DB_PATH) {
      try {
        fs.copyFileSync(src, DB_PATH);
        console.log(`[Config] Seeded database from ${src} to ${DB_PATH}`);
        break;
      } catch (err) {
        console.warn('[Config] DB seed note:', err.message);
      }
    }
  }
}

// Covers directory
export const COVERS_DIR = process.env.COVERS_DIR
  ? path.resolve(process.env.COVERS_DIR)
  : path.join(DATA_DIR, 'covers');

if (!fs.existsSync(COVERS_DIR)) {
  try {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

// Seed covers from bundle if in DATA_DIR/covers they don't exist
const sourceCoversDir = path.join(rootDir, 'data', 'covers');
if (fs.existsSync(sourceCoversDir) && sourceCoversDir !== COVERS_DIR) {
  try {
    const files = fs.readdirSync(sourceCoversDir);
    for (const f of files) {
      const src = path.join(sourceCoversDir, f);
      const dest = path.join(COVERS_DIR, f);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
    }
  } catch (err) {
    // ignore
  }
}

// Default Music directory
export const DEFAULT_MUSIC_DIR = process.env.MUSIC_DIR
  ? path.resolve(process.env.MUSIC_DIR)
  : path.join(DATA_DIR, 'music');

if (!fs.existsSync(DEFAULT_MUSIC_DIR)) {
  try {
    fs.mkdirSync(DEFAULT_MUSIC_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

export const PORT = parseInt(process.env.PORT || '5000', 10);
export const HOST = process.env.HOST || '0.0.0.0';
export const APP_PASSWORD = process.env.APP_PASSWORD || '';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'spotify-secret-key-change-me';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production' || IS_VERCEL;
