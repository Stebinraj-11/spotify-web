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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#131319]/95 border border-white/[0.12] rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.9)] p-8 sm:p-9 flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#1db954]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon Box */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1db954] to-[#1ed760] flex items-center justify-center text-black mb-5 shadow-[0_4px_24px_rgba(29,185,84,0.4)]">
          <Lock className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">Spotify Studio Server</h2>
        <p className="text-xs text-neutral-400 mt-2 max-w-xs leading-relaxed">
          This streaming library instance is protected. Enter your server password to unlock the web console.
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Server Password"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.04] border border-white/[0.1] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]/50 transition shadow-inner"
              required
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 py-2 px-3 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_24px_rgba(29,185,84,0.35)] active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
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
