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
    <div className="fixed inset-0 z-50 bg-[#09090b]/98 backdrop-blur-3xl flex flex-col justify-between p-5 sm:p-10 animate-in slide-in-from-bottom duration-300 overflow-y-auto select-none relative">
      {/* Background Ambient Colored Aura from Track Artwork */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        {currentTrack.albumArtPath && (
          <img
            src={currentTrack.albumArtPath}
            alt=""
            className="w-full h-full object-cover blur-[140px] opacity-25 scale-125"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/60 to-[#09090b]" />
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        <button
          onClick={() => setIsExpandedNowPlaying(false)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition active:scale-95"
          title="Minimize"
        >
          <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        <div className="text-center min-w-0 px-2">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#1db954] font-black block">
            Studio Master Playback
          </span>
          <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs mt-0.5">
            {currentTrack.album || 'Personal Library'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 -mr-2">
          <button
            onClick={() => setIsVisualizerOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-[#1db954] transition active:scale-90"
            title="Visualizer & EQ"
          >
            <Activity className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </button>
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition active:scale-90"
            title="Play Queue"
          >
            <ListMusic className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </button>
        </div>
      </div>

      {/* Main Content: Big Artwork Box */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 sm:my-8 max-w-lg mx-auto w-full">
        <div className="w-64 h-64 sm:w-80 sm:h-80 max-w-[78vw] aspect-square rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.85)] bg-neutral-900 border border-white/[0.12] relative group">
          {currentTrack.albumArtPath ? (
            <img
              src={currentTrack.albumArtPath}
              alt={currentTrack.title}
              className="w-full h-full object-cover shadow-2xl transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-black text-neutral-500">
              <Music2 className="w-20 h-20 sm:w-24 sm:h-24 mb-3 opacity-30" />
              <span className="text-xs tracking-wider uppercase font-semibold">Studio Audio</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none rounded-3xl" />
        </div>

        {/* Title & Artist & Like */}
        <div className="w-full flex items-center justify-between mt-6 sm:mt-8 px-2">
          <div className="min-w-0 pr-4 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white truncate tracking-tight">
              {currentTrack.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 truncate mt-1 font-medium">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="p-2 text-neutral-400 hover:text-white transition active:scale-125 flex-shrink-0"
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

        {/* Precision Seek Bar */}
        <div className="w-full mt-6 px-2">
          <div className="relative flex items-center group h-5 cursor-pointer">
            <div className="w-full h-1.5 bg-white/[0.12] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1db954] to-[#1ed760] transition-colors shadow-[0_0_8px_rgba(29,185,84,0.5)]"
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
          <div className="flex justify-between text-[11px] text-neutral-400 font-mono tabular-nums mt-1.5">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Big Touch Playback Controls */}
        <div className="w-full flex items-center justify-between mt-6 sm:mt-8 px-3 sm:px-6">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition active:scale-90 ${
              isShuffle ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={playPrevious}
            className="p-2 text-neutral-300 hover:text-white transition active:scale-90"
            title="Previous"
          >
            <SkipBack className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white hover:bg-neutral-100 text-black flex items-center justify-center transition-all duration-200 transform active:scale-95 shadow-[0_4px_24px_rgba(255,255,255,0.3)] hover:scale-105"
            title="Play/Pause"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-2 text-neutral-300 hover:text-white transition active:scale-90"
            title="Next"
          >
            <SkipForward className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2 transition active:scale-90 ${
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
