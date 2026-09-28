import React, { useState } from 'react';
import {
  Library,
  Plus,
  ArrowRight,
  Search,
  ListFilter,
  LayoutGrid,
  List,
  Pin,
  Heart,
  Music,
  Disc3,
  Users,
  Trash2,
  Volume2,
  FolderPlus,
  ListPlus,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

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
  const { currentTrack, isPlaying } = usePlayer();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'playlists' | 'artists' | 'albums'
  const [librarySearch, setLibrarySearch] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsCreating(false);
    setIsPlusMenuOpen(false);
  };

  const filteredPlaylists = playlists.filter((pl) => {
    if (filterType === 'artists' || filterType === 'albums') return false;
    if (librarySearch.trim()) {
      return pl.name.toLowerCase().includes(librarySearch.toLowerCase());
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden animate-in fade-in"
        />
      )}

      {/* Official Spotify Left Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 lg:w-72 xl:w-80 bg-black flex flex-col gap-2 p-1.5 md:p-2 transition-transform duration-300 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Your Library Card (Official Spotify Structure) */}
        <div className="bg-[#121212] rounded-lg flex-1 flex flex-col min-h-0 overflow-hidden shadow-inner">
          {/* Top Library Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2 text-[#b3b3b3]">
            <button
              onClick={() => onNavigate('tracks')}
              className="flex items-center gap-3 text-sm font-bold text-[#b3b3b3] hover:text-white transition"
              title="Collapse/Expand Library"
            >
              <Library className="w-6 h-6" />
              <span>Your Library</span>
            </button>

            <div className="flex items-center gap-1 relative">
              <button
                onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                className="p-1.5 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white transition"
                title="Create playlist or folder"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Plus Menu Dropdown */}
              {isPlusMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-52 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1.5 z-50 animate-in zoom-in-95 duration-100"
                >
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      setIsPlusMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-white/10 text-left"
                  >
                    <ListPlus className="w-4 h-4 text-[#b3b3b3]" />
                    <span>Create a new playlist</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsPlusMenuOpen(false);
                      alert('Folders are organized automatically.');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white hover:bg-white/10 text-left"
                  >
                    <FolderPlus className="w-4 h-4 text-[#b3b3b3]" />
                    <span>Create a playlist folder</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filter Pills (Official Spotify Chips) */}
          <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'playlists', label: 'Playlists' },
              { id: 'artists', label: 'Artists' },
              { id: 'albums', label: 'Albums' },
            ].map((chip) => {
              const isActive = filterType === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    setFilterType(chip.id);
                    if (chip.id === 'artists') onNavigate('artists');
                    if (chip.id === 'albums') onNavigate('albums');
                    if (chip.id === 'playlists') onNavigate('tracks');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Search in Library & Sort & View Mode Row */}
          <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[#b3b3b3]">
            {/* Expandable Search Button */}
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="p-1.5 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white transition flex-shrink-0"
                title="Search in Your Library"
              >
                <Search className="w-4 h-4" />
              </button>
              {isSearchExpanded && (
                <input
                  type="text"
                  autoFocus
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search in Your Library"
                  className="w-full bg-[#242424] text-xs text-white px-2 py-1 rounded placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/20 animate-in fade-in"
                />
              )}
            </div>

            {/* Recents Sort & List/Grid View Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[11px] font-medium hover:text-white cursor-pointer flex items-center gap-1">
                Recents <ListFilter className="w-3.5 h-3.5" />
              </span>

              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="p-1 text-[#b3b3b3] hover:text-white transition"
                title={viewMode === 'list' ? 'Switch to Grid view' : 'Switch to List view'}
              >
                {viewMode === 'list' ? (
                  <LayoutGrid className="w-3.5 h-3.5" />
                ) : (
                  <List className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* New Playlist Input */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="p-3 animate-in fade-in">
              <input
                type="text"
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="New playlist name..."
                className="w-full px-3 py-1.5 bg-[#242424] border border-[#1db954] rounded text-xs text-white placeholder-neutral-500 focus:outline-none"
                onBlur={() => !newPlaylistName && setIsCreating(false)}
              />
            </form>
          )}

          {/* Library Items List / Grid */}
          <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2 pr-1">
            {/* Pinned: Liked Songs (Official Spotify Pin Styling) */}
            {(filterType === 'all' || filterType === 'playlists') && (
              <div
                onClick={() => onNavigate('liked')}
                className={`group flex items-center gap-3 p-2 rounded-md transition cursor-pointer select-none ${
                  currentView.type === 'liked' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="w-12 h-12 rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center flex-shrink-0 shadow">
                  <Heart className="w-5 h-5 fill-white text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      currentView.type === 'liked' ? 'text-[#1db954]' : 'text-white'
                    }`}
                  >
                    Liked Songs
                  </p>
                  <p className="text-xs text-[#b3b3b3] truncate flex items-center gap-1.5 mt-0.5">
                    <Pin className="w-3 h-3 fill-[#1db954] text-[#1db954] transform rotate-45" />
                    <span>Playlist • Auto-collection</span>
                  </p>
                </div>

                {isPlaying && currentTrack?.isLiked && (
                  <Volume2 className="w-4 h-4 text-[#1db954] animate-pulse flex-shrink-0 mr-1" />
                )}
              </div>
            )}

            {/* Custom Playlists */}
            {filteredPlaylists.map((pl) => {
              const isActive = currentView.type === 'playlist' && currentView.id === pl.id;

              return (
                <div
                  key={pl.id}
                  onClick={() => onNavigate('playlist', { id: pl.id })}
                  className={`group flex items-center justify-between p-2 rounded-md transition cursor-pointer select-none ${
                    isActive ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden text-neutral-400">
                      {pl.previewArt ? (
                        <img src={pl.previewArt} alt={pl.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isActive ? 'text-[#1db954]' : 'text-white'
                        }`}
                      >
                        {pl.name}
                      </p>
                      <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
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
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 text-neutral-500 transition"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Quick shortcuts to Artists & Albums */}
            {(filterType === 'all' || filterType === 'artists') && (
              <div
                onClick={() => onNavigate('artists')}
                className={`group flex items-center gap-3 p-2 rounded-md transition cursor-pointer ${
                  currentView.type === 'artists' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-400">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">Artists</p>
                  <p className="text-xs text-[#b3b3b3] truncate mt-0.5">Artist Catalog</p>
                </div>
              </div>
            )}

            {(filterType === 'all' || filterType === 'albums') && (
              <div
                onClick={() => onNavigate('albums')}
                className={`group flex items-center gap-3 p-2 rounded-md transition cursor-pointer ${
                  currentView.type === 'albums' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="w-12 h-12 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-400">
                  <Disc3 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">Albums</p>
                  <p className="text-xs text-[#b3b3b3] truncate mt-0.5">Album Catalog</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
