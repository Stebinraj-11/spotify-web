import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  ListMusic,
  Activity,
  Maximize2,
  Music2,
  Sparkles,
} from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    isVisualizerOpen,
    setIsVisualizerOpen,
    isQueueOpen,
    setIsQueueOpen,
    setIsExpandedNowPlaying,
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const progressPercent = duration > 0 ? ((isSeeking ? seekValue : currentTime) / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  const handleSeekChange = (e) => {
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setSeekValue(currentTime);
  };

  const handleSeekEnd = (e) => {
    setIsSeeking(false);
    seek(parseFloat(e.target.value));
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 📱 MOBILE FLOATING MINI PLAYER (Floats above mobile bottom nav) */}
      {/* ============================================================== */}
      {currentTrack && (
        <div className="md:hidden fixed bottom-16 left-2.5 right-2.5 z-40 bg-[#16161c]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-bottom-2 duration-300">
          {/* Subtle Progress Line along top edge */}
          <div className="w-full h-[3px] bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1db954] to-[#1ed760] transition-all duration-150 shadow-[0_0_8px_rgba(29,185,84,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            onClick={() => setIsExpandedNowPlaying(true)}
            className="flex items-center justify-between p-2.5 cursor-pointer select-none"
          >
            {/* Thumbnail + Title + Artist */}
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 overflow-hidden flex-shrink-0 relative shadow-md border border-white/[0.08]">
                {currentTrack.albumArtPath ? (
                  <img
                    src={currentTrack.albumArtPath}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400">
                    <Music2 className="w-4 h-4" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-0.5 bg-[#1db954] animate-eq-1 h-2" />
                      <div className="w-0.5 bg-[#1db954] animate-eq-2 h-3" />
                      <div className="w-0.5 bg-[#1db954] animate-eq-3 h-1.5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {currentTrack.title}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className="flex items-center gap-1.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="p-2 text-neutral-400 hover:text-white transition active:scale-110"
                title={currentTrack.isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-4.5 h-4.5 transition ${
                    currentTrack.isLiked
                      ? 'fill-[#1db954] text-[#1db954]'
                      : ''
                  }`}
                />
              </button>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 transition transform"
                title="Play/Pause"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-2 text-neutral-400 hover:text-white transition active:scale-95"
                title="Next"
              >
                <SkipForward className="w-4.5 h-4.5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 💻 DESKTOP PLAYER BAR (Full 3-column Studio Console) */}
      {/* ============================================================== */}
      <div className="hidden md:flex h-22 lg:h-24 bg-[#0e0e13]/95 backdrop-blur-2xl border-t border-white/[0.08] px-5 lg:px-8 items-center justify-between select-none z-40 relative shadow-[0_-10px_35px_rgba(0,0,0,0.6)]">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
          {currentTrack ? (
            <>
              <div
                onClick={() => setIsExpandedNowPlaying(true)}
                className="w-13 h-13 rounded-xl bg-neutral-800 overflow-hidden flex-shrink-0 cursor-pointer relative group shadow-md border border-white/[0.08]"
              >
                {currentTrack.albumArtPath ? (
                  <img
                    src={currentTrack.albumArtPath}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400">
                    <Music2 className="w-5 h-5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p
                  onClick={() => setIsExpandedNowPlaying(true)}
                  className="text-xs lg:text-sm font-bold text-white truncate hover:underline cursor-pointer tracking-tight"
                >
                  {currentTrack.title}
                </p>
                <p className="text-[11px] lg:text-xs text-neutral-400 truncate hover:text-white transition cursor-pointer mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="p-1.5 text-neutral-400 hover:text-white transition active:scale-125"
                title={currentTrack.isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-4.5 h-4.5 transition ${
                    currentTrack.isLiked
                      ? 'fill-[#1db954] text-[#1db954]'
                      : 'hover:scale-110'
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-white/[0.06] flex items-center justify-center text-neutral-500">
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-300">No track active</p>
                <p className="text-[11px] text-neutral-500">Choose a song from your library</p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Playback Controls & Precision Scrubber */}
        <div className="flex flex-col items-center gap-1.5 max-w-xl w-2/4">
          <div className="flex items-center gap-4 lg:gap-5">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition active:scale-90 ${
                isShuffle
                  ? 'text-[#1db954] bg-[#1db954]/10 shadow-[0_0_12px_rgba(29,185,84,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
              title="Shuffle playback"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              disabled={!currentTrack}
              className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 transition active:scale-90"
              title="Previous song"
            >
              <SkipBack className="w-4.5 h-4.5 fill-current" />
            </button>

            {/* Glowing Island Play Button */}
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-10 h-10 rounded-full bg-white hover:bg-neutral-100 text-black flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-[0_2px_16px_rgba(255,255,255,0.3)] disabled:opacity-40"
              title="Play/Pause"
            >
              {isPlaying ? (
                <Pause className="w-4.5 h-4.5 fill-current" />
              ) : (
                <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              disabled={!currentTrack}
              className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 transition active:scale-90"
              title="Next song"
            >
              <SkipForward className="w-4.5 h-4.5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`p-1.5 rounded-full transition active:scale-90 ${
                repeatMode !== 'off'
                  ? 'text-[#1db954] bg-[#1db954]/10 shadow-[0_0_12px_rgba(29,185,84,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="w-full flex items-center gap-2.5 text-[11px] text-neutral-400 font-mono tabular-nums">
            <span className="w-10 text-right font-medium">
              {formatDuration(isSeeking ? seekValue : currentTime)}
            </span>

            <div className="relative flex-1 flex items-center group h-4 cursor-pointer">
              <div className="w-full h-1 bg-white/[0.12] rounded-full overflow-hidden group-hover:h-1.5 transition-all duration-200">
                <div
                  className="h-full bg-white group-hover:bg-[#1db954] transition-colors duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={isSeeking ? seekValue : currentTime}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onChange={handleSeekChange}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="w-10 font-medium">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Sound Visualizer, Queue & Volume */}
        <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[200px]">
          <button
            onClick={() => setIsVisualizerOpen(!isVisualizerOpen)}
            className={`p-2 rounded-xl transition duration-200 active:scale-90 ${
              isVisualizerOpen
                ? 'text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/30 shadow-[0_0_12px_rgba(29,185,84,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
            }`}
            title="Studio Audio Visualizer & Equalizer"
          >
            <Activity className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-xl transition duration-200 active:scale-90 ${
              isQueueOpen
                ? 'text-[#1db954] bg-[#1db954]/10 border border-[#1db954]/30'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
            }`}
            title="Play Queue"
          >
            <ListMusic className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center gap-2 group pl-1">
            <button
              onClick={toggleMute}
              className="text-neutral-400 hover:text-white transition active:scale-90 p-1"
              title="Mute / Unmute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4.5 h-4.5 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4.5 h-4.5" />
              ) : (
                <Volume2 className="w-4.5 h-4.5" />
              )}
            </button>

            <div className="relative w-22 lg:w-26 flex items-center group h-4 cursor-pointer">
              <div className="w-full h-1 bg-white/[0.12] rounded-full overflow-hidden group-hover:h-1.5 transition-all duration-200">
                <div
                  className="h-full bg-white group-hover:bg-[#1db954] transition-colors"
                  style={{ width: `${volumePercent}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
