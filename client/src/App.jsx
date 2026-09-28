import React, { useState, useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { NowPlayingPanel } from './components/NowPlayingPanel';
import { LyricsView } from './components/LyricsView';
import { DevicePickerModal } from './components/DevicePickerModal';
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
  Home,
  Search,
  FolderOpen,
  ArrowDownToLine,
  Bell,
  User,
  LogOut,
  ExternalLink,
  Settings,
  Sparkles,
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

  // Modals & Menus
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountUser, setAccountUser] = useState('Stebin Raj');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [topSearchQuery, setTopSearchQuery] = useState('');

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
    setIsUserMenuOpen(false);
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
    setIsUserMenuOpen(false);
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

  // Wait for initial auth check
  if (!authChecked) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-neutral-400 gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#1db954] border-t-transparent animate-spin" />
        <p className="text-xs text-neutral-400 font-semibold tracking-wider">Connecting to Spotify...</p>
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
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden select-none font-sans">
      {/* ============================================================== */}
      {/* 🧭 OFFICIAL SPOTIFY TOP NAVIGATION BAR */}
      {/* ============================================================== */}
      <header className="h-14 sm:h-16 px-4 flex items-center justify-between bg-black z-30 select-none flex-shrink-0">
        {/* Left: Spotify Logo + History Nav Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1.5 cursor-pointer pr-1"
          >
            <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.857.206c-2.348-1.435-5.304-1.76-8.785-.964a.625.625 0 0 1-.282-1.218c3.808-.87 7.076-.496 9.718 1.119a.624.624 0 0 1 .206.857zm1.225-2.723a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 0 1-.454-1.493c3.632-1.103 8.147-.568 11.234 1.33a.78.78 0 0 1 .257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 1 1-.546-1.791c3.528-1.07 9.409-.865 13.146 1.355a.936.936 0 0 1-.981 1.592z" />
              </svg>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-white/10 text-neutral-300"
            title="Open Library Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Navigation circular arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBack}
              disabled={historyIndex === 0}
              className="w-8 h-8 rounded-full bg-[#131313] hover:bg-[#1a1a1a] disabled:opacity-40 text-white flex items-center justify-center transition"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
              className="w-8 h-8 rounded-full bg-[#131313] hover:bg-[#1a1a1a] disabled:opacity-40 text-white flex items-center justify-center transition hidden sm:flex"
              title="Go forward"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Home circle button + Global Search Bar (Official Spotify Layout) */}
        <div className="flex items-center gap-2 max-w-xl w-full mx-2 sm:mx-6 justify-center">
          {/* Home Icon Circle Button */}
          <button
            onClick={() => navigateTo('home')}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition transform active:scale-95 flex-shrink-0 ${
              currentView.type === 'home'
                ? 'bg-white text-black'
                : 'bg-[#1f1f1f] text-white hover:bg-[#282828] hover:scale-105'
            }`}
            title="Home"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          </button>

          {/* Official Centered Search Bar */}
          <div
            onClick={() => {
              if (currentView.type !== 'search') navigateTo('search');
            }}
            className="flex-1 max-w-md h-11 sm:h-12 rounded-full bg-[#1f1f1f] hover:bg-[#282828] border border-transparent hover:border-white/10 flex items-center px-3.5 sm:px-4 gap-3 cursor-pointer transition group"
          >
            <Search className="w-5 h-5 text-[#b3b3b3] group-hover:text-white flex-shrink-0" />
            <input
              type="text"
              value={topSearchQuery}
              onChange={(e) => {
                setTopSearchQuery(e.target.value);
                if (currentView.type !== 'search') navigateTo('search');
              }}
              placeholder="What do you want to play?"
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#727272] focus:outline-none"
            />
            <div className="border-l border-white/20 pl-3 hidden sm:flex items-center text-[#b3b3b3] hover:text-white" title="Browse">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Right: Explore Premium, Install App, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 relative">
          <button
            onClick={() => setIsAccountOpen(true)}
            className="hidden lg:flex items-center px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:scale-105 active:scale-95 transition"
          >
            Explore Premium
          </button>

          <button
            onClick={() => {
              alert('Spotify Web Player is already installed as a progressive web app.');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black hover:scale-105 active:scale-95 text-white text-xs font-bold transition hover:text-white"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Install App</span>
          </button>

          <button
            onClick={() => alert('No new notifications right now.')}
            className="w-8 h-8 rounded-full bg-black hover:bg-white/10 text-[#b3b3b3] hover:text-white flex items-center justify-center transition"
            title="What's New"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile Avatar with Spotify Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 rounded-full bg-[#1f1f1f] hover:scale-105 active:scale-95 border-2 border-white/20 flex items-center justify-center text-white font-bold text-xs transition"
              title={accountUser || 'Account'}
            >
              {accountUser ? accountUser[0].toUpperCase() : 'S'}
            </button>

            {isUserMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-52 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1.5 z-50 animate-in zoom-in-95 duration-100"
              >
                <button
                  onClick={() => {
                    setIsAccountOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10 text-left font-medium"
                >
                  <span>Account</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                <button
                  onClick={() => {
                    setIsAccountOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-white hover:bg-white/10 text-left font-medium"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsAccountOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10 text-left font-medium border-b border-white/10"
                >
                  <span>Settings</span>
                  <Settings className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-white hover:bg-white/10 text-left font-medium"
                >
                  <span>Log out</span>
                  <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 🖥️ MAIN BODY: SIDEBAR + CONTENT PANE + NOW PLAYING RIGHT PANEL */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden p-1.5 md:p-2 gap-2 relative">
        {/* Left Sidebar ("Your Library") */}
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

        {/* Central Scrollable Content Pane */}
        <main className="flex-1 bg-[#121212] rounded-lg flex flex-col overflow-hidden relative shadow-inner">
          <div className="flex-1 overflow-y-auto pb-32 md:pb-8">
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

        {/* Right Sidebar: Now Playing View (Official Spotify Right Panel) */}
        <NowPlayingPanel onNavigate={navigateTo} />
      </div>

      {/* Persistent Bottom Player Bar */}
      <PlayerBar />

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomNav currentView={currentView} onNavigate={navigateTo} />

      {/* Spotify Interactive Modals & Experiences */}
      <LyricsView />
      <DevicePickerModal />
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
