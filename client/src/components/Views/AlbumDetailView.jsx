import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import { Play, Shuffle, Disc3, ArrowLeft, Clock } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export function AlbumDetailView({ albumName, onNavigate, playlists = [], onAddToPlaylist }) {
  const { playTrack, toggleShuffle } = usePlayer();
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/albums/${encodeURIComponent(albumName)}`)
      .then((r) => r.json())
      .then((data) => {
        setAlbumData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch album detail error:', err);
        setLoading(false);
      });
  }, [albumName]);

  if (loading) {
    return (
      <div className="py-24 text-center text-neutral-400">
        <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading album master...</p>
      </div>
    );
  }

  if (!albumData) {
    return (
      <div className="p-8 text-center text-neutral-400 space-y-4">
        <p className="text-white font-bold">Album not found.</p>
        <button
          onClick={() => onNavigate('albums')}
          className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 rounded-full text-white text-xs font-semibold"
        >
          Return to Albums
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (albumData.tracks && albumData.tracks.length > 0) {
      playTrack(albumData.tracks[0], albumData.tracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (albumData.tracks && albumData.tracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * albumData.tracks.length);
      playTrack(albumData.tracks[randomIndex], albumData.tracks, randomIndex);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Header with Cinematic Studio Lighting */}
      <div className="p-5 sm:p-8 md:p-10 bg-gradient-to-b from-[#2a2438] via-[#16161c] to-transparent flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-8 pb-6 sm:pb-8 relative overflow-hidden">
        {/* Mobile Back Button */}
        <button
          onClick={() => onNavigate('albums')}
          className="self-start sm:hidden p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* 3D Vinyl Album Cover Box */}
        <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-2xl bg-neutral-900 border border-white/[0.12] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex-shrink-0 flex items-center justify-center relative group">
          {albumData.albumArtPath ? (
            <img
              src={albumData.albumArtPath}
              alt={albumData.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <Disc3 className="w-20 h-20 text-neutral-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
        </div>

        {/* Album Meta */}
        <div className="flex-1 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#1db954] font-black">
            Studio Album
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mt-1 leading-tight tracking-tight">
            {albumData.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs sm:text-sm text-neutral-300 mt-3 sm:mt-4 font-medium">
            <span
              onClick={() => onNavigate('artist-detail', { name: albumData.artist })}
              className="text-white hover:text-[#1db954] cursor-pointer font-bold transition underline sm:no-underline sm:hover:underline"
            >
              {albumData.artist}
            </span>
            {albumData.year && (
              <>
                <span className="text-neutral-500">•</span>
                <span className="font-mono">{albumData.year}</span>
              </>
            )}
            <span className="text-neutral-500">•</span>
            <span className="font-mono tabular-nums">
              {albumData.trackCount} {albumData.trackCount === 1 ? 'song' : 'songs'}
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400 font-mono tabular-nums">
              {formatDuration(albumData.totalDurationSec)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls & Track Table */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3.5">
          <button
            onClick={handlePlayAll}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center transition-all duration-200 shadow-[0_4px_24px_rgba(29,185,84,0.35)] transform hover:scale-105 active:scale-95"
            title="Play Album"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
          <button
            onClick={handleShuffleAll}
            className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition active:scale-90"
            title="Shuffle Album"
          >
            <Shuffle className="w-4.5 h-4.5" />
          </button>
        </div>

        <TrackList
          tracks={albumData.tracks}
          showAlbum={false}
          playlists={playlists}
          onAddToPlaylist={onAddToPlaylist}
        />
      </div>
    </div>
  );
}
