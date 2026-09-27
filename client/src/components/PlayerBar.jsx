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
        <div className="md:hidden fixed bottom-16 left-2 right-2 z-40 bg-[#242424]/95 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-2 duration-200">
          <div
            onClick={() => setIsExpandedNowPlaying(true)}
            className="flex items-center justify-between p-2.5 cursor-pointer select-none"
          >
            {/* Thumbnail + Title + Artist */}
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div className="w-10 h-10 rounded-md bg-neutral-800 overflow-hidden flex-shrink-0 relative shadow-sm">
                {currentTrack.albumArtPath ? (
                  <img
                    src={currentTrack.albumArtPath}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                    <Music2 className="w-5 h-5" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-0.5 bg-[#1db954] animate-pulse h-2" />
                      <div className="w-0.5 bg-[#1db954] animate-pulse h-3" />
                      <div className="w-0.5 bg-[#1db954] animate-pulse h-1.5" />
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

            {/* Quick Actions: Like, Play/Pause, Next */}
            <div
              className="flex items-center gap-1 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="p-2 text-neutral-400 hover:text-white transition"
                title={currentTrack.isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-5 h-5 transition ${
                    currentTrack.isLiked
                      ? 'fill-[#1db954] text-[#1db954]'
                      : ''
                  }`}
                />
              </button>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-md active:scale-95 transition"
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
                className="p-2 text-neutral-300 hover:text-white transition"
                title="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>

          {/* Thin Progress Line along bottom edge */}
          <div className="w-full h-[2.5px] bg-neutral-700/80 overflow-hidden">
            <div
              className="h-full bg-[#1db954] transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 💻 DESKTOP PLAYER BAR (Full 3-column Spotify bar for tablets/laps) */}
      {/* ============================================================== */}
      <div className="hidden md:flex h-24 bg-[#181818] border-t border-white/5 px-4 lg:px-6 items-center justify-between select-none z-40 relative">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
          {currentTrack ? (
            <>
              <div
                onClick={() => setIsExpandedNowPlaying(true)}
                className="w-14 h-14 rounded-md bg-neutral-800 overflow-hidden flex-shrink-0 cursor-pointer relative group shadow-md"
              >
                {currentTrack.albumArtPath ? (
                  <img
                    src={currentTrack.albumArtPath}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                    <Music2 className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p
                  onClick={() => setIsExpandedNowPlaying(true)}
                  className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
                >
                  {currentTrack.title}
                </p>
                <p className="text-xs text-neutral-400 truncate hover:text-white transition cursor-pointer">
                  {currentTrack.artist}
                </p>
              </div>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="p-1 text-neutral-400 hover:text-white transition"
                title={currentTrack.isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-5 h-5 transition ${
                    currentTrack.isLiked
                      ? 'fill-[#1db954] text-[#1db954]'
                      : 'hover:scale-110'
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-14 h-14 rounded-md bg-neutral-800 flex items-center justify-center text-neutral-500">
                <Music2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">No song playing</p>
                <p className="text-xs text-neutral-500">Pick a track to start</p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-2 max-w-xl w-2/4">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`p-1 transition ${
                isShuffle ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              disabled={!currentTrack}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 transition"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition transform hover:scale-105 shadow-md active:scale-95 disabled:opacity-50"
              title="Play/Pause"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              disabled={!currentTrack}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 transition"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`p-1 relative transition ${
                repeatMode !== 'off' ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
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

          <div className="w-full flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span className="w-10 text-right">
              {formatDuration(isSeeking ? seekValue : currentTime)}
            </span>

            <div className="relative flex-1 flex items-center group h-4 cursor-pointer">
              <div className="w-full h-1 bg-neutral-700 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
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
                value={isSeeking ? seekValue : currentTime}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onChange={handleSeekChange}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="w-10">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Sound Visualizer, Queue & Volume */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
          <button
            onClick={() => setIsVisualizerOpen(!isVisualizerOpen)}
            className={`p-2 rounded-full transition ${
              isVisualizerOpen
                ? 'text-[#1db954] bg-white/10'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
            title="Visualizer & EQ"
          >
            <Activity className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-full transition ${
              isQueueOpen
                ? 'text-[#1db954] bg-white/10'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
            title="Play Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 group">
            <button
              onClick={toggleMute}
              className="text-neutral-400 hover:text-white transition"
              title="Mute/Unmute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <div className="relative w-24 flex items-center group h-4 cursor-pointer">
              <div className="w-full h-1 bg-neutral-700 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
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
