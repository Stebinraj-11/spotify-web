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
    <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-white/[0.08] pb-4">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#1db954] font-black">
          Library Catalog
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
          Albums
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-mono tabular-nums">
          {albums.length} {albums.length === 1 ? 'album' : 'albums'} available
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-neutral-400 text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
          <span>Cataloging albums...</span>
        </div>
      ) : albums.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 text-sm space-y-2">
          <Disc3 className="w-12 h-12 mx-auto mb-2 opacity-30 text-neutral-500" />
          <p className="text-white font-bold">No albums found</p>
          <p className="text-xs text-neutral-400">Audio albums will be organized automatically as songs are added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {albums.map((album, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('album-detail', { name: album.name })}
              className="group p-3 sm:p-3.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl transition-all duration-300 cursor-pointer flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-full aspect-square rounded-xl bg-neutral-900 border border-white/[0.08] overflow-hidden mb-3 relative shadow-md">
                {album.albumArtPath ? (
                  <img
                    src={album.albumArtPath}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-500">
                    <Disc3 className="w-12 h-12" />
                  </div>
                )}

                {/* Instant Play Button */}
                <button
                  onClick={(e) => handlePlayAlbumDirect(e, album.name)}
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:translate-y-2 sm:group-hover:translate-y-0 duration-200 active:scale-95"
                  title="Play Album"
                >
                  <Play className="w-4.5 h-4.5 fill-black ml-0.5" />
                </button>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-white truncate tracking-tight">{album.name}</h3>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">{album.artist}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono tabular-nums mt-1.5">
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
