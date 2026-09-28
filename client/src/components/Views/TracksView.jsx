import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import {
  Play,
  Shuffle,
  Music,
  ArrowUpDown,
  Search,
  Sparkles,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#1db954] font-black">
            Studio Library
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
            All Songs
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono tabular-nums">
            {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} • {formatDuration(totalDuration)} total listening
          </p>
        </div>

        {/* Play & Shuffle buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="group relative h-11 sm:h-12 pl-4 pr-5 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black font-extrabold text-xs sm:text-sm flex items-center gap-3 transition-all duration-200 shadow-[0_4px_24px_rgba(29,185,84,0.35)] active:scale-95"
            title="Play All"
          >
            <div className="w-7 h-7 rounded-full bg-black/15 flex items-center justify-center transition-transform group-hover:scale-110">
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            </div>
            <span>Play All</span>
          </button>
          <button
            onClick={handleShuffleAll}
            disabled={tracks.length === 0}
            className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition disabled:opacity-40 active:scale-90"
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search filter in view */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter songs..."
            className="w-full pl-10 pr-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]/50 transition"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <ArrowUpDown className="w-3 h-3 text-[#1db954]" />
            <span className="text-[11px] font-semibold text-neutral-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="order" className="bg-[#18181f]">Order (# 1..18)</option>
              <option value="title" className="bg-[#18181f]">Title (A-Z)</option>
              <option value="artist" className="bg-[#18181f]">Artist</option>
              <option value="durationSec" className="bg-[#18181f]">Duration</option>
              <option value="dateAdded" className="bg-[#18181f]">Date Added</option>
              <option value="album" className="bg-[#18181f]">Album</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-mono uppercase text-[10px] tracking-wider border border-white/[0.08] transition active:scale-95"
            title="Toggle sort direction"
          >
            {sortOrder}
          </button>
        </div>
      </div>

      {/* Tracks List Table */}
      {loading ? (
        <div className="py-24 text-center text-neutral-400 text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
          <span>Loading catalog tracks...</span>
        </div>
      ) : tracks.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 text-sm space-y-2">
          <Music className="w-12 h-12 mx-auto mb-2 opacity-30 text-neutral-500" />
          <p className="text-white font-bold">No songs found</p>
          <p className="text-xs text-neutral-400">No tracks match your current filter query.</p>
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
