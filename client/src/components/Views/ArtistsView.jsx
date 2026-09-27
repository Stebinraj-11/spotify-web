import React, { useState, useEffect } from 'react';
import { Users, Play } from 'lucide-react';
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
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Artists</h1>
        <p className="text-xs text-neutral-400 mt-1">
          {artists.length} {artists.length === 1 ? 'artist' : 'artists'} in your library
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm">Loading artists...</div>
      ) : artists.length === 0 ? (
        <div className="py-20 text-center text-neutral-500 text-sm">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No artists found in library.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {artists.map((artist, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('artist-detail', { name: artist.name })}
              className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-xl transition duration-300 cursor-pointer flex flex-col items-center text-center"
            >
              <div className="w-full aspect-square rounded-full bg-neutral-800 overflow-hidden mb-3.5 relative shadow-md">
                {artist.albumArtPath ? (
                  <img
                    src={artist.albumArtPath}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                    <Users className="w-12 h-12" />
                  </div>
                )}

                {/* Hover Play Button */}
                <button
                  onClick={(e) => handlePlayArtistDirect(e, artist.name)}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-200"
                  title="Play Artist"
                >
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-white truncate w-full">{artist.name}</h3>
              <p className="text-xs text-neutral-400 truncate mt-1">
                {artist.trackCount} {artist.trackCount === 1 ? 'song' : 'songs'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
