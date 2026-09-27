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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ListMusic className="w-5 h-5 text-[#1db954]" />
          <h2 className="text-lg font-bold text-white">Play Queue</h2>
          <span className="text-xs bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full">
            {queue.length} tracks
          </span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="text-xs text-neutral-400 hover:text-red-400 transition px-2 py-1 rounded"
              title="Clear queue"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Now Playing Section */}
        {currentTrack ? (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Now Playing
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-neutral-800 overflow-hidden flex-shrink-0 relative group">
                {currentTrack.albumArtPath ? (
                  <img
                    src={currentTrack.albumArtPath}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                    <Music2 className="w-6 h-6" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-4">
                      <div className="w-1 bg-[#1db954] animate-pulse h-3" />
                      <div className="w-1 bg-[#1db954] animate-pulse h-4" />
                      <div className="w-1 bg-[#1db954] animate-pulse h-2" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1db954] truncate">{currentTrack.title}</p>
                <p className="text-xs text-neutral-400 truncate">{currentTrack.artist}</p>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                {formatDuration(currentTrack.durationSec)}
              </span>
            </div>
          </div>
        ) : null}

        {/* Next Up Section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
            <span>Next Up ({upcomingTracks.length})</span>
          </h3>

          {upcomingTracks.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-sm">
              <Music2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Queue is empty. Add songs to keep the music going!
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingTracks.map((track, i) => {
                const actualIndex = queueIndex + 1 + i;
                return (
                  <div
                    key={`${track.id}-${actualIndex}`}
                    className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition"
                  >
                    <span className="text-xs text-neutral-500 font-mono w-4 text-center">
                      {i + 1}
                    </span>

                    <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden flex-shrink-0 relative">
                      {track.albumArtPath ? (
                        <img src={track.albumArtPath} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800 text-neutral-400">
                          <Music2 className="w-5 h-5" />
                        </div>
                      )}
                      <button
                        onClick={() => playTrack(track, queue, actualIndex)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"
                      >
                        <Play className="w-4 h-4 fill-white" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-[#1db954] transition">
                        {track.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                    </div>

                    <span className="text-xs text-neutral-500 font-mono">
                      {formatDuration(track.durationSec)}
                    </span>

                    {/* Reorder & Delete Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => moveTrack(i, -1)}
                        disabled={i === 0}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveTrack(i, 1)}
                        disabled={i === upcomingTracks.length - 1}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromQueue(actualIndex)}
                        className="p-1 text-neutral-400 hover:text-red-400"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
}
