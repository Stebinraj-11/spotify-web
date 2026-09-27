# 🎵 Spotify - Personal Music Streaming Web App

A clean, personal music streaming web application designed for mobile and desktop, heavily inspired by Spotify's iconic UI/UX.

---

## 🌐 Online Hosting & Deployment Guide

This application is fully production-ready for **Vercel**, Docker, Render, Railway, Fly.io, or any VPS.

### Option 1: Deploy on Vercel (Recommended Serverless)

The repository includes pre-configured [`vercel.json`](./vercel.json) and [`api/index.js`](./api/index.js).

#### Method A: Via GitHub (Easiest)
1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/<your-username>/spotify-web-player.git
   git branch -M main
   git push -u origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** -> Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Leave settings as default (Framework Preset: **Vite**, Root Directory: `./`).
5. (Optional) In **Environment Variables**, add `APP_PASSWORD=your_password` to protect your player.
6. Click **Deploy**!

#### Method B: Via Vercel CLI
```bash
npx vercel
```

*How Vercel Works:*
- Frontend SPA is served from global edge CDN (`client/dist`).
- Backend REST API routes are handled by [`api/index.js`](./api/index.js) (Vercel Serverless Function).
- The pre-populated SQLite database with your 7 Cloudinary tracks is bundled and loaded into `/tmp`.
- Audio streams automatically redirect to Cloudinary CDN with zero bandwidth bottlenecks or 4.5MB payload limitations.

---

### Option 2: Deploy with Docker / Docker Compose (Recommended for VPS / Cloud)

Run with a single command on any VPS (DigitalOcean, Hetzner, Linode, AWS, etc.):

```bash
docker compose up -d --build
```

Your persistent data (SQLite database, album covers, and downloaded music files) will be safely stored in the `./data` directory on the host machine.

To enable password protection, uncomment or set `APP_PASSWORD` in `docker-compose.yml`:
```yaml
environment:
  - APP_PASSWORD=your_secure_password
```

---

### Option 2: Deploy to Render (render.com)

1. Push this repository to GitHub or GitLab.
2. In Render Dashboard, click **New +** -> **Blueprint**.
3. Select this repository. Render will automatically read [`render.yaml`](./render.yaml).
4. Set the optional `APP_PASSWORD` environment variable in the dashboard.
5. Deploy! A 5 GB persistent disk is automatically mounted at `/var/data` so all music and metadata persist across redeployments.

*Manual Web Service on Render:*
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Disk Mount Path:** `/var/data`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `PORT`: `5000`
  - `HOST`: `0.0.0.0`
  - `DATA_DIR`: `/var/data`
  - `APP_PASSWORD`: `(your optional password)`

---

### Option 3: Deploy to Railway (railway.app)

1. Create a new project on Railway from your GitHub repo.
2. Add a **Volume** mounted at `/app/data`.
3. Set Environment Variables:
   - `PORT`: `5000`
   - `HOST`: `0.0.0.0`
   - `DATA_DIR`: `/app/data`
   - `APP_PASSWORD`: `(your optional password)`
4. Railway will automatically build via `npm run build` and start with `npm start`.

---

### Option 4: Deploy to Fly.io

1. Initialize Fly: `fly launch`
2. Create persistent volume: `fly volumes create spotify_data --size 5`
3. In `fly.toml`, add:
```toml
[mounts]
  source = "spotify_data"
  destination = "/app/data"

[env]
  PORT = "5000"
  HOST = "0.0.0.0"
  DATA_DIR = "/app/data"
```
4. Deploy: `fly deploy`

---

## 🔒 Optional Single-User Password Protection

When hosting on a public domain or cloud URL:
- Set the `APP_PASSWORD` environment variable (e.g. `APP_PASSWORD=MySecretKey123`).
- When visitors access your URL, they will see a Spotify-styled unlock screen prompting for the server password.
- Once entered, a session token is stored in the browser, granting access to your personal music library and playback.
- If `APP_PASSWORD` is left blank or unset, the app runs in open mode (ideal for private local network use).

---

## ⚙️ Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port the web server listens on |
| `HOST` | `0.0.0.0` | Host IP binding (0.0.0.0 binds to all network interfaces) |
| `DATA_DIR` | `./data` | Directory where persistent files (`library.db`, `covers/`, `music/`) are stored |
| `MUSIC_DIR` | `<DATA_DIR>/music` | Custom audio files directory (optional) |
| `COVERS_DIR` | `<DATA_DIR>/covers` | Custom album artwork storage directory (optional) |
| `DB_PATH` | `<DATA_DIR>/library.db` | Custom SQLite database file path (optional) |
| `APP_PASSWORD` | *(empty)* | Optional password to protect the web player when hosted on the public internet |
| `SESSION_SECRET` | *(random)* | Secret string for auth token signing |

---

## 🛠 Local Development & Testing

### 1. Install Dependencies
```bash
npm install
```
*(The root postinstall script will automatically install `client` dependencies).*

### 2. Run Both Backend & Frontend in Dev Mode
```bash
npm run dev
```

### 3. Build & Run Single Production Server Locally
```bash
npm run build
npm start
```
Open **http://localhost:5000** in your browser.

---

## ✨ Features Implemented

- **Remote Track Downloader**: Paste any audio URL (.mp3, .m4a, .flac) or import the 7 sample Cloudinary songs with live progress.
- **Range-Supported Streaming**: HTTP RFC 7233 partial content (206) for instantaneous scrubbing and seeking.
- **Web Audio API Real-time DSP**: Live frequency spectrum visualizer and 3-band hardware equalizer (Bass, Mid, Treble).
- **Library Management**: Filter and sort by Title, Artist, Album, Date Added, and Duration.
- **Playlists & Liked Songs**: Create, rename, delete, and reorder playlists; one-click Liked Songs auto-playlist.
- **Queue Management**: Slide-out drawer with track reordering and jump controls.
- **Keyboard Shortcuts**: `Space` (Play/Pause), `ArrowRight`/`ArrowLeft` (Seek +/- 5s), `ArrowUp`/`ArrowDown` (Volume +/- 5%), `M` (Mute), `L` (Like).
