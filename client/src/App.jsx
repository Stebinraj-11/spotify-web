import React, { useState, useEffect } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AudioVisualizer } from './components/AudioVisualizer';
import { QueueDrawer } from './components/QueueDrawer';
import { ExpandedNowPlaying } from './components/ExpandedNowPlaying';
import { AddFromUrlModal } from './components/AddFromUrlModal';
import { SettingsModal } from './components/SettingsModal';
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
  Link,
  Settings,
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
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
      }
    } catch (err) {
      console.warn('Auth check error:', err);
      setAuthChecked(true);
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
      <div className="h-screen w-screen bg-black flex items-center justify-center text-neutral-400">
        <div className="w-8 h-8 rounded-full border-2 border-[#1db954] border-t-transparent animate-spin" />
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

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans select-none">
      {/* Upper Area: Sidebar + Scrollable View */}
      <div className="flex-1 flex overflow-hidden p-1.5 md:p-2 gap-2">
        {/* Left Sidebar (Desktop fixed, Mobile off-canvas drawer) */}
        <Sidebar
          currentView={currentView}
          onNavigate={navigateTo}
          playlists={playlists}
          onCreatePlaylist={handleCreatePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          onOpenUrlModal={() => setIsUrlModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Pane */}
        <main className="flex-1 bg-[#121212] rounded-xl flex flex-col overflow-hidden relative shadow-inner">
          {/* Top Bar (Header) */}
          <header className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/5 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-30">
            {/* Nav Arrows & Mobile Hamburger */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-full hover:bg-white/10 text-neutral-300 active:scale-95"
                title="Open Library Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                onClick={handleBack}
                disabled={historyIndex === 0}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 disabled:opacity-30 text-white flex items-center justify-center transition"
                title="Go back"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={handleForward}
                disabled={historyIndex >= history.length - 1}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 disabled:opacity-30 text-white flex items-center justify-center transition hidden sm:flex"
                title="Go forward"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsUrlModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                <Link className="w-3.5 h-3.5 text-[#1db954]" />
                <span className="hidden sm:inline">Add URL</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition active:scale-95"
                title="Settings & Scan"
              >
                <Settings className="w-4 h-4" />
              </button>

              {isAuthRequired && (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-red-400 transition"
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
                onOpenUrlModal={() => setIsUrlModalOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
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
      <AddFromUrlModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onTrackAdded={handleTrackAdded}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRescanCompleted={fetchPlaylists}
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
