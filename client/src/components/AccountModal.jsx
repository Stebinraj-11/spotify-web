import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Sliders,
  LogOut,
  Radio,
  HardDrive,
  Music,
  Heart,
  ListMusic,
  Check,
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
  isAuthRequired,
}) {
  const [account, setAccount] = useState({
    username: 'Stebin Raj',
    email: 'stebin@spotify.local',
    avatarColor: '#1db954',
    streamingQuality: '320 kbps (High Fidelity)',
    plan: 'Spotify Personal Cloud Pro',
    isPasswordProtected: false,
    isEnvPasswordLocked: false,
    trackCount: 18,
    playlistCount: 1,
    likedCount: 7,
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [avatarColor, setAvatarColor] = useState('#1db954');
  const [streamingQuality, setStreamingQuality] = useState('320 kbps (High Fidelity)');

  // Password management
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
        setEmailInput(data.email || 'stebin@spotify.local');
        setAvatarColor(data.avatarColor || '#1db954');
        setStreamingQuality(data.streamingQuality || '320 kbps (High Fidelity)');
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
          email: emailInput.trim(),
          avatarColor,
          streamingQuality,
        }),
      });
      if (res.ok) {
        setSaveStatus('Profile updated!');
        setTimeout(() => setSaveStatus(''), 2500);
        fetchAccount();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'New passwords do not match', success: '', loading: false });
      return;
    }
    if (newPassword.length < 3) {
      setPasswordStatus({ error: 'Password must be at least 3 characters', success: '', loading: false });
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
        throw new Error(data.error || 'Failed to update password');
      }

      if (data.token) {
        setAuthToken(data.token);
      }

      setPasswordStatus({
        error: '',
        success: 'Password set successfully! Server is now locked with your key.',
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
    if (!confirm('Are you sure you want to remove the password? Anyone with your URL will be able to play songs.')) {
      return;
    }
    const current = prompt('Enter your current password to confirm removal:');
    if (!current) return;

    try {
      const res = await fetch('/api/account/remove-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to remove password');
        return;
      }
      alert('Password removed. Web player is now in open access mode.');
      fetchAccount();
    } catch (err) {
      alert(err.message);
    }
  };

  const currentGrad =
    AVATAR_COLORS.find((c) => c.value === avatarColor)?.grad || 'from-[#1db954] to-emerald-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <User className="w-5 h-5 text-[#1db954]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Account & Login</h2>
              <p className="text-xs text-neutral-400">Manage user profile, passcode & audio quality</p>
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
        <div className="py-4 space-y-6 flex-1 overflow-y-auto pr-1">
          {/* User Profile Card */}
          <div className="bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-lg">
            {/* Avatar */}
            <div
              className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr ${currentGrad} flex items-center justify-center text-black font-black text-2xl shadow-xl flex-shrink-0 border-2 border-white/20`}
            >
              {usernameInput.trim() ? usernameInput.trim()[0].toUpperCase() : 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-base sm:text-lg font-bold text-white truncate">
                  {usernameInput || 'Stebin Raj'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#1db954]/20 text-[#1db954] text-[10px] font-bold uppercase tracking-wider">
                  Master
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 truncate">{emailInput || 'Personal Cloud'}</p>

              <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-neutral-300">
                <span className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-[#1db954]" />
                  <strong className="text-white">{account.trackCount}</strong> songs
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ListMusic className="w-3.5 h-3.5 text-purple-400" />
                  <strong className="text-white">{account.playlistCount}</strong> playlist
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <strong className="text-white">{account.likedCount}</strong> liked
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 bg-neutral-900/60 p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#1db954]" />
              <span>Profile Settings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#1db954]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Account Email / Label</label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="stebin@spotify.local"
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#1db954]"
                />
              </div>
            </div>

            {/* Avatar Theme Colors */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-2">Avatar Theme</label>
              <div className="flex items-center gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAvatarColor(c.value)}
                    className={`w-7 h-7 rounded-full bg-gradient-to-tr ${c.grad} flex items-center justify-center transition transform active:scale-95 ${
                      avatarColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110' : 'opacity-70 hover:opacity-100'
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
                className="px-4 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs rounded-full transition shadow-md"
              >
                Save Profile
              </button>
            </div>
          </form>

          {/* Account Security & Password Lock */}
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1db954]" />
                <span>Security & Player Passcode</span>
              </h3>

              <div className="flex items-center gap-1.5 text-xs">
                {account.isPasswordProtected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1db954]/20 text-[#1db954] font-medium text-[11px]">
                    <Lock className="w-3 h-3" />
                    <span>Protected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium text-[11px]">
                    <Unlock className="w-3 h-3" />
                    <span>Open Access</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              {account.isPasswordProtected
                ? 'Your music player is protected with a password. You can change your password below, or lock your active session.'
                : 'Set a password passcode so only you can access and stream music from this web player.'}
            </p>

            {/* Set/Change Password Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-3 pt-1">
              {account.isPasswordProtected && (
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#1db954]"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    {account.isPasswordProtected ? 'New Password' : 'Set Password'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#1db954]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
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
                {account.isPasswordProtected && !account.isEnvPasswordLocked && (
                  <button
                    type="button"
                    onClick={handleRemovePassword}
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    Remove Password (Open Access)
                  </button>
                )}

                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-full transition ml-auto"
                >
                  {passwordStatus.loading
                    ? 'Updating...'
                    : account.isPasswordProtected
                    ? 'Update Password'
                    : 'Set Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Audio Preferences */}
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#1db954]" />
              <span>Audio Playback Preferences</span>
            </h3>

            <div className="flex items-center justify-between text-xs text-neutral-300 py-1">
              <div>
                <p className="font-semibold text-white">Streaming Bitrate</p>
                <p className="text-[11px] text-neutral-400">Cloud CDN audio quality</p>
              </div>
              <select
                value={streamingQuality}
                onChange={(e) => setStreamingQuality(e.target.value)}
                className="bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#1db954]"
              >
                <option value="320 kbps (High Fidelity)">320 kbps (High Fidelity)</option>
                <option value="160 kbps (Normal)">160 kbps (Standard)</option>
                <option value="96 kbps (Data Saver)">96 kbps (Data Saver)</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300 py-1 border-t border-white/5">
              <div>
                <p className="font-semibold text-white">Hardware Equalizer & DSP</p>
                <p className="text-[11px] text-neutral-400">Web Audio API 3-band tone controller</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenVisualizer) onOpenVisualizer();
                }}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Sliders className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Open EQ</span>
              </button>
            </div>
          </div>

          {/* Cloud Storage & Server Specs */}
          <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 text-xs text-neutral-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-300">Hosting Infrastructure</span>
              <span className="text-white font-mono">Vercel Serverless + Node.js</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-300">Audio CDN Storage</span>
              <span className="text-[#1db954] font-mono">Cloudinary CDN (RFC 7233 Seek)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-300">Database Engine</span>
              <span className="text-white font-mono">SQLite (WAL mode)</span>
            </div>
          </div>
        </div>

        {/* Footer: Lock Session / Close */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-shrink-0">
          {onLockSession ? (
            <button
              onClick={onLockSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-400 text-xs font-medium transition"
              title="Lock web player session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Session</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
