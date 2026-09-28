import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Play, Trash2, ArrowUp, ArrowDown, Music2, ListMusic } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export function QueueDrawer() {
  const {
    isQueueOpen,
    setIsQueueOpen,
    currentTrack,
    queue,
    queueIndex,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    isPlaying,
  } = usePlayer();

  if (!isQueueOpen) return null;

  const upcomingTracks = queue.slice(queueIndex + 1);

  const moveTrack = (relativeIndex, direction) => {
    const actualIndex = queueIndex + 1 + relativeIndex;
    const targetIndex = actualIndex + direction;
    if (targetIndex < queueIndex + 1 || targetIndex >= queue.length) return;

    const newQueue = [...queue];
    const temp = newQueue[actualIndex];
    newQueue[actualIndex] = newQueue[targetIndex];
    newQueue[targetIndex] = temp;
    reorderQueue(newQueue);
  };

  return (
    <>
      <div
        onClick={() => setIsQueueOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-200"
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#111117]/95 backdrop-blur-2xl border-l border-white/[0.1] shadow-[-16px_0_40px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1db954]/10 border border-[#1db954]/30 flex items-center justify-center text-[#1db954]">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Studio Play Queue</h2>
              <span className="text-[10px] text-neutral-400 font-mono tabular-nums">
                {queue.length} {queue.length === 1 ? 'track' : 'tracks'} loaded
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="text-[11px] font-semibold text-neutral-400 hover:text-rose-400 transition px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.06]"
                title="Clear queue"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-2 rounded-full hover:bg-white/[0.1] text-neutral-400 hover:text-white transition active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Now Playing Section */}
          {currentTrack ? (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1db954] mb-2.5">
                Now Playing
              </h3>
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#1db954]/[0.08] border border-[#1db954]/25 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/[0.08] overflow-hidden flex-shrink-0 relative shadow-sm">
                  {currentTrack.albumArtPath ? (
                    <img
                      src={currentTrack.albumArtPath}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400">
                      <Music2 className="w-5 h-5" />
                    </div>
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-3.5">
                        <div className="w-0.5 bg-[#1db954] animate-eq-1 h-2" />
                        <div className="w-0.5 bg-[#1db954] animate-eq-2 h-3.5" />
                        <div className="w-0.5 bg-[#1db954] animate-eq-3 h-1.5" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1db954] truncate">{currentTrack.title}</p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">{currentTrack.artist}</p>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                  {formatDuration(currentTrack.durationSec)}
                </span>
              </div>
            </div>
          ) : null}

          {/* Next Up Section */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2.5 flex items-center justify-between">
              <span>Next Up ({upcomingTracks.length})</span>
            </h3>

            {upcomingTracks.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs space-y-2">
                <Music2 className="w-8 h-8 mx-auto mb-1 opacity-25" />
                <p className="text-neutral-400 font-medium">Queue is currently empty</p>
                <p className="text-[11px] text-neutral-500">Add songs from your library to keep the stream going.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {upcomingTracks.map((track, i) => {
                  const actualIndex = queueIndex + 1 + i;
                  return (
                    <div
                      key={`${track.id}-${actualIndex}`}
                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all select-none"
                    >
                      <span className="text-[11px] text-neutral-500 font-mono tabular-nums w-4 text-center">
                        {i + 1}
                      </span>

                      <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/[0.06] overflow-hidden flex-shrink-0 relative shadow-sm">
                        {track.albumArtPath ? (
                          <img src={track.albumArtPath} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400">
                            <Music2 className="w-4 h-4" />
                          </div>
                        )}
                        <button
                          onClick={() => playTrack(track, queue, actualIndex)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition active:scale-90"
                          title="Play this song now"
                        >
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-[#1db954] transition">
                          {track.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">{track.artist}</p>
                      </div>

                      <span className="text-[11px] text-neutral-500 font-mono tabular-nums">
                        {formatDuration(track.durationSec)}
                      </span>

                      {/* Reorder & Delete Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => moveTrack(i, -1)}
                          disabled={i === 0}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 rounded hover:bg-white/10"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveTrack(i, 1)}
                          disabled={i === upcomingTracks.length - 1}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 rounded hover:bg-white/10"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromQueue(actualIndex)}
                          className="p-1 text-neutral-400 hover:text-rose-400 rounded hover:bg-rose-500/10"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
