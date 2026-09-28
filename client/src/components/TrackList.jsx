import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Clock,
  Music2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ListPlus,
  ChevronRight,
} from 'lucide-react';
import { formatDuration, formatDate } from '../utils/formatters';

export function TrackList({
  tracks = [],
  playlistId = null,
  onRemoveFromPlaylist = null,
  onMoveTrack = null,
  playlists = [],
  onAddToPlaylist = null,
  showAlbum = true,
  showDateAdded = true,
  onTrackLikeChange = null,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, addToQueue } = usePlayer();
  const [activeMenuTrackId, setActiveMenuTrackId] = useState(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const handleRowClick = (track, index) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks, index);
    }
  };

  const handleLike = async (e, trackId) => {
    e.stopPropagation();
    const newLiked = await toggleLike(trackId);
    if (onTrackLikeChange) {
      onTrackLikeChange(trackId, newLiked);
    }
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[36px_1fr_auto] md:grid-cols-[36px_4fr_3fr_2fr_minmax(120px,1fr)] gap-2.5 md:gap-4 px-3 md:px-4 py-2.5 border-b border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-neutral-400 select-none items-center">
        <span className="text-center font-mono tabular-nums text-neutral-400">#</span>
        <span>Title</span>
        {showAlbum && <span className="hidden md:block">Album</span>}
        {showDateAdded && <span className="hidden md:block">Date Added</span>}
        <div className="flex items-center justify-end gap-2 pr-3">
          <Clock className="w-3.5 h-3.5 hidden sm:block text-neutral-400" />
        </div>
      </div>

      {/* Track Rows */}
      <div className="space-y-1 mt-1.5">
        {tracks.map((track, index) => {
          const isCurrent = currentTrack && currentTrack.id === track.id;
          const isRowPlaying = isCurrent && isPlaying;
          const displayOrder = track.trackNumber || (index + 1);

          return (
            <div
              key={`${track.id}-${index}`}
              onClick={() => handleRowClick(track, index)}
              className={`group flex items-center md:grid md:grid-cols-[36px_4fr_3fr_2fr_minmax(120px,1fr)] gap-2.5 md:gap-4 px-3 md:px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer select-none active:scale-[0.99] border ${
                isCurrent
                  ? 'bg-[#1db954]/[0.08] border-[#1db954]/25 shadow-[inset_0_1px_1px_rgba(29,185,84,0.15)]'
                  : 'border-transparent hover:bg-white/[0.05] hover:border-white/[0.06]'
              }`}
            >
              {/* Column 1: Order (#) or Animated Equalizer or Hover Play */}
              <div className="w-9 flex-shrink-0 flex items-center justify-center text-xs font-mono tabular-nums text-neutral-400">
                <span className="group-hover:hidden">
                  {isRowPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <div className="w-0.5 bg-[#1db954] animate-eq-1 h-2" />
                      <div className="w-0.5 bg-[#1db954] animate-eq-2 h-3.5" />
                      <div className="w-0.5 bg-[#1db954] animate-eq-3 h-1.5" />
                    </div>
                  ) : isCurrent ? (
                    <span className="text-[#1db954] font-black">{displayOrder}</span>
                  ) : (
                    <span>{displayOrder}</span>
                  )}
                </span>
                <button
                  className="hidden group-hover:flex items-center justify-center text-white active:scale-90 transition"
                  title={isRowPlaying ? 'Pause' : 'Play'}
                >
                  {isRowPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  )}
                </button>
              </div>

              {/* Column 2: Cover + Title + Artist */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1 md:flex-initial pr-2">
                <div className="w-10 h-10 md:w-10 md:h-10 rounded-lg bg-neutral-800 border border-white/[0.06] overflow-hidden flex-shrink-0 relative shadow-sm group-hover:shadow-md transition">
                  {track.albumArtPath ? (
                    <img
                      src={track.albumArtPath}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400">
                      <Music2 className="w-4 h-4" />
                    </div>
                  )}
                  {isRowPlaying && (
                    <div className="md:hidden absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-[#1db954] animate-eq-1 h-2" />
                        <div className="w-0.5 bg-[#1db954] animate-eq-2 h-3" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs md:text-sm font-semibold truncate tracking-tight ${
                      isCurrent ? 'text-[#1db954]' : 'text-white group-hover:text-white'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5 group-hover:text-neutral-300">
                    {track.artist}
                  </p>
                </div>
              </div>

              {/* Column 3: Album (Hidden on mobile) */}
              {showAlbum && (
                <div className="hidden md:block text-xs text-neutral-400 truncate pr-2 group-hover:text-neutral-300">
                  {track.album || 'Single'}
                </div>
              )}

              {/* Column 4: Date Added (Hidden on mobile) */}
              {showDateAdded && (
                <div className="hidden md:block text-[11px] text-neutral-400 font-mono tabular-nums">
                  {formatDate(track.dateAdded)}
                </div>
              )}

              {/* Column 5: Duration & Action Icons */}
              <div className="flex items-center justify-end gap-1.5 md:gap-3 text-xs text-neutral-400 font-mono tabular-nums relative flex-shrink-0">
                {/* Heart Button */}
                <button
                  onClick={(e) => handleLike(e, track.id)}
                  className={`p-1.5 rounded-lg transition active:scale-125 ${
                    track.isLiked
                      ? 'text-[#1db954]'
                      : 'opacity-70 md:opacity-0 md:group-hover:opacity-100 hover:text-white hover:bg-white/[0.05]'
                  }`}
                  title={track.isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      track.isLiked ? 'fill-[#1db954] text-[#1db954]' : ''
                    }`}
                  />
                </button>

                {/* Duration */}
                <span className="hidden sm:inline text-[11px] font-medium text-neutral-400">
                  {formatDuration(track.durationSec)}
                </span>

                {/* Playlist reordering buttons if inside playlist */}
                {playlistId && onMoveTrack && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTrack(index, -1);
                      }}
                      disabled={index === 0}
                      className="p-1 hover:text-white disabled:opacity-20 rounded hover:bg-white/10"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTrack(index, 1);
                      }}
                      disabled={index === tracks.length - 1}
                      className="p-1 hover:text-white disabled:opacity-20 rounded hover:bg-white/10"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Three dots menu trigger */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuTrackId(activeMenuTrackId === track.id ? null : track.id);
                      setShowPlaylistMenu(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/[0.1] hover:text-white opacity-80 md:opacity-0 md:group-hover:opacity-100 transition"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuTrackId === track.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1.5 w-52 bg-[#17171e]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
                    >
                      <button
                        onClick={() => {
                          addToQueue(track);
                          setActiveMenuTrackId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left"
                      >
                        <ListPlus className="w-4 h-4 text-[#1db954]" />
                        <span>Add to Queue</span>
                      </button>

                      {/* Add to Playlist submenu trigger */}
                      {playlists.length > 0 && onAddToPlaylist && (
                        <div className="relative">
                          <button
                            onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left"
                          >
                            <span className="flex items-center gap-2.5">
                              <Plus className="w-4 h-4 text-neutral-400" />
                              Add to Playlist
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          </button>

                          {showPlaylistMenu && (
                            <div className="absolute right-0 md:right-full top-full md:top-0 mt-1 md:mt-0 md:mr-1.5 w-48 bg-[#17171e]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl p-1.5 z-50 max-h-48 overflow-y-auto">
                              {playlists.map((pl) => (
                                <button
                                  key={pl.id}
                                  onClick={() => {
                                    onAddToPlaylist(pl.id, track.id);
                                    setActiveMenuTrackId(null);
                                    setShowPlaylistMenu(false);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left truncate"
                                >
                                  {pl.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Remove from playlist if applicable */}
                      {playlistId && onRemoveFromPlaylist && (
                        <button
                          onClick={() => {
                            onRemoveFromPlaylist(playlistId, track.id);
                            setActiveMenuTrackId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition text-left border-t border-white/[0.06] mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove from Playlist</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
