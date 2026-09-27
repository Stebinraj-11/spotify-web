import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import { Play, Shuffle, Users, CheckCircle, ArrowLeft } from 'lucide-react';

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
    return <div className="p-8 text-neutral-400">Loading artist...</div>;
  }

  if (!artistData) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <p>Artist not found.</p>
        <button
          onClick={() => onNavigate('artists')}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs"
        >
          Back to Artists
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
      {/* Hero Header */}
      <div className="p-6 md:p-8 bg-gradient-to-b from-[#1a3328] via-[#121212] to-[#121212] flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8">
        <button
          onClick={() => onNavigate('artists')}
          className="self-start sm:hidden p-2 rounded-full bg-black/40 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-neutral-800 overflow-hidden shadow-2xl flex-shrink-0 flex items-center justify-center border-4 border-white/5">
          {artistData.albumArtPath ? (
            <img
              src={artistData.albumArtPath}
              alt={artistData.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Users className="w-20 h-20 text-neutral-500" />
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#1db954] font-semibold mb-1">
            <CheckCircle className="w-4 h-4 fill-current text-black" />
            <span>Verified Artist</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white mt-1 leading-tight">
            {artistData.name}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 mt-3 font-medium">
            {artistData.trackCount} {artistData.trackCount === 1 ? 'song' : 'songs'} • {artistData.albumCount} {artistData.albumCount === 1 ? 'album' : 'albums'}
          </p>
        </div>
      </div>

      {/* Action buttons & Tracks list */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center transition shadow-lg transform hover:scale-105"
            title="Play Artist"
          >
            <Play className="w-7 h-7 fill-black ml-0.5" />
          </button>
          <button
            onClick={handleShuffleAll}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Songs</h2>
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
