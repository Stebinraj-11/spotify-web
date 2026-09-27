import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  Play,
  Pause,
  Sparkles,
  Music2,
  CloudDownload,
  Disc3,
  Users,
  ChevronRight,
} from 'lucide-react';

export function HomeView({ onNavigate, onOpenUrlModal, onOpenSettings }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [recentTracks, setRecentTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    fetch('/api/tracks?sort=dateAdded&order=desc')
      .then((r) => r.json())
      .then((data) => setRecentTracks(data.slice(0, 8)))
      .catch(console.warn);

    fetch('/api/albums')
      .then((r) => r.json())
      .then((data) => setAlbums(data.slice(0, 6)))
      .catch(console.warn);

    fetch('/api/artists')
      .then((r) => r.json())
      .then((data) => setArtists(data.slice(0, 6)))
      .catch(console.warn);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePlayCard = (track, list) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, list);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Greeting */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {getGreeting()}
        </h1>
      </div>

      {/* Cloud & Remote Library Banner */}
      {recentTracks.length === 0 ? (
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-emerald-900/40 via-neutral-900 to-purple-900/30 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1db954]/20 text-[#1db954] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Self-Hosted Personal Music Streaming</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Your Library is Ready to Stream</h2>
            <p className="text-sm text-neutral-300">
              Add audio files from your local folder or import remote tracks from Cloudinary with 1 click to start enjoying your music.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={onOpenUrlModal}
              className="px-5 py-3 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm flex items-center gap-2 transition shadow-lg transform hover:scale-105"
            >
              <CloudDownload className="w-4 h-4" />
              <span>Import Cloud Tracks</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
            >
              Scan Local Folder
            </button>
          </div>
        </div>
      ) : null}

      {/* Quick Play Grid (Top 6 Recents) */}
      {recentTracks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentTracks.slice(0, 6).map((track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => handlePlayCard(track, recentTracks)}
                className="group flex items-center bg-white/5 hover:bg-white/10 rounded-md overflow-hidden cursor-pointer transition select-none relative"
              >
                <div className="w-16 h-16 bg-neutral-800 flex-shrink-0 flex items-center justify-center text-neutral-400">
                  {track.albumArtPath ? (
                    <img src={track.albumArtPath} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music2 className="w-6 h-6" />
                  )}
                </div>
                <div className="px-4 flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{track.title}</p>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>
                <button
                  className={`w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center mr-4 shadow-lg transition-all duration-200 transform ${
                    isThisPlaying
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
                  }`}
                >
                  {isThisPlaying ? (
                    <Pause className="w-5 h-5 fill-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Albums Section */}
      {albums.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Albums</h2>
            <button
              onClick={() => onNavigate('albums')}
              className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>Show all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.map((album, i) => (
              <div
                key={i}
                onClick={() => onNavigate('album-detail', { name: album.name })}
                className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-xl transition duration-300 cursor-pointer flex flex-col"
              >
                <div className="w-full aspect-square rounded-lg bg-neutral-800 overflow-hidden mb-3 relative shadow-md">
                  {album.albumArtPath ? (
                    <img src={album.albumArtPath} alt={album.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                      <Disc3 className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white truncate">{album.name}</h3>
                <p className="text-xs text-neutral-400 truncate mt-1">{album.artist}</p>
                <span className="text-[11px] text-neutral-500 font-mono mt-1">
                  {album.trackCount} {album.trackCount === 1 ? 'song' : 'songs'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artists Section */}
      {artists.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Artists</h2>
            <button
              onClick={() => onNavigate('artists')}
              className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>Show all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.map((artist, i) => (
              <div
                key={i}
                onClick={() => onNavigate('artist-detail', { name: artist.name })}
                className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-xl transition duration-300 cursor-pointer flex flex-col items-center text-center"
              >
                <div className="w-full aspect-square rounded-full bg-neutral-800 overflow-hidden mb-3 relative shadow-md">
                  {artist.albumArtPath ? (
                    <img src={artist.albumArtPath} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                      <Users className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white truncate w-full">{artist.name}</h3>
                <p className="text-xs text-neutral-400 truncate mt-1">Artist</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
