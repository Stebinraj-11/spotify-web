import React, { useState, useEffect } from 'react';
import { Users, Play, CheckCircle2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export function ArtistsView({ onNavigate }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetch('/api/artists')
      .then((r) => r.json())
      .then((data) => {
        setArtists(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch artists error:', err);
        setLoading(false);
      });
  }, []);

  const handlePlayArtistDirect = async (e, artistName) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/artists/${encodeURIComponent(artistName)}`);
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        playTrack(data.tracks[0], data.tracks, 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-white/[0.08] pb-4">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#1db954] font-black">
          Library Catalog
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
          Artists
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-mono tabular-nums">
          {artists.length} {artists.length === 1 ? 'artist' : 'artists'} in your catalog
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-neutral-400 text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
          <span>Cataloging artists...</span>
        </div>
      ) : artists.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 text-sm space-y-2">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-neutral-500" />
          <p className="text-white font-bold">No artists found</p>
          <p className="text-xs text-neutral-400">Artists are detected automatically from your audio library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {artists.map((artist, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('artist-detail', { name: artist.name })}
              className="group p-3 sm:p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-full aspect-square rounded-full bg-neutral-900 border-2 border-white/[0.08] overflow-hidden mb-3 relative shadow-md">
                {artist.albumArtPath ? (
                  <img
                    src={artist.albumArtPath}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-500">
                    <Users className="w-12 h-12" />
                  </div>
                )}

                {/* Instant Play Button */}
                <button
                  onClick={(e) => handlePlayArtistDirect(e, artist.name)}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:translate-y-2 sm:group-hover:translate-y-0 duration-200 active:scale-95"
                  title="Play Artist"
                >
                  <Play className="w-4.5 h-4.5 fill-black ml-0.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 w-full justify-center">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate tracking-tight">{artist.name}</h3>
                <CheckCircle2 className="w-3 h-3 text-[#1db954] flex-shrink-0" />
              </div>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono tabular-nums">
                {artist.trackCount} {artist.trackCount === 1 ? 'song' : 'songs'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
