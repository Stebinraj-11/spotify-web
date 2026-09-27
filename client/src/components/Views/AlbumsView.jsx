import React, { useState, useEffect } from 'react';
import { Disc3, Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export function AlbumsView({ onNavigate }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetch('/api/albums')
      .then((r) => r.json())
      .then((data) => {
        setAlbums(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch albums error:', err);
        setLoading(false);
      });
  }, []);

  const handlePlayAlbumDirect = async (e, albumName) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/albums/${encodeURIComponent(albumName)}`);
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
        <h1 className="text-3xl font-extrabold text-white">Albums</h1>
        <p className="text-xs text-neutral-400 mt-1">
          {albums.length} {albums.length === 1 ? 'album' : 'albums'} in your library
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm">Loading albums...</div>
      ) : albums.length === 0 ? (
        <div className="py-20 text-center text-neutral-500 text-sm">
          <Disc3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No albums found in library.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {albums.map((album, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('album-detail', { name: album.name })}
              className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-xl transition duration-300 cursor-pointer flex flex-col"
            >
              <div className="w-full aspect-square rounded-lg bg-neutral-800 overflow-hidden mb-3.5 relative shadow-md">
                {album.albumArtPath ? (
                  <img
                    src={album.albumArtPath}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-400">
                    <Disc3 className="w-12 h-12" />
                  </div>
                )}

                {/* Hover Play Button */}
                <button
                  onClick={(e) => handlePlayAlbumDirect(e, album.name)}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-200"
                  title="Play Album"
                >
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-white truncate">{album.name}</h3>
              <p className="text-xs text-neutral-400 truncate mt-1">{album.artist}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono mt-1">
                {album.year && <span>{album.year} •</span>}
                <span>{album.trackCount} songs</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
