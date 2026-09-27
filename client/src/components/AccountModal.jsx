import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Sliders,
  LogOut,
  Music,
  Heart,
  ListMusic,
  Check,
  Volume2,
} from 'lucide-react';
import { setAuthToken } from '../utils/api';

const AVATAR_COLORS = [
  { name: 'Spotify Green', value: '#1db954', grad: 'from-[#1db954] to-emerald-400' },
  { name: 'Purple', value: '#9333ea', grad: 'from-purple-600 to-indigo-500' },
  { name: 'Sky Blue', value: '#0284c7', grad: 'from-sky-500 to-blue-600' },
  { name: 'Rose Pink', value: '#e11d48', grad: 'from-rose-500 to-pink-500' },
  { name: 'Sunset Amber', value: '#d97706', grad: 'from-amber-500 to-orange-500' },
];

export function AccountModal({
  isOpen,
  onClose,
  onOpenVisualizer,
  onLockSession,
}) {
  const [account, setAccount] = useState({
    username: 'Stebin Raj',
    email: '',
    avatarColor: '#1db954',
    streamingQuality: 'Very High (320 kbps)',
    isPasswordProtected: false,
    trackCount: 18,
    playlistCount: 1,
    likedCount: 7,
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [avatarColor, setAvatarColor] = useState('#1db954');
  const [streamingQuality, setStreamingQuality] = useState('Very High (320 kbps)');

  // Passcode management
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '', loading: false });

  const [saveStatus, setSaveStatus] = useState('');

  const fetchAccount = async () => {
    try {
      const res = await fetch('/api/account');
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
        setUsernameInput(data.username || 'Stebin Raj');
        setAvatarColor(data.avatarColor || '#1db954');
        setStreamingQuality(data.streamingQuality || 'Very High (320 kbps)');
      }
    } catch (err) {
      console.warn('Fetch account error:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccount();
      setPasswordStatus({ error: '', success: '', loading: false });
      setSaveStatus('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim() || 'Stebin Raj',
          avatarColor,
          streamingQuality,
        }),
      });
      if (res.ok) {
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
        fetchAccount();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'Passwords do not match', success: '', loading: false });
      return;
    }
    if (newPassword.length < 3) {
      setPasswordStatus({ error: 'Passcode must be at least 3 characters', success: '', loading: false });
      return;
    }

    setPasswordStatus({ error: '', success: '', loading: true });

    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update passcode');
      }

      if (data.token) {
        setAuthToken(data.token);
      }

      setPasswordStatus({
        error: '',
        success: 'Passcode saved! Player is now protected.',
        loading: false,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchAccount();
    } catch (err) {
      setPasswordStatus({ error: err.message, success: '', loading: false });
    }
  };

  const handleRemovePassword = async () => {
    if (!confirm('Remove passcode? Anyone opening this link will be able to play music.')) {
      return;
    }
    const current = prompt('Enter your current passcode to confirm:');
    if (!current) return;

    try {
      const res = await fetch('/api/account/remove-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Incorrect passcode');
        return;
      }
      alert('Passcode removed. Music player is now open.');
      fetchAccount();
    } catch (err) {
      alert(err.message);
    }
  };

  const currentGrad =
    AVATAR_COLORS.find((c) => c.value === avatarColor)?.grad || 'from-[#1db954] to-emerald-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center text-black font-bold">
              <User className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Account Center</h2>
              <p className="text-xs text-neutral-400">Profile, sound quality and passcode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="py-4 space-y-5 flex-1 overflow-y-auto pr-1">
          {/* User Profile Card */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-lg">
            {/* Avatar */}
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentGrad} flex items-center justify-center text-black font-black text-2xl shadow-xl flex-shrink-0 border-2 border-white/20`}
            >
              {usernameInput.trim() ? usernameInput.trim()[0].toUpperCase() : 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-lg font-bold text-white truncate">
                  {usernameInput || 'Stebin Raj'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1db954] text-black text-[10px] font-extrabold uppercase tracking-wider">
                  Spotify Premium
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">Personal Music Player</p>

              {/* Music Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-neutral-300">
                <span className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-[#1db954]" />
                  <strong className="text-white">{account.trackCount}</strong> songs
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <strong className="text-white">{account.likedCount}</strong> liked
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ListMusic className="w-3.5 h-3.5 text-purple-400" />
                  <strong className="text-white">{account.playlistCount}</strong> playlist
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3.5 bg-neutral-900/60 p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#1db954]" />
              <span>Edit Profile</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Your Name</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#1db954] transition"
              />
            </div>

            {/* Avatar Theme Colors */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">Avatar Color</label>
              <div className="flex items-center gap-2.5">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAvatarColor(c.value)}
                    className={`w-7 h-7 rounded-full bg-gradient-to-tr ${c.grad} flex items-center justify-center transition transform active:scale-95 ${
                      avatarColor === c.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  >
                    {avatarColor === c.value && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#1db954] font-medium">{saveStatus}</span>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs rounded-full transition shadow-md active:scale-95"
              >
                Save Name
              </button>
            </div>
          </form>

          {/* Sound & Playback */}
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-[#1db954]" />
              <span>Sound & Audio Quality</span>
            </h3>

            <div className="flex items-center justify-between text-xs py-1">
              <div>
                <p className="font-semibold text-white">Audio Quality</p>
                <p className="text-[11px] text-neutral-400">Streaming sound fidelity</p>
              </div>
              <select
                value={streamingQuality}
                onChange={(e) => setStreamingQuality(e.target.value)}
                className="bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#1db954]"
              >
                <option value="Very High (320 kbps)">Very High (320 kbps)</option>
                <option value="High (160 kbps)">High (160 kbps)</option>
                <option value="Data Saver (96 kbps)">Data Saver (96 kbps)</option>
              </select>
            </div>

            {onOpenVisualizer && (
              <div className="flex items-center justify-between text-xs py-1 border-t border-white/5 pt-2">
                <div>
                  <p className="font-semibold text-white">Sound Equalizer</p>
                  <p className="text-[11px] text-neutral-400">Adjust Bass, Mid & Treble</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVisualizer();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#1db954]" />
                  <span>Adjust EQ</span>
                </button>
              </div>
            )}
          </div>

          {/* App Security & Passcode */}
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1db954]" />
                <span>Player Passcode Protection</span>
              </h3>

              <div className="flex items-center gap-1 text-xs">
                {account.isPasswordProtected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1db954]/20 text-[#1db954] font-medium text-[11px]">
                    <Lock className="w-3 h-3" />
                    <span>Passcode On</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium text-[11px]">
                    <Unlock className="w-3 h-3" />
                    <span>No Passcode</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              {account.isPasswordProtected
                ? 'Your music player is locked with a passcode. Anyone visiting needs your passcode to listen.'
                : 'Set a passcode so only you can access your music library.'}
            </p>

            {/* Set/Change Passcode Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-3 pt-1">
              {account.isPasswordProtected && (
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">Current Passcode</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current passcode"
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#1db954]"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {account.isPasswordProtected ? 'New Passcode' : 'Set Passcode'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#1db954]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">Confirm Passcode</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter passcode"
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#1db954]"
                    required
                  />
                </div>
              </div>

              {passwordStatus.error && (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{passwordStatus.error}</span>
                </div>
              )}

              {passwordStatus.success && (
                <div className="flex items-center gap-1.5 text-xs text-[#1db954]">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{passwordStatus.success}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                {account.isPasswordProtected && (
                  <button
                    type="button"
                    onClick={handleRemovePassword}
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    Turn Off Passcode
                  </button>
                )}

                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-full transition ml-auto"
                >
                  {passwordStatus.loading
                    ? 'Saving...'
                    : account.isPasswordProtected
                    ? 'Update Passcode'
                    : 'Set Passcode'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer: Lock Session / Done */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-shrink-0">
          {onLockSession ? (
            <button
              onClick={onLockSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-400 text-xs font-medium transition"
              title="Lock music player"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Player</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-bold transition shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
