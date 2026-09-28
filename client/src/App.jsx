import React, { useState, useEffect } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AudioVisualizer } from './components/AudioVisualizer';
import { QueueDrawer } from './components/QueueDrawer';
import { ExpandedNowPlaying } from './components/ExpandedNowPlaying';
import { AccountModal } from './components/AccountModal';
import { LoginModal } from './components/LoginModal';
import { getAuthToken, setAuthToken } from './utils/api';

import { HomeView } from './components/Views/HomeView';
import { SearchView } from './components/Views/SearchView';
import { TracksView } from './components/Views/TracksView';
import { AlbumsView } from './components/Views/AlbumsView';
import { AlbumDetailView } from './components/Views/AlbumDetailView';
import { ArtistsView } from './components/Views/ArtistsView';
import { ArtistDetailView } from './components/Views/ArtistDetailView';
import { LikedSongsView } from './components/Views/LikedSongsView';
import { PlaylistDetailView } from './components/Views/PlaylistDetailView';

import {
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  LogOut,
} from 'lucide-react';

function MainApp() {
  useKeyboardShortcuts();

  // Authentication State
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Navigation History Stack
  const [history, setHistory] = useState([{ type: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentView = history[historyIndex] || { type: 'home' };

  // Playlists State
  const [playlists, setPlaylists] = useState([]);

  // Modals & Drawers
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountUser, setAccountUser] = useState('Stebin');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check server auth status on load
  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/auth/status?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      setIsAuthRequired(data.authRequired);
      setIsAuthenticated(!data.authRequired || data.authenticated);
      setAuthChecked(true);

      if (!data.authRequired || data.authenticated) {
        fetchPlaylists();
        fetchAccountInfo();
      }
    } catch (err) {
      console.warn('Auth check error:', err);
      setAuthChecked(true);
    }
  };

  const fetchAccountInfo = async () => {
    try {
      const res = await fetch('/api/account');
      if (res.ok) {
        const data = await res.json();
        if (data.username) setAccountUser(data.username);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('spotify:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('spotify:unauthorized', handleUnauthorized);
  }, []);

  const handleLogout = () => {
    setAuthToken('');
    setIsAuthenticated(false);
  };

  const fetchPlaylists = () => {
    fetch('/api/playlists')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlaylists(data);
        }
      })
      .catch(console.warn);
  };

  const navigateTo = (viewType, params = {}) => {
    const nextView = { type: viewType, ...params };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextView);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setIsMobileSidebarOpen(false);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleCreatePlaylist = async (name) => {
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const newPl = await res.json();
      setPlaylists((prev) => [newPl, ...prev]);
      navigateTo('playlist', { id: newPl.id });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      if (currentView.type === 'playlist' && currentView.id === id) {
        navigateTo('home');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToPlaylist = async (playlistId, trackId) => {
    try {
      await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackAdded = () => {
    fetchPlaylists();
  };

  // Wait for initial auth check
  if (!authChecked) {
    return (
      <div className="h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center text-neutral-400 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin" />
          <div className="absolute inset-0 rounded-full blur-md bg-[#1db954]/20 animate-pulse" />
        </div>
        <p className="text-xs font-medium text-neutral-400 tracking-wide uppercase">Connecting to Music Library...</p>
      </div>
    );
  }

  // If password lock is active and not logged in
  if (isAuthRequired && !isAuthenticated) {
    return (
      <LoginModal
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          fetchPlaylists();
        }}
      />
    );
  }

  const getViewBreadcrumb = () => {
    switch (currentView.type) {
      case 'home': return 'Home';
      case 'search': return 'Search';
      case 'tracks': return 'Library / Songs';
      case 'albums': return 'Library / Albums';
      case 'artists': return 'Library / Artists';
      case 'liked': return 'Liked Songs';
      case 'playlist': {
        const pl = playlists.find(p => p.id === currentView.id);
        return pl ? `Playlist / ${pl.name}` : 'Playlist';
      }
      case 'album-detail': return `Album / ${currentView.name || ''}`;
      case 'artist-detail': return `Artist / ${currentView.name || ''}`;
      default: return 'Spotify';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090b] text-[#f4f4f5] overflow-hidden select-none relative">
      {/* Background Studio Ambient Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[400px] bg-[#1db954]/[0.04] rounded-full blur-[120px] animate-aura" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[140px]" />
      </div>

      {/* Upper Area: Sidebar + Scrollable View */}
      <div className="flex-1 flex overflow-hidden p-1.5 md:p-2 gap-2 z-10 relative">
        {/* Left Sidebar (Desktop fixed, Mobile off-canvas drawer) */}
        <Sidebar
          currentView={currentView}
          onNavigate={navigateTo}
          playlists={playlists}
          onCreatePlaylist={handleCreatePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          onOpenAccount={() => setIsAccountOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Pane with Doppelrand / Double-Bezel architecture */}
        <main className="flex-1 bg-[#121217]/90 rounded-2xl flex flex-col overflow-hidden relative border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Top Bar (Header) */}
          <header className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/[0.06] bg-[#121217]/80 backdrop-blur-xl sticky top-0 z-30">
            {/* Nav Arrows & Mobile Hamburger & Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 active:scale-95 transition"
                title="Open Library Menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleBack}
                  disabled={historyIndex === 0}
                  className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] disabled:opacity-25 text-white flex items-center justify-center transition active:scale-95"
                  title="Go back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleForward}
                  disabled={historyIndex >= history.length - 1}
                  className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] disabled:opacity-25 text-white flex items-center justify-center transition hidden sm:flex active:scale-95"
                  title="Go forward"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Breadcrumb pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[11px] font-medium text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1db954]" />
                <span className="truncate max-w-[220px]">{getViewBreadcrumb()}</span>
              </div>
            </div>

            {/* Account & Profile Badge in Header */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsAccountOpen(true)}
                className="group flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-semibold transition active:scale-95 shadow-sm"
                title="Account Settings"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1db954] to-[#1ed760] flex items-center justify-center text-black font-extrabold text-[11px] shadow-sm">
                  {accountUser ? accountUser[0].toUpperCase() : 'S'}
                </div>
                <span className="hidden sm:inline font-medium text-neutral-200 group-hover:text-white transition">
                  {accountUser || 'Account'}
                </span>
              </button>

              {isAuthRequired && (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-500/20 transition"
                  title="Lock / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>

          {/* View Container with bottom padding so content clears mobile floating mini player + bottom nav */}
          <div className="flex-1 overflow-y-auto pb-36 md:pb-8">
            {currentView.type === 'home' && (
              <HomeView
                onNavigate={navigateTo}
                onOpenAccount={() => setIsAccountOpen(true)}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
              />
            )}

            {currentView.type === 'search' && (
              <SearchView
                onNavigate={navigateTo}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
              />
            )}

            {currentView.type === 'tracks' && (
              <TracksView
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
              />
            )}

            {currentView.type === 'albums' && (
              <AlbumsView onNavigate={navigateTo} />
            )}

            {currentView.type === 'album-detail' && (
              <AlbumDetailView
                albumName={currentView.name}
                onNavigate={navigateTo}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
              />
            )}

            {currentView.type === 'artists' && (
              <ArtistsView onNavigate={navigateTo} />
            )}

            {currentView.type === 'artist-detail' && (
              <ArtistDetailView
                artistName={currentView.name}
                onNavigate={navigateTo}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
              />
            )}

            {currentView.type === 'liked' && (
              <LikedSongsView
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
              />
            )}

            {currentView.type === 'playlist' && (
              <PlaylistDetailView
                playlistId={currentView.id}
                onNavigate={navigateTo}
                onDeletePlaylist={handleDeletePlaylist}
                playlists={playlists}
                onAddToPlaylist={handleAddToPlaylist}
              />
            )}
          </div>
        </main>
      </div>

      {/* Persistent Bottom Player Bar (Desktop Full Bar + Mobile Floating Mini Player) */}
      <PlayerBar />

      {/* Mobile Bottom Tab Bar (Spotify Native iOS/Android Feel) */}
      <MobileBottomNav currentView={currentView} onNavigate={navigateTo} />

      {/* Overlay Modals & Drawers */}
      <AudioVisualizer />
      <QueueDrawer />
      <ExpandedNowPlaying />
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => {
          setIsAccountOpen(false);
          fetchAccountInfo();
          checkAuth();
        }}
        onOpenVisualizer={() => {
          setIsAccountOpen(false);
        }}
        onLockSession={handleLogout}
        isAuthRequired={isAuthRequired}
      />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <MainApp />
    </PlayerProvider>
  );
}
