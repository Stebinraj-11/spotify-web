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
      {/* Spotify Purple/Pink Gradient Header */}
      <div className="p-6 md:p-8 bg-gradient-to-b from-indigo-700 via-purple-900 to-[#121212] flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl flex-shrink-0 flex items-center justify-center">
          <Heart className="w-24 h-24 fill-white text-white drop-shadow-lg" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-white/80 font-bold">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-6xl font-black text-white mt-1 leading-tight tracking-tight">
            Liked Songs
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-neutral-200 mt-4 font-medium">
            <span className="font-bold text-white">Personal Library</span>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
            {totalDuration > 0 && (
              <>
                <span>•</span>
                <span className="font-mono text-neutral-300">
                  {formatDuration(totalDuration)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action controls & Tracks list */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black flex items-center justify-center transition shadow-lg transform hover:scale-105"
            title="Play Liked Songs"
          >
            <Play className="w-7 h-7 fill-black ml-0.5" />
          </button>
          <button
            onClick={handleShuffleAll}
            disabled={tracks.length === 0}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-40"
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-neutral-500 text-sm">Loading liked songs...</div>
        ) : tracks.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 text-sm">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30 text-neutral-400" />
            Songs you like will appear here. Click the heart icon on any song to add it!
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
