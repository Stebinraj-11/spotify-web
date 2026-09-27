import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import {
  Search,
  X,
  Play,
  Music2,
  Disc3,
  Users,
} from 'lucide-react';

export function SearchView({ onNavigate, playlists = [], onAddToPlaylist }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/genres')
      .then((r) => r.json())
      .then((data) => setGenres(data))
      .catch(console.warn);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setTracks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/tracks?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          setTracks(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  // Derived albums and artists from matched tracks
  const matchedAlbums = Array.from(
    new Map(
      tracks
        .filter((t) => t.album && t.album.toLowerCase().includes(query.toLowerCase()))
        .map((t) => [t.album, t])
    ).values()
  );

  const matchedArtists = Array.from(
    new Map(
      tracks
        .filter((t) => t.artist && t.artist.toLowerCase().includes(query.toLowerCase()))
        .map((t) => [t.artist, t])
    ).values()
  );

  const topMatch = tracks[0];

  const handlePlayTop = () => {
    if (!topMatch) return;
    if (currentTrack && currentTrack.id === topMatch.id) {
      togglePlay();
    } else {
      playTrack(topMatch, tracks, 0);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Search Header Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to play? (Song, artist, album)"
          className="w-full pl-12 pr-10 py-3 md:py-3.5 rounded-full bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#1db954] transition shadow-lg"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Section */}
      {query.trim() ? (
        loading ? (
          <div className="py-20 text-center text-neutral-400 text-sm">Searching library...</div>
        ) : tracks.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 text-sm">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            No results found for "{query}". Try checking the spelling or searching another artist.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Result + Songs side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Top Result Card */}
              {topMatch && (
                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-xl font-bold text-white">Top Result</h2>
                  <div
                    onClick={handlePlayTop}
                    className="group p-4 sm:p-5 rounded-2xl bg-[#181818] hover:bg-[#282828] transition duration-300 cursor-pointer flex flex-col justify-between h-52 sm:h-56 relative shadow-lg"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-neutral-800 overflow-hidden shadow-md flex items-center justify-center">
                      {topMatch.albumArtPath ? (
                        <img src={topMatch.albumArtPath} alt={topMatch.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music2 className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-500" />
                      )}
                    </div>

                    <div className="min-w-0 pr-12">
                      <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{topMatch.title}</h3>
                      <p className="text-xs sm:text-sm text-neutral-400 truncate mt-1">
                        Song • <span className="text-white font-medium">{topMatch.artist}</span>
                      </p>
                    </div>

                    {/* Play button */}
                    <button
                      className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition transform md:translate-y-2 md:group-hover:translate-y-0"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black ml-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Matching Songs */}
              <div className="lg:col-span-3 space-y-3">
                <h2 className="text-xl font-bold text-white">Songs</h2>
                <TrackList
                  tracks={tracks.slice(0, 5)}
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                />
              </div>
            </div>

            {/* Matched Albums */}
            {matchedAlbums.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Matching Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {matchedAlbums.slice(0, 6).map((album, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigate('album-detail', { name: album.album })}
                      className="p-3 bg-[#181818] hover:bg-[#282828] rounded-xl transition cursor-pointer"
                    >
                      <div className="w-full aspect-square rounded-lg bg-neutral-800 overflow-hidden mb-2 shadow-sm">
                        {album.albumArtPath ? (
                          <img src={album.albumArtPath} alt={album.album} className="w-full h-full object-cover" />
                        ) : (
                          <Disc3 className="w-full h-full p-4 text-neutral-500" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white truncate">{album.album}</p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{album.artist}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Artists */}
            {matchedArtists.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Matching Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {matchedArtists.slice(0, 6).map((artist, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigate('artist-detail', { name: artist.artist })}
                      className="p-3 bg-[#181818] hover:bg-[#282828] rounded-xl transition cursor-pointer flex flex-col items-center text-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-neutral-800 overflow-hidden mb-2 shadow-sm">
                        {artist.albumArtPath ? (
                          <img src={artist.albumArtPath} alt={artist.artist} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-full h-full p-4 text-neutral-500" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white truncate w-full">{artist.artist}</p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* Browse Genres Categories when empty search */
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Browse Genres</h2>
          {genres.length === 0 ? (
            <div className="text-neutral-500 text-sm">
              Genres from your music files will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {genres.map((g, idx) => {
                const colors = [
                  'from-purple-600 to-indigo-700',
                  'from-emerald-600 to-teal-800',
                  'from-rose-600 to-pink-800',
                  'from-amber-600 to-orange-800',
                  'from-blue-600 to-cyan-800',
                  'from-fuchsia-600 to-purple-800',
                ];
                const grad = colors[idx % colors.length];

                return (
                  <div
                    key={idx}
                    onClick={() => setQuery(g.genre)}
                    className={`h-28 rounded-xl p-4 bg-gradient-to-br ${grad} cursor-pointer hover:scale-[1.02] transition shadow-lg flex flex-col justify-between`}
                  >
                    <span className="text-base font-bold text-white capitalize">{g.genre}</span>
                    <span className="text-xs text-white/80 font-mono">
                      {g.trackCount} {g.trackCount === 1 ? 'song' : 'songs'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
