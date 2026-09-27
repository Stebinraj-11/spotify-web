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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#222222] via-[#121212] to-black flex flex-col justify-between p-5 sm:p-10 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        <button
          onClick={() => setIsExpandedNowPlaying(false)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition active:scale-95"
          title="Minimize"
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        <div className="text-center min-w-0 px-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-semibold block">
            Playing from Library
          </span>
          <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
            {currentTrack.album || 'Single'}
          </p>
        </div>

        <div className="flex items-center gap-1 -mr-2">
          <button
            onClick={() => setIsVisualizerOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-[#1db954] transition"
            title="Visualizer & EQ"
          >
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Queue"
          >
            <ListMusic className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Main Content: Big Artwork */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 sm:my-8 max-w-lg mx-auto w-full">
        <div className="w-64 h-64 sm:w-80 sm:h-80 max-w-[78vw] aspect-square rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-white/10 relative">
          {currentTrack.albumArtPath ? (
            <img
              src={currentTrack.albumArtPath}
              alt={currentTrack.title}
              className="w-full h-full object-cover shadow-2xl"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-black text-neutral-500">
              <Music2 className="w-20 h-20 sm:w-24 sm:h-24 mb-3 opacity-40" />
              <span className="text-xs tracking-wider uppercase font-semibold">Personal Library</span>
            </div>
          )}
        </div>

        {/* Title & Artist & Like */}
        <div className="w-full flex items-center justify-between mt-6 sm:mt-8 px-1">
          <div className="min-w-0 pr-4 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white truncate">
              {currentTrack.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 truncate mt-0.5 sm:mt-1 font-medium">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="p-2 text-neutral-400 hover:text-white transition active:scale-110 flex-shrink-0"
            title={currentTrack.isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-7 h-7 sm:w-8 sm:h-8 transition ${
                currentTrack.isLiked
                  ? 'fill-[#1db954] text-[#1db954]'
                  : ''
              }`}
            />
          </button>
        </div>

        {/* Big Seek Bar */}
        <div className="w-full mt-5 sm:mt-6 px-1">
          <div className="relative flex items-center group h-6 cursor-pointer">
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
          <div className="flex justify-between text-xs text-neutral-400 font-mono mt-1">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Big Touch Controls */}
        <div className="w-full flex items-center justify-between mt-5 sm:mt-6 px-2 sm:px-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition ${
              isShuffle ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={playPrevious}
            className="p-2 text-neutral-300 hover:text-white transition active:scale-95"
            title="Previous"
          >
            <SkipBack className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition transform active:scale-95 shadow-2xl"
            title="Play/Pause"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-2 text-neutral-300 hover:text-white transition active:scale-95"
            title="Next"
          >
            <SkipForward className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2 transition ${
              repeatMode !== 'off' ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
