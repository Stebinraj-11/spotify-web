import React, { useState } from 'react';
import { Lock, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { setAuthToken } from '../utils/api';

export function LoginModal({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Incorrect password');
      }

      setAuthToken(data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
        {/* Spotify Logo */}
        <div className="w-16 h-16 rounded-full bg-[#1db954] flex items-center justify-center text-black mb-6 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">Personal Music Server</h2>
        <p className="text-xs text-neutral-400 mt-2 max-w-xs">
          This streaming instance is password protected. Enter your server key to unlock playback.
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Server Password"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#1db954] transition"
              required
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Unlocking...</span>
              </>
            ) : (
              <span>Unlock Web Player</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
