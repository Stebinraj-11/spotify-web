import React, { useState, useEffect } from 'react';
import {
  X,
  Folder,
  RefreshCw,
  HardDrive,
  Music,
  Disc3,
  Users,
  CheckCircle,
  Loader2,
  FolderOpen,
} from 'lucide-react';

export function SettingsModal({ isOpen, onClose, onRescanCompleted }) {
  const [settings, setSettings] = useState(null);
  const [musicDirInput, setMusicDirInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
      setMusicDirInput(data.musicDir || '');
      setIsScanning(data.scanStatus?.isScanning || false);
      setScanProgress(data.scanStatus);
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  // Poll scan status when scanning
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/scan/status');
        const status = await res.json();
        setScanProgress(status);

        if (!status.isScanning) {
          setIsScanning(false);
          setMessage('Library scan completed!');
          fetchSettings();
          if (onRescanCompleted) onRescanCompleted();
        }
      } catch (err) {
        console.error('Scan poll error:', err);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isScanning, onRescanCompleted]);

  if (!isOpen) return null;

  const handleUpdateDir = async (e) => {
    e.preventDefault();
    if (!musicDirInput.trim()) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ musicDir: musicDirInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update directory');
      }

      setIsScanning(true);
      setMessage('Music directory updated. Scan in progress...');
      fetchSettings();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTriggerScan = async () => {
    setIsScanning(true);
    setMessage('Initiated library scan...');

    try {
      await fetch('/api/scan', { method: 'POST' });
    } catch (err) {
      console.error('Trigger scan error:', err);
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <HardDrive className="w-5 h-5 text-[#1db954]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Library Settings</h2>
              <p className="text-xs text-neutral-400">Configure music folder and storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5 flex-1 overflow-y-auto">
          {/* Library Stats */}
          {settings && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-neutral-900/80 p-3 rounded-xl border border-white/5 text-center">
                <Music className="w-4 h-4 text-[#1db954] mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{settings.trackCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">Tracks</p>
              </div>
              <div className="bg-neutral-900/80 p-3 rounded-xl border border-white/5 text-center">
                <Disc3 className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{settings.albumCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">Albums</p>
              </div>
              <div className="bg-neutral-900/80 p-3 rounded-xl border border-white/5 text-center">
                <Users className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{settings.artistCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">Artists</p>
              </div>
              <div className="bg-neutral-900/80 p-3 rounded-xl border border-white/5 text-center">
                <FolderOpen className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{settings.playlistCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400">Playlists</p>
              </div>
            </div>
          )}

          {/* Directory Configuration Form */}
          <form onSubmit={handleUpdateDir} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Music Library Path
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Folder className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={musicDirInput}
                  onChange={(e) => setMusicDirInput(e.target.value)}
                  placeholder="e.g. C:\Music or /music"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#1db954] transition font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating || !musicDirInput.trim()}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-medium text-sm transition flex-shrink-0"
              >
                {isUpdating ? 'Saving...' : 'Update Path'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              Point to any folder containing mp3, flac, m4a, ogg, or wav files on your machine.
            </p>
          </form>

          {/* Rescan Button & Live Scan Status */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Manual Library Scan</h4>
                <p className="text-xs text-neutral-400">
                  Recursively scan folder for new, modified, or deleted files
                </p>
              </div>
              <button
                onClick={handleTriggerScan}
                disabled={isScanning}
                className="px-4 py-2 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
              </button>
            </div>

            {/* Scan Progress Bar */}
            {isScanning && scanProgress && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span className="truncate max-w-xs">{scanProgress.currentFile || 'Scanning files...'}</span>
                  <span className="font-mono">
                    {scanProgress.processedFiles} / {scanProgress.totalFiles}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1db954] transition-all"
                    style={{
                      width: `${
                        scanProgress.totalFiles > 0
                          ? (scanProgress.processedFiles / scanProgress.totalFiles) * 100
                          : 10
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 text-xs text-[#1db954] pt-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
