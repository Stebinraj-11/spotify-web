import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import { Play, Shuffle, Heart } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export function LikedSongsView({ playlists = [], onAddToPlaylist }) {
  const { playTrack, toggleShuffle } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedTracks = () => {
    setLoading(true);
    fetch('/api/tracks?liked=true&sort=dateAdded&order=desc')
      .then((r) => r.json())
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch liked tracks error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLikedTracks();
  }, []);

  const totalDuration = tracks.reduce((sum, t) => sum + (t.durationSec || 0), 0);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (tracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks, randomIndex);
    }
  };

  const handleLikeChange = (trackId, newLiked) => {
    if (!newLiked) {
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Studio Gradient Header */}
      <div className="p-5 sm:p-8 md:p-10 bg-gradient-to-b from-indigo-900/60 via-[#1e1530]/40 to-transparent flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-8 pb-6 sm:pb-8 relative overflow-hidden">
        {/* Liked Songs 3D Box */}
        <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-[0_20px_50px_rgba(112,0,255,0.3)] flex-shrink-0 flex items-center justify-center border border-white/20 relative group">
          <Heart className="w-20 h-20 sm:w-24 sm:h-24 fill-white text-white drop-shadow-lg group-hover:scale-110 transition duration-300" />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none rounded-2xl" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-pink-400 font-black">
            Personal Collection
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mt-1 leading-tight tracking-tight">
            Liked Songs
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs sm:text-sm text-neutral-300 mt-3 sm:mt-4 font-medium">
            <span className="font-bold text-white">Favorite Tracks</span>
            <span className="text-neutral-500">•</span>
            <span className="font-mono tabular-nums">{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
            {totalDuration > 0 && (
              <>
                <span className="text-neutral-500">•</span>
                <span className="font-mono tabular-nums text-neutral-400">
                  {formatDuration(totalDuration)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls & Tracks */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3.5">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black flex items-center justify-center transition-all duration-200 shadow-[0_4px_24px_rgba(29,185,84,0.35)] transform hover:scale-105 active:scale-95"
            title="Play Liked Songs"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
          <button
            onClick={handleShuffleAll}
            disabled={tracks.length === 0}
            className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition active:scale-90 disabled:opacity-40"
            title="Shuffle"
          >
            <Shuffle className="w-4.5 h-4.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center text-neutral-400">
            <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading favorite songs...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 text-sm space-y-3">
            <Heart className="w-12 h-12 mx-auto text-neutral-600 opacity-40" />
            <p className="text-white font-bold">Songs you like will appear here</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Save songs by tapping the heart icon anywhere across your library.
            </p>
          </div>
        ) : (
          <TrackList
            tracks={tracks}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
            onTrackLikeChange={handleLikeChange}
          />
        )}
      </div>
    </div>
  );
}
