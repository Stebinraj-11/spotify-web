import React, { useState } from 'react';
import {
  Home,
  Search,
  Library,
  Music,
  Disc3,
  Users,
  Heart,
  Plus,
  User,
  Trash2,
} from 'lucide-react';

export function Sidebar({
  currentView,
  onNavigate,
  playlists = [],
  onCreatePlaylist,
  onDeletePlaylist,
  onOpenAccount,
  isMobileOpen,
  onCloseMobile,
}) {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const navItemClass = (active) =>
    `flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
      active
        ? 'text-white bg-white/10'
        : 'text-neutral-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-black flex flex-col p-3 gap-2 transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Main Nav Box */}
        <div className="bg-[#121212] rounded-xl p-4 flex flex-col gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 py-1 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.206c-2.348-1.435-5.304-1.76-8.785-.964a.625.625 0 0 1-.282-1.218c3.808-.87 7.076-.496 9.718 1.119a.624.624 0 0 1 .206.857zm1.225-2.723a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 0 1-.454-1.493c3.632-1.103 8.147-.568 11.234 1.33a.78.78 0 0 1 .257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 1 1-.546-1.791c3.528-1.07 9.409-.865 13.146 1.355a.936.936 0 0 1-.981 1.592z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">Spotify</span>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5">
            <button
              onClick={() => onNavigate('home')}
              className={navItemClass(currentView.type === 'home')}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => onNavigate('search')}
              className={navItemClass(currentView.type === 'search')}
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </nav>
        </div>

        {/* Library & Playlists Box */}
        <div className="bg-[#121212] rounded-xl flex-1 p-3 flex flex-col min-h-0">
          {/* Library Header */}
          <div className="flex items-center justify-between px-3 py-2 text-neutral-400">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Library className="w-5 h-5" />
              <span>Your Library</span>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 rounded-full hover:bg-white/10 hover:text-white transition text-neutral-400"
              title="Create Playlist"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Library Sub-navigation Pills */}
          <div className="flex items-center gap-1.5 px-2 py-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onNavigate('tracks')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                currentView.type === 'tracks'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10'
              }`}
            >
              Songs
            </button>
            <button
              onClick={() => onNavigate('albums')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                currentView.type === 'albums'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10'
              }`}
            >
              Albums
            </button>
            <button
              onClick={() => onNavigate('artists')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                currentView.type === 'artists'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10'
              }`}
            >
              Artists
            </button>
          </div>

          {/* New Playlist Input */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="p-2 animate-in fade-in">
              <input
                type="text"
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                className="w-full px-3 py-1.5 bg-neutral-900 border border-white/20 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954]"
                onBlur={() => !newPlaylistName && setIsCreating(false)}
              />
            </form>
          )}

          {/* Pinned Playlists: Liked Songs */}
          <div className="mt-2 space-y-1">

            <button
              onClick={() => onNavigate('liked')}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition text-left group ${
                currentView.type === 'liked' ? 'bg-white/10 text-white' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">Liked Songs</p>
                <p className="text-xs text-neutral-400">Auto-playlist</p>
              </div>
            </button>
          </div>

          {/* Playlists List */}
          <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1">
            {playlists.map((pl) => {
              const isActive = currentView.type === 'playlist' && currentView.id === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => onNavigate('playlist', { id: pl.id })}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                    isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden text-neutral-400">
                      {pl.previewArt ? (
                        <img src={pl.previewArt} alt={pl.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-white">
                        {pl.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        Playlist • {pl.trackCount || 0} songs
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete playlist "${pl.name}"?`)) {
                        onDeletePlaylist(pl.id);
                      }
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition text-neutral-500"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Links */}
          <div className="pt-3 border-t border-white/5 space-y-1 mt-auto">
            <button
              onClick={onOpenAccount}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition"
            >
              <User className="w-4 h-4 text-[#1db954]" />
              <span>Account & Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
