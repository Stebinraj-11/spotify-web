import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Laptop, Speaker, Tv, Smartphone, Check, Radio } from 'lucide-react';

export function DevicePickerModal() {
  const {
    isDevicePickerOpen,
    setIsDevicePickerOpen,
    isPlaying,
    currentTrack,
  } = usePlayer();

  if (!isDevicePickerOpen) return null;

  return (
    <>
      <div
        onClick={() => setIsDevicePickerOpen(false)}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <div className="fixed bottom-28 right-6 z-50 w-80 sm:w-88 bg-[#282828] border border-white/10 rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-150 select-none text-white font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Speaker className="w-5 h-5 text-[#1db954]" />
            <h3 className="text-sm font-bold tracking-tight">Connect to a device</h3>
          </div>
          <button
            onClick={() => setIsDevicePickerOpen(false)}
            className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Device */}
        <div className="space-y-2">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/10 border border-[#1db954]/30 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#1db954]/20 flex items-center justify-center text-[#1db954]">
              <Laptop className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">This Web Browser</span>
                <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
              </div>
              <p className="text-[11px] text-[#1db954] font-medium flex items-center gap-1 mt-0.5">
                <Radio className="w-3 h-3" />
                Listening On This Computer
              </p>
            </div>
            <Check className="w-4 h-4 text-[#1db954]" />
          </div>
        </div>

        {/* Other Available Devices */}
        <div className="mt-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Select another device
          </span>

          <div className="space-y-1">
            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition cursor-pointer text-neutral-300 hover:text-white">
              <Speaker className="w-5 h-5 text-neutral-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">Living Room Speaker</p>
                <p className="text-[10px] text-neutral-500">AirPlay / Bluetooth</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition cursor-pointer text-neutral-300 hover:text-white">
              <Tv className="w-5 h-5 text-neutral-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">Smart TV Streaming</p>
                <p className="text-[10px] text-neutral-500">Spotify Connect</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition cursor-pointer text-neutral-300 hover:text-white">
              <Smartphone className="w-5 h-5 text-neutral-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">Mobile Device</p>
                <p className="text-[10px] text-neutral-500">Nearby Device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
