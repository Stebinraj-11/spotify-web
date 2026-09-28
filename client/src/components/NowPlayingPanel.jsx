import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  X,
  Heart,
  MoreHorizontal,
  Play,
  CheckCircle2,
  Music2,
  ExternalLink,
  UserCheck,
  UserPlus,
} from 'lucide-react';

export function NowPlayingPanel({ onNavigate }) {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    toggleLike,
    queue,
    queueIndex,
    playTrack,
    isNowPlayingPanelOpen,
    setIsNowPlayingPanelOpen,
  } = usePlayer();

  const [isFollowing, setIsFollowing] = useState(false);

  if (!isNowPlayingPanelOpen || !currentTrack) return null;

  const nextTrack = queue[queueIndex + 1];

  return (
    <aside className="hidden lg:flex w-72 xl:w-80 bg-[#121212] rounded-xl flex-col overflow-hidden border border-white/5 select-none relative shadow-xl">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/5 bg-[#121212] sticky top-0 z-10">
        <h2 className="text-sm font-bold text-white tracking-tight truncate pr-2">
          {currentTrack.album || currentTrack.title}
        </h2>
        <button
          onClick={() => setIsNowPlayingPanelOpen(false)}
          className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition active:scale-95"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Main Artwork Image */}
        <div className="w-full aspect-square rounded-lg bg-neutral-800 overflow-hidden shadow-2xl relative group">
          {currentTrack.albumArtPath ? (
            <img
              src={currentTrack.albumArtPath}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-500">
              <Music2 className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Track Title, Artist & Like */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onNavigate && onNavigate('album-detail', { name: currentTrack.album })}
              className="text-xl font-bold text-white truncate hover:underline cursor-pointer"
            >
              {currentTrack.title}
            </h3>
            <p
              onClick={() => onNavigate && onNavigate('artist-detail', { name: currentTrack.artist })}
              className="text-sm text-neutral-400 truncate hover:text-white hover:underline cursor-pointer mt-0.5"
            >
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="p-1 text-neutral-400 hover:text-white transition active:scale-125"
            title={currentTrack.isLiked ? 'Unlike' : 'Save to Your Library'}
          >
            <Heart
              className={`w-5 h-5 transition ${
                currentTrack.isLiked
                  ? 'fill-[#1db954] text-[#1db954]'
                  : 'hover:scale-110'
              }`}
            />
          </button>
        </div>

        {/* About the Artist Card (Official Spotify Right Panel Feature) */}
        <div className="rounded-xl bg-[#181818] overflow-hidden relative shadow-md">
          <div className="h-32 bg-gradient-to-t from-[#181818] to-neutral-700 relative overflow-hidden">
            {currentTrack.albumArtPath && (
              <img
                src={currentTrack.albumArtPath}
                alt=""
                className="w-full h-full object-cover blur-sm opacity-60"
              />
            )}
            <span className="absolute top-3 left-3 text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">
              About the artist
            </span>
          </div>

          <div className="p-4 -mt-8 relative z-10 space-y-3">
            <div className="flex items-center gap-1.5">
              <h4 className="text-base font-bold text-white truncate">{currentTrack.artist}</h4>
              <CheckCircle2 className="w-4 h-4 fill-[#1db954] text-black flex-shrink-0" />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>38,421,902 monthly listeners</span>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                  isFollowing
                    ? 'border-white/30 text-white bg-white/10'
                    : 'border-white/40 text-white hover:border-white hover:scale-105'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
              {currentTrack.artist} is an acclaimed musical artist featuring in major streaming releases, original scores, and high-fidelity catalog recordings.
            </p>
          </div>
        </div>

        {/* Next in Queue Card (Official Spotify Right Panel Feature) */}
        {nextTrack && (
          <div className="rounded-xl bg-[#181818] p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Next in queue
              </span>
              <span className="text-xs text-white hover:underline cursor-pointer font-semibold">
                Open queue
              </span>
            </div>

            <div
              onClick={() => playTrack(nextTrack)}
              className="group flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden flex-shrink-0 relative shadow-sm">
                {nextTrack.albumArtPath ? (
                  <img src={nextTrack.albumArtPath} alt={nextTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <Music2 className="w-5 h-5 text-neutral-500 m-2.5" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-[#1db954]">
                  {nextTrack.title}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">{nextTrack.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Credits Card */}
        <div className="rounded-xl bg-[#181818] p-4 space-y-2.5 text-xs shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-400 uppercase tracking-wider text-[11px]">
              Credits
            </span>
            <span className="text-white hover:underline cursor-pointer font-semibold">Show all</span>
          </div>

          <div>
            <p className="font-semibold text-white">{currentTrack.artist}</p>
            <p className="text-neutral-400 text-[11px]">Main Artist, Performer</p>
          </div>
          <div>
            <p className="font-semibold text-white">{currentTrack.album || 'Original Master'}</p>
            <p className="text-neutral-400 text-[11px]">Source, Album Production</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
