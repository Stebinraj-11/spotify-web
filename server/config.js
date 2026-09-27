import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = path.resolve(__dirname, '..');

// Allow custom DATA_DIR for cloud persistent storage volumes (e.g. /data or /app/data)
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(rootDir, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database path
export const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(DATA_DIR, 'library.db');

// If root library.db exists from previous local run and DATA_DIR library.db doesn't, migrate it!
const oldDbPath = path.join(rootDir, 'library.db');
if (fs.existsSync(oldDbPath) && !fs.existsSync(DB_PATH) && oldDbPath !== DB_PATH) {
  try {
    fs.copyFileSync(oldDbPath, DB_PATH);
    console.log(`[Config] Migrated existing database from ${oldDbPath} to ${DB_PATH}`);
  } catch (err) {
    console.warn('[Config] DB migration note:', err.message);
  }
}

// Covers directory
export const COVERS_DIR = process.env.COVERS_DIR
  ? path.resolve(process.env.COVERS_DIR)
  : path.join(DATA_DIR, 'covers');

if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

// Migrate any existing covers from root/covers to COVERS_DIR
const oldCoversDir = path.join(rootDir, 'covers');
if (fs.existsSync(oldCoversDir) && oldCoversDir !== COVERS_DIR) {
  try {
    const files = fs.readdirSync(oldCoversDir);
    for (const f of files) {
      const src = path.join(oldCoversDir, f);
      const dest = path.join(COVERS_DIR, f);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
    }
  } catch (err) {
    console.warn('[Config] Covers migration note:', err.message);
  }
}

// Default Music directory
export const DEFAULT_MUSIC_DIR = process.env.MUSIC_DIR
  ? path.resolve(process.env.MUSIC_DIR)
  : path.join(DATA_DIR, 'music');

if (!fs.existsSync(DEFAULT_MUSIC_DIR)) {
  fs.mkdirSync(DEFAULT_MUSIC_DIR, { recursive: true });
}

// Migrate any existing downloads from root/music to DEFAULT_MUSIC_DIR
const oldMusicDir = path.join(rootDir, 'music');
if (fs.existsSync(oldMusicDir) && oldMusicDir !== DEFAULT_MUSIC_DIR) {
  try {
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const sPath = path.join(src, entry.name);
        const dPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          copyRecursive(sPath, dPath);
        } else if (!fs.existsSync(dPath)) {
          fs.copyFileSync(sPath, dPath);
        }
      }
    };
    copyRecursive(oldMusicDir, DEFAULT_MUSIC_DIR);
  } catch (err) {
    console.warn('[Config] Music migration note:', err.message);
  }
}

export const PORT = parseInt(process.env.PORT || '5000', 10);
export const HOST = process.env.HOST || '0.0.0.0';
export const APP_PASSWORD = process.env.APP_PASSWORD || '';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'spotify-secret-key-change-me';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
