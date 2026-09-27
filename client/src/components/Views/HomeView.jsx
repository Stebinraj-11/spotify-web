import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import {
  Play,
  Shuffle,
  Music,
  Plus,
  Search,
  Sparkles,
  ArrowUpDown,
  ListMusic,
  Heart,
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export function HomeView({
  onNavigate,
  onOpenAccount,
  onOpenAddSong,
  playlists = [],
  onAddToPlaylist,
}) {
  const { playTrack, toggleShuffle } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');

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
        console.error('Fetch home tracks error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTracks();
  }, [sortBy, sortOrder, searchFilter]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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

  const totalDuration = tracks.reduce((sum, t) => sum + (t.durationSec || 0), 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
            <span>{getGreeting()}</span>
            <span>•</span>
            <span className="text-[#1db954]">{tracks.length} Songs</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
            All Songs
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Order-wise music library • {formatDuration(totalDuration)} total listening
          </p>
        </div>

        {/* Action Buttons: Play All, Shuffle, + Add Song */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg active:scale-95"
            title="Play from start (#1)"
          >
            <Play className="w-5 h-5 fill-black ml-0.5" />
            <span>Play All</span>
          </button>

          <button
            onClick={handleShuffleAll}
            disabled={tracks.length === 0}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-40 active:scale-95"
            title="Shuffle play"
          >
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenAddSong}
            className="h-11 sm:h-12 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 border border-white/10"
            title="Add Song"
          >
            <Plus className="w-4 h-4 text-[#1db954]" />
            <span>Add Song</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Search input filter */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search all songs or artists..."
            className="w-full pl-10 pr-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] transition"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-neutral-400">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#1db954]"
          >
            <option value="order">Order (# 1..18)</option>
            <option value="title">Title (A-Z)</option>
            <option value="artist">Artist</option>
            <option value="durationSec">Duration</option>
            <option value="dateAdded">Recently Added</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono uppercase text-[10px] border border-white/10"
          >
            {sortOrder}
          </button>
        </div>
      </div>

      {/* Songs List (Rendered cleanly order-wise) */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-[#1db954] border-t-transparent animate-spin mx-auto mb-3" />
          <span>Loading songs...</span>
        </div>
      ) : tracks.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 text-sm space-y-3">
          <Music className="w-12 h-12 mx-auto text-neutral-600" />
          <p className="font-semibold text-white">No songs found</p>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchFilter ? 'No songs match your search query.' : 'Click "Add Song" above to add your favorite tracks.'}
          </p>
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Clear Search
            </button>
          )}
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
