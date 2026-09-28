import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import {
  Play,
  Shuffle,
  Music,
  Disc3,
  Users,
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export function HomeView({
  onNavigate,
  onOpenAccount,
  playlists = [],
  onAddToPlaylist,
}) {
  const { playTrack, toggleShuffle, currentTrack, isPlaying } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homeFilter, setHomeFilter] = useState('all'); // 'all' | 'music' | 'podcasts'

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/tracks?sort=order&order=asc').then((r) => r.json()),
      fetch('/api/albums').then((r) => r.json()).catch(() => []),
      fetch('/api/artists').then((r) => r.json()).catch(() => []),
    ])
      .then(([tracksData, albumsData, artistsData]) => {
        if (Array.isArray(tracksData)) setTracks(tracksData);
        if (Array.isArray(albumsData)) setAlbums(albumsData);
        if (Array.isArray(artistsData)) setArtists(artistsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Home load error:', err);
        setLoading(false);
      });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickPlay = (track, idx) => {
    playTrack(track, tracks, idx);
  };

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

  const quickJumpTracks = tracks.slice(0, 6);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-7 md:space-y-9 animate-in fade-in duration-300 select-none">
      {/* Top Filter Chips (Official Spotify: All, Music, Podcasts) */}
      <div className="flex items-center gap-2">
        {['All', 'Music', 'Podcasts'].map((chip) => {
          const isActive = homeFilter === chip.toLowerCase();
          return (
            <button
              key={chip}
              onClick={() => setHomeFilter(chip.toLowerCase())}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                isActive
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* Greeting Title */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
          {getGreeting()}
        </h1>

        {/* 6 Quick-play Bento Cards (The Official Spotify Home Grid) */}
        {quickJumpTracks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {quickJumpTracks.map((track, idx) => {
              const isCurrent = currentTrack && currentTrack.id === track.id;
              const isRowPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => handleQuickPlay(track, idx)}
                  className="group relative flex items-center bg-[#282828]/70 hover:bg-[#383838] transition-colors rounded-md overflow-hidden cursor-pointer shadow-sm pr-4"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-800 flex-shrink-0 relative shadow-md">
                    {track.albumArtPath ? (
                      <img
                        src={track.albumArtPath}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-400">
                        <Disc3 className="w-7 h-7" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 px-3 sm:px-4">
                    <p className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-[#b3b3b3] truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>

                  {/* Spotify Green Hover Play Button with Shadow */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 flex-shrink-0 shadow-2xl">
                    <button
                      className="w-10 h-10 rounded-full bg-[#1db954] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition-transform"
                      title={isRowPlaying ? 'Pause' : 'Play'}
                    >
                      {isRowPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <div className="w-0.5 bg-black animate-pulse h-2" />
                          <div className="w-0.5 bg-black animate-pulse h-3" />
                        </div>
                      ) : (
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 1: Made For You / Top Albums (Official Spotify Card Carousels) */}
      {albums.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              onClick={() => onNavigate('albums')}
              className="text-xl sm:text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer"
            >
              Popular albums
            </h2>
            <button
              onClick={() => onNavigate('albums')}
              className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline transition"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {albums.slice(0, 6).map((album, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('album-detail', { name: album.name })}
                className="group p-3 sm:p-4 bg-[#181818] hover:bg-[#282828] rounded-md transition duration-300 cursor-pointer flex flex-col relative"
              >
                <div className="w-full aspect-square rounded bg-neutral-800 overflow-hidden mb-3 relative shadow-md">
                  {album.albumArtPath ? (
                    <img
                      src={album.albumArtPath}
                      alt={album.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500">
                      <Disc3 className="w-12 h-12" />
                    </div>
                  )}

                  {/* Floating Green Play Button on Hover (Signature Spotify) */}
                  <button
                    onClick={(e) => handlePlayAlbumDirect(e, album.name)}
                    className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1db954] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-200"
                    title="Play album"
                  >
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white truncate">{album.name}</h3>
                <p className="text-xs text-[#b3b3b3] truncate mt-1">{album.artist}</p>
                <p className="text-[11px] text-[#727272] mt-0.5 font-mono">{album.trackCount} songs</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Popular Artists (Circular Cards with hover green button) */}
      {artists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              onClick={() => onNavigate('artists')}
              className="text-xl sm:text-2xl font-bold text-white tracking-tight hover:underline cursor-pointer"
            >
              Popular artists
            </h2>
            <button
              onClick={() => onNavigate('artists')}
              className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline transition"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artists.slice(0, 6).map((artist, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('artist-detail', { name: artist.name })}
                className="group p-3 sm:p-4 bg-[#181818] hover:bg-[#282828] rounded-md transition duration-300 cursor-pointer flex flex-col items-center text-center relative"
              >
                <div className="w-full aspect-square rounded-full bg-neutral-800 overflow-hidden mb-3 relative shadow-md">
                  {artist.albumArtPath ? (
                    <img
                      src={artist.albumArtPath}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500">
                      <Users className="w-12 h-12" />
                    </div>
                  )}

                  {/* Floating Play Button */}
                  <button
                    onClick={(e) => handlePlayArtistDirect(e, artist.name)}
                    className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1db954] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-200"
                    title="Play artist"
                  >
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white truncate w-full">{artist.name}</h3>
                <p className="text-xs text-[#b3b3b3] truncate mt-1">Artist</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: All Songs (Complete Master Catalog) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              All Tracks
            </h2>
            <p className="text-xs text-[#b3b3b3] mt-0.5 font-mono tabular-nums">
              {tracks.length} songs available
            </p>
          </div>

          <button
            onClick={() => {
              if (tracks.length > 0) playTrack(tracks[0], tracks, 0);
            }}
            className="text-xs font-bold text-[#1db954] hover:underline"
          >
            Play from top
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#b3b3b3] text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-[#1db954] border-t-transparent animate-spin mx-auto mb-3" />
            <span>Loading Spotify library...</span>
          </div>
        ) : (
          <TrackList
            tracks={tracks}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
          />
        )}
      </section>
    </div>
  );
}
