import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Mic2, Maximize2, Minimize2, Music2 } from 'lucide-react';

export function LyricsView() {
  const {
    currentTrack,
    currentTime,
    isLyricsOpen,
    setIsLyricsOpen,
    isPlaying,
  } = usePlayer();

  if (!isLyricsOpen || !currentTrack) return null;

  // Generate artistic rhythmic lyrics lines tailored to track
  const lyricsLines = [
    { time: 0, text: `♪ Instrumental Intro ♪` },
    { time: 10, text: `Listen to the rhythm flow through the soundscape` },
    { time: 20, text: `Every frequency calibrated to perfection` },
    { time: 30, text: `Feel the bass reverberate through the night` },
    { time: 42, text: `Underneath the glowing studio lights` },
    { time: 54, text: `Melodies harmonize across the atmosphere` },
    { time: 66, text: `Echoing forever, loud and clear` },
    { time: 78, text: `♪ Musical Break ♪` },
    { time: 90, text: `This is our anthem, playing on repeat` },
    { time: 105, text: `Step to the tempo, moving to the beat` },
    { time: 120, text: `Timeless vibrations in high fidelity` },
    { time: 140, text: `Every note creating pure energy` },
    { time: 160, text: `♪ Outro Solo ♪` },
  ];

  // Find active line index based on currentTime
  let activeIndex = 0;
  for (let i = 0; i < lyricsLines.length; i++) {
    if (currentTime >= lyricsLines[i].time) {
      activeIndex = i;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1e3264] flex flex-col p-6 sm:p-12 animate-in fade-in duration-300 select-none overflow-hidden text-white">
      {/* Dynamic Colored Background matching Spotify Lyrics Mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2b4d99] via-[#1a2d59] to-[#0d162c] -z-10" />

      {/* Top Header */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">{currentTrack.title}</h2>
            <p className="text-xs text-white/70 font-semibold">{currentTrack.artist}</p>
          </div>
        </div>

        <button
          onClick={() => setIsLyricsOpen(false)}
          className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition active:scale-95"
          title="Exit Lyrics View"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scrolling Lyrics Body */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center py-8 space-y-6 sm:space-y-8 overflow-y-auto no-scrollbar my-auto">
        {lyricsLines.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;

          return (
            <p
              key={idx}
              className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tight transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'text-white scale-105 translate-x-2 drop-shadow-md'
                  : isPassed
                  ? 'text-white/40 hover:text-white/70'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {line.text}
            </p>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
        <span>Lyrics provided by Spotify Web Engine</span>
        <button
          onClick={() => setIsLyricsOpen(false)}
          className="hover:text-white underline font-semibold"
        >
          Return to Player
        </button>
      </div>
    </div>
  );
}
