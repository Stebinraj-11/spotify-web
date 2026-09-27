import React from 'react';
import { Home, Search, Library, Heart } from 'lucide-react';

export function MobileBottomNav({ currentView, onNavigate }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, view: 'home' },
    { id: 'search', label: 'Search', icon: Search, view: 'search' },
    { id: 'library', label: 'Your Library', icon: Library, view: 'tracks' },
    { id: 'liked', label: 'Liked', icon: Heart, view: 'liked' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#121212]/95 backdrop-blur-lg border-t border-white/10 px-4 py-2 flex items-center justify-around select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          (tab.id === 'home' && currentView.type === 'home') ||
          (tab.id === 'search' && currentView.type === 'search') ||
          (tab.id === 'library' && ['tracks', 'albums', 'artists', 'playlist', 'album-detail', 'artist-detail'].includes(currentView.type)) ||
          (tab.id === 'liked' && currentView.type === 'liked');

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.view)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition ${
              isActive ? 'text-[#1db954]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive && tab.id === 'liked' ? 'fill-[#1db954]' : ''}`} />
            <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
