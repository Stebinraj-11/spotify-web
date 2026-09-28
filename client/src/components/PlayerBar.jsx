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
  Mic2,
  PanelRight,
  Speaker,
  Laptop2,
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
    isExpandedNowPlaying,
    setIsExpandedNowPlaying,
    isNowPlayingPanelOpen,
    setIsNowPlayingPanelOpen,
    isLyricsOpen,
    setIsLyricsOpen,
    isDevicePickerOpen,
    setIsDevicePickerOpen,
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [isVolHovered, setIsVolHovered] = useState(false);

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
      {/* 📱 MOBILE FLOATING MINI PLAYER */}
      {/* ============================================================== */}
      {currentTrack && (
        <div className="md:hidden fixed bottom-16 left-2 right-2 z-40 bg-[#282828] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-2 duration-200">
          {/* Progress Line */}
          <div className="w-full h-[2.5px] bg-neutral-700 overflow-hidden">
            <div
              className="h-full bg-[#1db954] transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            onClick={() => setIsExpandedNowPlaying(true)}
            className="flex items-center justify-between p-2.5 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden flex-shrink-0 relative shadow-sm">
                {currentTrack.albumArtPath ? (
                  <img
                    src={currentTrack.albumArtPath}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                    <Music2 className="w-4 h-4" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-0.5 bg-[#1db954] animate-pulse h-2" />
                      <div className="w-0.5 bg-[#1db954] animate-pulse h-3" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {currentTrack.title}
                </p>
                <p className="text-[11px] text-[#b3b3b3] truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-1.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="p-1.5 text-neutral-400 hover:text-white transition"
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
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition"
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
                className="p-1.5 text-neutral-400 hover:text-white transition"
                title="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 💻 OFFICIAL SPOTIFY DESKTOP PLAYER BAR (90px height) */}
      {/* ============================================================== */}
      <footer className="hidden md:flex h-20 lg:h-[88px] bg-black border-t border-[#282828] px-4 lg:px-6 items-center justify-between select-none z-40 relative">
        {/* Left: Track Info */}
        <div className="flex items-center gap-3.5 w-[30%] min-w-[180px] max-w-[360px]">
          {currentTrack ? (
            <>
              <div
                onClick={() => setIsExpandedNowPlaying(true)}
                className="w-14 h-14 rounded bg-neutral-800 overflow-hidden flex-shrink-0 cursor-pointer relative group shadow-md"
              >
                {currentTrack.albumArtPath ? (
                  <img
                    src={currentTrack.albumArtPath}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-400">
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
                  className="text-sm font-normal text-white truncate hover:underline cursor-pointer"
                >
                  {currentTrack.title}
                </p>
                <p className="text-xs text-[#b3b3b3] truncate hover:text-white hover:underline transition cursor-pointer mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="p-1 text-neutral-400 hover:text-white transition active:scale-125"
                title={currentTrack.isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
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
            <div className="flex items-center gap-3 opacity-30">
              <div className="w-14 h-14 rounded bg-neutral-800 flex items-center justify-center text-neutral-500">
                <Music2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">No track playing</p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-1.5 max-w-2xl w-[40%]">
          <div className="flex items-center gap-4 lg:gap-5">
            {/* Shuffle Button with Spotify Green Dot indicator */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 relative transition active:scale-90 ${
                isShuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
            >
              <Shuffle className="w-4 h-4" />
              {isShuffle && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1db954]" />
              )}
            </button>

            {/* Skip Previous */}
            <button
              onClick={playPrevious}
              disabled={!currentTrack}
              className="p-1.5 text-[#b3b3b3] hover:text-white disabled:opacity-25 transition active:scale-90"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Play/Pause Button (Spotify White Circle) */}
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-transform shadow-md disabled:opacity-30"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 lg:w-4.5 lg:h-4.5 fill-black" />
              ) : (
                <Play className="w-4 h-4 lg:w-4.5 lg:h-4.5 fill-black ml-0.5" />
              )}
            </button>

            {/* Skip Next */}
            <button
              onClick={playNext}
              disabled={!currentTrack}
              className="p-1.5 text-[#b3b3b3] hover:text-white disabled:opacity-25 transition active:scale-90"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat Button with Spotify Green Dot indicator */}
            <button
              onClick={cycleRepeat}
              className={`p-1.5 relative transition active:scale-90 ${
                repeatMode !== 'off' ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              {repeatMode !== 'off' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1db954]" />
              )}
            </button>
          </div>

          {/* Time Scrubber (Spotify Interactive Slider) */}
          <div
            className="w-full flex items-center gap-2 text-[11px] text-[#b3b3b3] font-mono tabular-nums"
            onMouseEnter={() => setIsBarHovered(true)}
            onMouseLeave={() => setIsBarHovered(false)}
          >
            <span className="w-10 text-right">
              {formatDuration(isSeeking ? seekValue : currentTime)}
            </span>

            <div className="relative flex-1 flex items-center h-3 cursor-pointer group">
              {/* Background Track */}
              <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-colors ${
                    isBarHovered ? 'bg-[#1db954]' : 'bg-white'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Thumb visible on hover */}
              <div
                className={`absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none transition-opacity -ml-1.5 ${
                  isBarHovered ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ left: `${progressPercent}%` }}
              />

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

        {/* Right: Spotify Utility Controls (Now Playing, Lyrics, Queue, Device, Volume, Fullscreen) */}
        <div className="flex items-center justify-end gap-2 lg:gap-2.5 w-[30%] min-w-[200px]">
          {/* Now Playing View Panel Button */}
          <button
            onClick={() => setIsNowPlayingPanelOpen(!isNowPlayingPanelOpen)}
            className={`p-1.5 rounded transition ${
              isNowPlayingPanelOpen
                ? 'text-[#1db954]'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Now playing view"
          >
            <PanelRight className="w-4 h-4" />
          </button>

          {/* Lyrics Button */}
          <button
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            className={`p-1.5 rounded transition ${
              isLyricsOpen
                ? 'text-[#1db954]'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Lyrics"
          >
            <Mic2 className="w-4 h-4" />
          </button>

          {/* Queue Button */}
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-1.5 rounded transition ${
              isQueueOpen
                ? 'text-[#1db954]'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Connect to a Device */}
          <button
            onClick={() => setIsDevicePickerOpen(!isDevicePickerOpen)}
            className={`p-1.5 rounded transition ${
              isDevicePickerOpen
                ? 'text-[#1db954]'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Connect to a device"
          >
            <Laptop2 className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div
            className="flex items-center gap-1.5 group pl-1"
            onMouseEnter={() => setIsVolHovered(true)}
            onMouseLeave={() => setIsVolHovered(false)}
          >
            <button
              onClick={toggleMute}
              className="text-[#b3b3b3] hover:text-white transition p-1"
              title="Mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <div className="relative w-20 lg:w-24 flex items-center h-3 cursor-pointer">
              <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-colors ${
                    isVolHovered ? 'bg-[#1db954]' : 'bg-white'
                  }`}
                  style={{ width: `${volumePercent}%` }}
                />
              </div>

              {/* Volume hover thumb */}
              <div
                className={`absolute w-3 h-3 bg-white rounded-full shadow pointer-events-none transition-opacity -ml-1.5 ${
                  isVolHovered ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ left: `${volumePercent}%` }}
              />

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

          {/* Fullscreen / Expanded Button */}
          <button
            onClick={() => setIsExpandedNowPlaying(!isExpandedNowPlaying)}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition"
            title="Full screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </>
  );
}
