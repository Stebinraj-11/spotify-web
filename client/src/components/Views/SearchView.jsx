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
  Sparkles,
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
      {/* Search Header Bar with Double-Bezel Glass input */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to play? (Song, artist, album)"
          className="w-full pl-12 pr-11 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.1] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-[#1db954] focus:ring-2 focus:ring-[#1db954]/30 transition-all shadow-xl"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Section */}
      {query.trim() ? (
        loading ? (
          <div className="py-24 text-center text-neutral-400 text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
            <span>Searching catalog...</span>
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-24 text-center text-neutral-400 text-sm space-y-2">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-30 text-neutral-500" />
            <p className="text-white font-bold text-base">No results found for "{query}"</p>
            <p className="text-xs text-neutral-400">Please check your spelling or search by artist name.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Result + Songs side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Top Result Card */}
              {topMatch && (
                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    Top Result
                  </h2>
                  <div
                    onClick={handlePlayTop}
                    className="group p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:bg-white/[0.12] border border-white/[0.1] transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 relative shadow-xl overflow-hidden"
                  >
                    <div className="w-20 h-20 rounded-xl bg-neutral-900 border border-white/[0.08] overflow-hidden shadow-md flex items-center justify-center">
                      {topMatch.albumArtPath ? (
                        <img src={topMatch.albumArtPath} alt={topMatch.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <Music2 className="w-10 h-10 text-neutral-500" />
                      )}
                    </div>

                    <div className="min-w-0 pr-12">
                      <h3 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                        {topMatch.title}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate mt-1">
                        Song • <span className="text-white font-medium">{topMatch.artist}</span>
                      </p>
                    </div>

                    {/* Instant Play Button */}
                    <button
                      className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:translate-y-2 sm:group-hover:translate-y-0 duration-200 active:scale-95"
                      title="Play"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Matching Songs List */}
              <div className="lg:col-span-3 space-y-3">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  Songs
                </h2>
                <TrackList
                  tracks={tracks.slice(0, 5)}
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                />
              </div>
            </div>

            {/* Matched Albums */}
            {matchedAlbums.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  Albums
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {matchedAlbums.slice(0, 6).map((album, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigate('album-detail', { name: album.album })}
                      className="group p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition duration-200 cursor-pointer"
                    >
                      <div className="w-full aspect-square rounded-lg bg-neutral-900 border border-white/[0.06] overflow-hidden mb-2 shadow-sm">
                        {album.albumArtPath ? (
                          <img src={album.albumArtPath} alt={album.album} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
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
              <div className="space-y-3">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  Artists
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {matchedArtists.slice(0, 6).map((artist, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigate('artist-detail', { name: artist.artist })}
                      className="group p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition duration-200 cursor-pointer flex flex-col items-center text-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-neutral-900 border-2 border-white/[0.08] overflow-hidden mb-2 shadow-md">
                        {artist.albumArtPath ? (
                          <img src={artist.albumArtPath} alt={artist.artist} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
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
        /* Curated Genre Bento Categories */
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
            Explore All Genres
          </h2>
          {genres.length === 0 ? (
            <div className="text-neutral-500 text-xs">
              Genres will appear as audio tags are cataloged.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {genres.map((g, idx) => {
                const colorPalettes = [
                  'from-purple-600/90 to-indigo-800/90 border-purple-500/20 shadow-purple-900/20',
                  'from-emerald-600/90 to-teal-800/90 border-emerald-500/20 shadow-emerald-900/20',
                  'from-rose-600/90 to-pink-800/90 border-rose-500/20 shadow-rose-900/20',
                  'from-amber-600/90 to-orange-800/90 border-amber-500/20 shadow-amber-900/20',
                  'from-blue-600/90 to-cyan-800/90 border-blue-500/20 shadow-blue-900/20',
                  'from-fuchsia-600/90 to-purple-900/90 border-fuchsia-500/20 shadow-fuchsia-900/20',
                ];
                const palette = colorPalettes[idx % colorPalettes.length];

                return (
                  <div
                    key={idx}
                    onClick={() => setQuery(g.genre)}
                    className={`h-32 rounded-2xl p-4 bg-gradient-to-br ${palette} border shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex flex-col justify-between overflow-hidden relative group`}
                  >
                    <span className="text-base sm:text-lg font-black text-white capitalize tracking-tight drop-shadow-sm">
                      {g.genre}
                    </span>
                    <span className="text-[11px] text-white/80 font-mono tabular-nums">
                      {g.trackCount} {g.trackCount === 1 ? 'song' : 'songs'}
                    </span>
                    <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition duration-300" />
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
