import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import { Play, Shuffle, Disc3, ArrowLeft } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export function AlbumDetailView({ albumName, onNavigate, playlists = [], onAddToPlaylist }) {
  const { playTrack, toggleShuffle } = usePlayer();
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/albums/${encodeURIComponent(albumName)}`)
      .then((r) => r.json())
      .then((data) => {
        setAlbumData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch album detail error:', err);
        setLoading(false);
      });
  }, [albumName]);

  if (loading) {
    return <div className="p-8 text-neutral-400">Loading album...</div>;
  }

  if (!albumData) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <p>Album not found.</p>
        <button
          onClick={() => onNavigate('albums')}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs"
        >
          Back to Albums
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (albumData.tracks && albumData.tracks.length > 0) {
      playTrack(albumData.tracks[0], albumData.tracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (albumData.tracks && albumData.tracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * albumData.tracks.length);
      playTrack(albumData.tracks[randomIndex], albumData.tracks, randomIndex);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Header with subtle gradient */}
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#2a2a2a] to-[#121212] flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 pb-6 sm:pb-8">
        <button
          onClick={() => onNavigate('albums')}
          className="self-start sm:hidden p-2 rounded-full bg-black/40 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-36 h-36 sm:w-56 sm:h-56 rounded-xl bg-neutral-800 overflow-hidden shadow-2xl flex-shrink-0 flex items-center justify-center">
          {albumData.albumArtPath ? (
            <img
              src={albumData.albumArtPath}
              alt={albumData.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Disc3 className="w-16 h-16 sm:w-20 sm:h-20 text-neutral-500" />
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-300 font-bold">
            Album
          </span>
          <h1 className="text-2xl sm:text-5xl font-black text-white mt-1 leading-tight">
            {albumData.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-neutral-300 mt-2 sm:mt-4 font-medium">
            <span
              onClick={() => onNavigate('artist-detail', { name: albumData.artist })}
              className="text-white hover:underline cursor-pointer font-bold"
            >
              {albumData.artist}
            </span>
            {albumData.year && (
              <>
                <span>•</span>
                <span>{albumData.year}</span>
              </>
            )}
            <span>•</span>
            <span>
              {albumData.trackCount} {albumData.trackCount === 1 ? 'song' : 'songs'},
            </span>
            <span className="text-neutral-400 font-mono">
              {formatDuration(albumData.totalDurationSec)}
            </span>
          </div>
        </div>
      </div>

      {/* Action controls & Tracks list */}
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handlePlayAll}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center transition shadow-lg active:scale-95"
            title="Play Album"
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-0.5" />
          </button>
          <button
            onClick={handleShuffleAll}
            className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Shuffle Album"
          >
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <TrackList
          tracks={albumData.tracks}
          showAlbum={false}
          playlists={playlists}
          onAddToPlaylist={onAddToPlaylist}
        />
      </div>
    </div>
  );
}
