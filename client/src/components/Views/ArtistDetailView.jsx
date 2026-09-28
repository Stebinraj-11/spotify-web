import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import { Play, Shuffle, Users, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ArtistDetailView({ artistName, onNavigate, playlists = [], onAddToPlaylist }) {
  const { playTrack, toggleShuffle } = usePlayer();
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/artists/${encodeURIComponent(artistName)}`)
      .then((r) => r.json())
      .then((data) => {
        setArtistData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch artist detail error:', err);
        setLoading(false);
      });
  }, [artistName]);

  if (loading) {
    return (
      <div className="py-24 text-center text-neutral-400">
        <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading artist profile...</p>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="p-8 text-center text-neutral-400 space-y-4">
        <p className="text-white font-bold">Artist profile not found.</p>
        <button
          onClick={() => onNavigate('artists')}
          className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 rounded-full text-white text-xs font-semibold"
        >
          Return to Artists
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (artistData.tracks && artistData.tracks.length > 0) {
      playTrack(artistData.tracks[0], artistData.tracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (artistData.tracks && artistData.tracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * artistData.tracks.length);
      playTrack(artistData.tracks[randomIndex], artistData.tracks, randomIndex);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Header with Emerald Mist */}
      <div className="p-5 sm:p-8 md:p-10 bg-gradient-to-b from-[#143022] via-[#121c17] to-transparent flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-8 pb-6 sm:pb-8 relative overflow-hidden">
        <button
          onClick={() => onNavigate('artists')}
          className="self-start sm:hidden p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Circular Artist Avatar with Doppelrand Glow */}
        <div className="w-40 h-40 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full bg-neutral-900 border-2 border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex-shrink-0 flex items-center justify-center relative group">
          {artistData.albumArtPath ? (
            <img
              src={artistData.albumArtPath}
              alt={artistData.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <Users className="w-20 h-20 text-neutral-600" />
          )}
        </div>

        {/* Artist Information */}
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1db954]/10 border border-[#1db954]/25 text-xs text-[#1db954] font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 fill-[#1db954] text-black" />
            <span>Verified Artist</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mt-1 leading-tight tracking-tight">
            {artistData.name}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 mt-2 sm:mt-3 font-medium font-mono tabular-nums">
            {artistData.trackCount} {artistData.trackCount === 1 ? 'song' : 'songs'} • {artistData.albumCount} {artistData.albumCount === 1 ? 'album' : 'albums'}
          </p>
        </div>
      </div>

      {/* Action Buttons & Tracks */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3.5">
          <button
            onClick={handlePlayAll}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center transition-all duration-200 shadow-[0_4px_24px_rgba(29,185,84,0.35)] transform hover:scale-105 active:scale-95"
            title="Play Artist"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
          <button
            onClick={handleShuffleAll}
            className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition active:scale-90"
            title="Shuffle"
          >
            <Shuffle className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Popular Releases
          </h2>
          <TrackList
            tracks={artistData.tracks}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
          />
        </div>
      </div>
    </div>
  );
}
