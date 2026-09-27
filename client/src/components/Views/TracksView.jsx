import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import {
  Play,
  Shuffle,
  Music,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export function TracksView({ playlists = [], onAddToPlaylist }) {
  const { playTrack, toggleShuffle } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTracks = () => {
    setLoading(true);
    let url = `/api/tracks?sort=${sortBy}&order=${sortOrder}`;
    if (searchFilter.trim()) {
      url += `&q=${encodeURIComponent(searchFilter.trim())}`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTracks(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch tracks error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTracks();
  }, [sortBy, sortOrder, searchFilter]);

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

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Library
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-0.5">
            All Songs
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} • {formatDuration(totalDuration)}
          </p>
        </div>

        {/* Play & Shuffle buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg active:scale-95"
            title="Play All"
          >
            <Play className="w-5 h-5 fill-black ml-0.5" />
            <span>Play All</span>
          </button>
          <button
            onClick={handleShuffleAll}
            disabled={tracks.length === 0}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-40 active:scale-95"
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Search filter in view */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter songs..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954]"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-neutral-400">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-900 border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-[#1db954]"
          >
            <option value="order">Order (# 1..18)</option>
            <option value="title">Title (A-Z)</option>
            <option value="artist">Artist</option>
            <option value="durationSec">Duration</option>
            <option value="dateAdded">Date Added</option>
            <option value="album">Album</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white font-mono uppercase text-[10px]"
          >
            {sortOrder}
          </button>
        </div>
      </div>

      {/* Tracks List Table */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm">Loading songs...</div>
      ) : tracks.length === 0 ? (
        <div className="py-20 text-center text-neutral-500 text-sm">
          <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No songs found.
        </div>
      ) : (
        <TrackList
          tracks={tracks}
          playlists={playlists}
          onAddToPlaylist={onAddToPlaylist}
        />
      )}
    </div>
  );
}
