import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import {
  Play,
  Shuffle,
  Music,
  Search,
  Sparkles,
  ArrowUpDown,
  ListMusic,
  Heart,
  Clock,
  Disc3,
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export function HomeView({
  onNavigate,
  onOpenAccount,
  playlists = [],
  onAddToPlaylist,
}) {
  const { playTrack, toggleShuffle, currentTrack, isPlaying } = usePlayer();
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

  const getGreetingAura = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'from-amber-500/10 via-[#1db954]/10';
    if (hour < 18) return 'from-emerald-500/15 via-[#1db954]/10';
    return 'from-indigo-600/15 via-purple-600/10';
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

  const handleQuickPlay = (track, idx) => {
    playTrack(track, tracks, idx);
  };

  const totalDuration = tracks.reduce((sum, t) => sum + (t.durationSec || 0), 0);
  const quickJumpTracks = tracks.slice(0, 6);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300 relative">
      {/* Dynamic Background Atmosphere Glow */}
      <div className={`pointer-events-none absolute -top-12 left-0 right-0 h-64 bg-gradient-to-b ${getGreetingAura()} to-transparent blur-3xl -z-10 opacity-70`} />

      {/* Greeting Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#1db954] font-black px-2.5 py-0.5 rounded-full bg-[#1db954]/10 border border-[#1db954]/25">
              Personalized Audio Experience
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 flex items-center gap-2 font-medium">
            <span>{tracks.length} Mastered Tracks</span>
            <span>•</span>
            <span className="font-mono tabular-nums">{formatDuration(totalDuration)} total listening</span>
          </p>
        </div>

        {/* Master Playback Cluster with Button-in-Button CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="group relative h-11 sm:h-12 pl-4 pr-5 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black font-extrabold text-xs sm:text-sm flex items-center gap-3 transition-all duration-200 shadow-[0_4px_24px_rgba(29,185,84,0.35)] active:scale-95"
            title="Play library from start (#1)"
          >
            <div className="w-7 h-7 rounded-full bg-black/15 flex items-center justify-center transition-transform group-hover:scale-110">
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            </div>
            <span>Play Library</span>
          </button>

          <button
            onClick={handleShuffleAll}
            disabled={tracks.length === 0}
            className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition active:scale-90 disabled:opacity-40 shadow-sm"
            title="Shuffle play"
          >
            <Shuffle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {/* Bento Quick-Play Highlights Grid (Signature Spotify 6-Card Grid) */}
      {quickJumpTracks.length > 0 && !searchFilter && (
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
            Quick Jump
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {quickJumpTracks.map((track, idx) => {
              const isCurrent = currentTrack && currentTrack.id === track.id;
              const isRowPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => handleQuickPlay(track, idx)}
                  className={`group relative flex items-center gap-3 p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 cursor-pointer overflow-hidden shadow-sm select-none ${
                    isCurrent ? 'bg-white/[0.08] border-[#1db954]/30' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0 relative shadow-md">
                    {track.albumArtPath ? (
                      <img
                        src={track.albumArtPath}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400">
                        <Disc3 className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pr-12">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>

                  {/* Floating Green Play Button on Hover */}
                  <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 shadow-xl">
                    <button
                      className="w-9 h-9 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-lg active:scale-90"
                      title={isRowPlaying ? 'Pause' : 'Play'}
                    >
                      {isRowPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <div className="w-0.5 bg-black animate-eq-1 h-2" />
                          <div className="w-0.5 bg-black animate-eq-2 h-3" />
                          <div className="w-0.5 bg-black animate-eq-3 h-1.5" />
                        </div>
                      ) : (
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter, Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter tracks or artists..."
            className="w-full pl-10 pr-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]/50 transition"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <ArrowUpDown className="w-3 h-3 text-[#1db954]" />
            <span className="text-[11px] font-semibold text-neutral-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="order" className="bg-[#18181f]">Track Order (# 1..18)</option>
              <option value="title" className="bg-[#18181f]">Title (A-Z)</option>
              <option value="artist" className="bg-[#18181f]">Artist</option>
              <option value="durationSec" className="bg-[#18181f]">Duration</option>
              <option value="dateAdded" className="bg-[#18181f]">Recently Added</option>
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

      {/* Main Track Table Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {searchFilter ? `Search Results for "${searchFilter}"` : 'Library Songs'}
          </h2>
          <span className="text-xs text-neutral-400 font-mono tabular-nums">
            {tracks.length} songs
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-neutral-400 text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
            <span>Loading library audio...</span>
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 text-sm space-y-3">
            <Music className="w-12 h-12 mx-auto text-neutral-600 opacity-40" />
            <p className="font-semibold text-white">No songs found</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchFilter ? 'No songs match your search query.' : 'No songs available in your library.'}
            </p>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold border border-white/10"
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
    </div>
  );
}
