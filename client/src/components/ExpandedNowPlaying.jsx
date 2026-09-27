import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Music2,
  Activity,
  ListMusic,
} from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export function ExpandedNowPlaying() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    isExpandedNowPlaying,
    setIsExpandedNowPlaying,
    setIsVisualizerOpen,
    setIsQueueOpen,
  } = usePlayer();

  if (!isExpandedNowPlaying || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#222222] via-[#121212] to-black flex flex-col p-8 sm:p-12 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpandedNowPlaying(false)}
          className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
          title="Minimize"
        >
          <ChevronDown className="w-8 h-8" />
        </button>

        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Playing from Library
          </span>
          <p className="text-sm font-bold text-white truncate max-w-sm">
            {currentTrack.album}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVisualizerOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-[#1db954] transition"
            title="Visualizer & EQ"
          >
            <Activity className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Queue"
          >
            <ListMusic className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content: Big Artwork */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 max-w-lg mx-auto w-full">
        <div className="w-full aspect-square max-w-[380px] rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-white/10 relative group">
          {currentTrack.albumArtPath ? (
            <img
              src={currentTrack.albumArtPath}
              alt={currentTrack.title}
              className="w-full h-full object-cover shadow-2xl"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-black text-neutral-500">
              <Music2 className="w-24 h-24 mb-4 opacity-40" />
              <span className="text-sm tracking-wider uppercase">Personal Library</span>
            </div>
          )}
        </div>

        {/* Title & Artist & Like */}
        <div className="w-full flex items-center justify-between mt-8">
          <div className="min-w-0 pr-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">
              {currentTrack.title}
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 truncate mt-1">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="p-2 text-neutral-400 hover:text-white transition"
          >
            <Heart
              className={`w-7 h-7 transition ${
                currentTrack.isLiked
                  ? 'fill-[#1db954] text-[#1db954]'
                  : 'hover:scale-110'
              }`}
            />
          </button>
        </div>

        {/* Big Seek Bar */}
        <div className="w-full mt-6">
          <div className="relative flex items-center group h-4 cursor-pointer">
            <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white group-hover:bg-[#1db954] transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 font-mono mt-2">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-between mt-6 px-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition ${
              isShuffle ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-6 h-6" />
          </button>

          <button
            onClick={playPrevious}
            className="p-2 text-neutral-300 hover:text-white transition"
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition transform hover:scale-105 shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-2 text-neutral-300 hover:text-white transition"
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2 transition ${
              repeatMode !== 'off' ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-6 h-6" />
            ) : (
              <Repeat className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
