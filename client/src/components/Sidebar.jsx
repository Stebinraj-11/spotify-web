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
  Settings,
  Trash2,
  Sparkles,
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
    `group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
      active
        ? 'text-white bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] border border-white/[0.08]'
        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-60 lg:w-64 bg-transparent flex flex-col gap-2 transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 p-3 bg-[#0c0c0e]/95 backdrop-blur-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Main Nav Shell */}
        <div className="bg-[#121217]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-xl">
          {/* Logo & Studio Badge */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1db954] to-[#1ed760] flex items-center justify-center text-black shadow-[0_0_16px_rgba(29,185,84,0.35)]">
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.206c-2.348-1.435-5.304-1.76-8.785-.964a.625.625 0 0 1-.282-1.218c3.808-.87 7.076-.496 9.718 1.119a.624.624 0 0 1 .206.857zm1.225-2.723a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 0 1-.454-1.493c3.632-1.103 8.147-.568 11.234 1.33a.78.78 0 0 1 .257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 1 1-.546-1.791c3.528-1.07 9.409-.865 13.146 1.355a.936.936 0 0 1-.981 1.592z" />
                  </svg>
                </div>
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">Spotify</span>
            </div>

            <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/25">
              Studio
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={navItemClass(currentView.type === 'home')}
            >
              <Home className={`w-4 h-4 transition ${currentView.type === 'home' ? 'text-[#1db954]' : 'group-hover:text-white'}`} />
              <span>Home</span>
            </button>
            <button
              onClick={() => onNavigate('search')}
              className={navItemClass(currentView.type === 'search')}
            >
              <Search className={`w-4 h-4 transition ${currentView.type === 'search' ? 'text-[#1db954]' : 'group-hover:text-white'}`} />
              <span>Search</span>
            </button>
          </nav>
        </div>

        {/* Library & Playlists Shell */}
        <div className="bg-[#121217]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex-1 p-3 flex flex-col min-h-0 shadow-xl overflow-hidden">
          {/* Library Header */}
          <div className="flex items-center justify-between px-2 py-1.5 text-neutral-400">
            <div className="flex items-center gap-2 font-bold text-xs tracking-wider uppercase text-neutral-400">
              <Library className="w-4 h-4 text-neutral-400" />
              <span>Your Library</span>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] hover:text-white text-neutral-400 border border-white/[0.05] transition active:scale-95"
              title="Create New Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Library Sub-navigation Segmented Controller */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/[0.05] my-2">
            {[
              { id: 'tracks', label: 'Songs' },
              { id: 'albums', label: 'Albums' },
              { id: 'artists', label: 'Artists' },
            ].map((tab) => {
              const isActive = currentView.type === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all duration-200 text-center truncate ${
                    isActive
                      ? 'bg-white text-black shadow-md font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* New Playlist Input Drawer */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="p-1 animate-in fade-in duration-200">
              <input
                type="text"
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Give your playlist a name..."
                className="w-full px-3 py-2 bg-neutral-900 border border-[#1db954]/50 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#1db954]"
                onBlur={() => !newPlaylistName && setIsCreating(false)}
              />
            </form>
          )}

          {/* Pinned: Liked Songs Card */}
          <div className="mt-1">
            <button
              onClick={() => onNavigate('liked')}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition text-left group ${
                currentView.type === 'liked'
                  ? 'bg-white/[0.08] border border-white/[0.08]'
                  : 'hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition duration-200">
                <Heart className="w-5 h-5 fill-white text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">Liked Songs</p>
                <p className="text-[11px] text-neutral-400">Auto collection</p>
              </div>
            </button>
          </div>

          {/* Custom Playlists Scroll List */}
          <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1">
            {playlists.length === 0 ? (
              <div className="py-6 px-2 text-center text-neutral-500 text-xs">
                No playlists yet. Click the + button above to create one.
              </div>
            ) : (
              playlists.map((pl) => {
                const isActive = currentView.type === 'playlist' && currentView.id === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => onNavigate('playlist', { id: pl.id })}
                    className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition select-none ${
                      isActive
                        ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                        : 'hover:bg-white/[0.04] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-neutral-800/80 border border-white/[0.05] flex items-center justify-center flex-shrink-0 overflow-hidden text-neutral-400 shadow-sm">
                        {pl.previewArt ? (
                          <img src={pl.previewArt} alt={pl.name} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate group-hover:text-white transition">
                          {pl.name}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono truncate">
                          {pl.trackCount || 0} {pl.trackCount === 1 ? 'song' : 'songs'}
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
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 text-neutral-500 transition rounded-md hover:bg-red-500/10"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-white/[0.06] mt-auto">
            <button
              onClick={onOpenAccount}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition active:scale-95"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Settings & Account</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1db954]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
