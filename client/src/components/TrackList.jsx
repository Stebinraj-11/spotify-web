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
      <div className="grid grid-cols-[16px_4fr_3fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-neutral-400 select-none items-center">
        <span className="text-center">#</span>
        <span>Title</span>
        {showAlbum && <span>Album</span>}
        {showDateAdded && <span>Date Added</span>}
        <div className="flex items-center justify-end gap-2 pr-2">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      {/* Track Rows */}
      <div className="divide-y divide-transparent mt-1">
        {tracks.map((track, index) => {
          const isCurrent = currentTrack && currentTrack.id === track.id;
          const isRowPlaying = isCurrent && isPlaying;

          return (
            <div
              key={`${track.id}-${index}`}
              onClick={() => handleRowClick(track, index)}
              className={`group grid grid-cols-[16px_4fr_3fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-2.5 rounded-md hover:bg-white/10 transition cursor-pointer items-center select-none ${
                isCurrent ? 'bg-white/5' : ''
              }`}
            >
              {/* Col 1: # or Play/Pause Button */}
              <div className="flex items-center justify-center text-sm font-mono text-neutral-400">
                <span className="group-hover:hidden">
                  {isRowPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <div className="w-0.5 bg-[#1db954] animate-pulse h-2" />
                      <div className="w-0.5 bg-[#1db954] animate-pulse h-3.5" />
                      <div className="w-0.5 bg-[#1db954] animate-pulse h-1.5" />
                    </div>
                  ) : isCurrent ? (
                    <span className="text-[#1db954] font-bold">{index + 1}</span>
                  ) : (
                    index + 1
                  )}
                </span>
                <button
                  className="hidden group-hover:flex items-center justify-center text-white"
                  title={isRowPlaying ? 'Pause' : 'Play'}
                >
                  {isRowPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                </button>
              </div>

              {/* Col 2: Cover + Title + Artist */}
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden flex-shrink-0 relative shadow-sm">
                  {track.albumArtPath ? (
                    <img
                      src={track.albumArtPath}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                      <Music2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      isCurrent ? 'text-[#1db954] font-semibold' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>
              </div>

              {/* Col 3: Album */}
              {showAlbum && (
                <div className="text-sm text-neutral-400 truncate pr-2">
                  {track.album || 'Single'}
                </div>
              )}

              {/* Col 4: Date Added */}
              {showDateAdded && (
                <div className="text-xs text-neutral-400 font-mono">
                  {formatDate(track.dateAdded)}
                </div>
              )}

              {/* Col 5: Duration & Action Icons */}
              <div className="flex items-center justify-end gap-3 text-xs text-neutral-400 font-mono relative">
                {/* Heart Button */}
                <button
                  onClick={(e) => handleLike(e, track.id)}
                  className={`p-1.5 transition ${
                    track.isLiked
                      ? 'text-[#1db954]'
                      : 'opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                  title={track.isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      track.isLiked ? 'fill-[#1db954] text-[#1db954]' : ''
                    }`}
                  />
                </button>

                {/* Duration */}
                <span>{formatDuration(track.durationSec)}</span>

                {/* Playlist reordering buttons if inside playlist */}
                {playlistId && onMoveTrack && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTrack(index, -1);
                      }}
                      disabled={index === 0}
                      className="p-1 hover:text-white disabled:opacity-20"
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
                      className="p-1 hover:text-white disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Three dots menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuTrackId(activeMenuTrackId === track.id ? null : track.id);
                      setShowPlaylistMenu(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100 transition"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuTrackId === track.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1 w-52 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans"
                    >
                      <button
                        onClick={() => {
                          addToQueue(track);
                          setActiveMenuTrackId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white text-left"
                      >
                        <ListPlus className="w-4 h-4 text-[#1db954]" />
                        <span>Add to Queue</span>
                      </button>

                      {/* Add to Playlist submenu trigger */}
                      {playlists.length > 0 && onAddToPlaylist && (
                        <div className="relative">
                          <button
                            onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white text-left"
                          >
                            <span className="flex items-center gap-2.5">
                              <Plus className="w-4 h-4" />
                              Add to Playlist
                            </span>
                            <span className="text-[10px] text-neutral-400">▶</span>
                          </button>

                          {showPlaylistMenu && (
                            <div className="absolute right-full top-0 mr-1 w-44 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1 z-50 max-h-48 overflow-y-auto">
                              {playlists.map((pl) => (
                                <button
                                  key={pl.id}
                                  onClick={() => {
                                    onAddToPlaylist(pl.id, track.id);
                                    setActiveMenuTrackId(null);
                                    setShowPlaylistMenu(false);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/10 hover:text-white text-left truncate"
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
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-white/10 text-left border-t border-white/5"
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
