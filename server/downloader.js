import fs from 'fs';
import path from 'path';
import { parseAndSaveTrack } from './scanner.js';

export const activeDownloads = new Map();

export const SAMPLE_REMOTE_TRACKS = [
  {
    title: "A Thousand Years",
    artist: "Christina Perri",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1789799490/Christina_Perri_-_A_Thousand_Years.mp3"
  },
  {
    title: "Another Love",
    artist: "Tom Odell",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1789799423/Tom_Odell_-_Another_Love_Lyrics.mp3"
  },
  {
    title: "Sneaky",
    artist: "Kevin MacLeod",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1789799388/sneaky-by-kevin-macleod.mp3"
  },
  {
    title: "Summertime Sadness",
    artist: "Lana Del Rey",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1789799351/Lana-Del-Rey-Summertime-Sadness-_RawPraise.ng.mp3"
  },
  {
    title: "I Think They Call This Love",
    artist: "Elliot James Reay",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1789799350/I_Think_They_Call_This_Love_-_Elliot_James_Reay_-_US-UK.mp3"
  },
  {
    title: "Snowman",
    artist: "Sia",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1789799286/Sia_-_Snowman.mp3"
  },
  {
    title: "Love Me Not",
    artist: "Ravyn Lenae",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1789799268/Love_Me_Not.mp3"
  },
  {
    title: "Superman",
    artist: "Eminem",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503355/eminem-s-song_eminem-superman.mp3"
  },
  {
    title: "Hypnotize",
    artist: "The Notorious B.I.G.",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503355/Hypnotize_-_2007_Remaster.mp3"
  },
  {
    title: "7 Years",
    artist: "Lukas Graham",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503351/7_Years_-_Lukas_Graham.mp3"
  },
  {
    title: "Still D.R.E.",
    artist: "Dr. Dre ft. Snoop Dogg",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503350/Still_D.R.E.mp3"
  },
  {
    title: "Fairytale",
    artist: "Alexander Rybak",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503349/fairytale_Alexander_rybak.mp3"
  },
  {
    title: "Thrift Shop",
    artist: "Macklemore & Ryan Lewis ft. Wanz",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503349/TMACKLEMORE_-Thrift_Shop.mp3"
  },
  {
    title: "Mask Off",
    artist: "Future",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503346/Mask_Off.mp3"
  },
  {
    title: "Sweater Weather",
    artist: "The Neighbourhood",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503345/The_Neighbourhood_-_Sweater_Weather_Official_Video.mp3"
  },
  {
    title: "Without Me",
    artist: "Eminem",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503343/Eminem_Without_Me_Official_Music_Video.mp3"
  },
  {
    title: "Daylight",
    artist: "David Kushner",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503339/Daylight.mp3"
  },
  {
    title: "The Real Slim Shady",
    artist: "Eminem",
    url: "https://res.cloudinary.com/fbombvjp/video/upload/v1790503337/Eminem_The_Real_Slim_Shady_Official_Video_Clean_Version.mp3"
  }
];

function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '_');
}

export async function downloadTrackFromUrl(downloadId, url, musicDir, coversDir) {
  const downloadState = {
    id: downloadId,
    url,
    filename: '',
    progress: 0,
    totalBytes: 0,
    receivedBytes: 0,
    status: 'downloading', // 'downloading' | 'processing' | 'completed' | 'failed'
    error: null,
    track: null,
  };
  activeDownloads.set(downloadId, downloadState);

  try {
    const urlObj = new URL(url);
    const rawFilename = path.basename(urlObj.pathname) || `audio_${Date.now()}.mp3`;
    let filename = decodeURIComponent(rawFilename);
    if (!path.extname(filename)) {
      filename += '.mp3';
    }
    filename = sanitizeFilename(filename);
    downloadState.filename = filename;

    const downloadsDir = path.join(musicDir, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const destPath = path.join(downloadsDir, filename);

    // Abort controller with 5-minute timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: HTTP ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    // Allow octet-stream, audio/*, or video/* (Cloudinary sometimes tags audio as video/upload)
    const isValidType =
      contentType.includes('audio') ||
      contentType.includes('octet-stream') ||
      contentType.includes('video') ||
      contentType === '';

    if (!isValidType) {
      throw new Error(`Invalid content-type: ${contentType}. Expected audio.`);
    }

    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
    downloadState.totalBytes = contentLength;

    const fileStream = fs.createWriteStream(destPath);
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      fileStream.write(Buffer.from(value));
      downloadState.receivedBytes += value.length;

      if (contentLength > 0) {
        downloadState.progress = Math.min(100, Math.round((downloadState.receivedBytes / contentLength) * 100));
      } else {
        // Unknown length, increment smoothly
        downloadState.progress = Math.min(99, Math.round(downloadState.receivedBytes / (1024 * 1024)));
      }
    }

    await new Promise((resolve, reject) => {
      fileStream.end((err) => (err ? reject(err) : resolve()));
    });

    downloadState.status = 'processing';
    downloadState.progress = 100;

    // Extract metadata and save track
    const track = await parseAndSaveTrack(destPath, coversDir, url);
    downloadState.status = 'completed';
    downloadState.track = track;

    return track;
  } catch (err) {
    console.error(`[Downloader] Download error for ${url}:`, err);
    downloadState.status = 'failed';
    downloadState.error = err.message || 'Download failed';
    throw err;
  }
}
