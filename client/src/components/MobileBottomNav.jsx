import React from 'react';
import { Home, Search, Library, Heart } from 'lucide-react';

export function MobileBottomNav({ currentView, onNavigate }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, view: 'home' },
    { id: 'search', label: 'Search', icon: Search, view: 'search' },
    { id: 'library', label: 'Library', icon: Library, view: 'tracks' },
    { id: 'liked', label: 'Liked', icon: Heart, view: 'liked' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0c0c10]/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 py-2 flex items-center justify-around select-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
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
            className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all duration-200 active:scale-90 ${
              isActive
                ? 'text-[#1db954]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive && tab.id === 'liked' ? 'fill-[#1db954]' : ''}`} />
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1db954] shadow-[0_0_6px_#1db954]" />
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
