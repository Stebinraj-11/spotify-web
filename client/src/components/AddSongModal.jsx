import React, { useState } from 'react';
import {
  X,
  Music,
  User,
  Disc3,
  Link,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Play,
  Layers,
} from 'lucide-react';

const COVER_PRESETS = [
  { name: 'Emerald Wave', bg: 'from-emerald-500 to-teal-800' },
  { name: 'Purple Night', bg: 'from-purple-600 to-indigo-900' },
  { name: 'Crimson Fire', bg: 'from-rose-500 to-red-900' },
  { name: 'Sunset Glow', bg: 'from-amber-500 to-orange-800' },
  { name: 'Cyber Blue', bg: 'from-cyan-500 to-blue-900' },
];

export function AddSongModal({ isOpen, onClose, onSongAdded }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [album, setAlbum] = useState('');
  const [albumArtPath, setAlbumArtPath] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [selectedPreset, setSelectedPreset] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setTitle('');
    setArtist('');
    setAudioUrl('');
    setAlbum('');
    setAlbumArtPath('');
    setGenre('Pop');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Please enter a song title');
      return;
    }
    if (!audioUrl.trim()) {
      setError('Please provide an audio stream URL (Cloudinary or MP3 link)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim() || 'Unknown Artist',
          album: album.trim() || 'Single',
          audioUrl: audioUrl.trim(),
          albumArtPath: albumArtPath.trim() || null,
          genre: genre.trim() || 'Pop',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add song');
      }

      setSuccess(`"${data.title}" added to your library!`);
      if (onSongAdded) {
        onSongAdded(data);
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center text-black font-bold">
              <Music className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Add Song to Library</h2>
              <p className="text-xs text-neutral-400">Add any Cloudinary or MP3 audio link to your songs</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Live Preview Card */}
          <div className="p-3 bg-neutral-900/90 rounded-xl border border-white/10 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-lg bg-neutral-800 flex-shrink-0 overflow-hidden relative shadow-md">
              {albumArtPath.trim() ? (
                <img
                  src={albumArtPath.trim()}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${COVER_PRESETS[selectedPreset].bg} flex items-center justify-center text-white`}
                >
                  <Music className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1db954]">
                  Preview
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">• {genre}</span>
              </div>
              <p className="text-sm font-bold text-white truncate">
                {title.trim() || 'Song Title'}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {artist.trim() || 'Artist Name'} • {album.trim() || 'Single'}
              </p>
            </div>
          </div>

          {/* Song Title & Artist */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Song Title</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mockingbird"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Artist Name</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Eminem"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] transition"
              />
            </div>
          </div>

          {/* Audio Link URL */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-[#1db954]" />
              <span>Audio Link URL (Cloudinary / MP3 link)</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              required
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/.../song.mp3"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] font-mono text-xs transition"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Paste any direct audio stream link from Cloudinary, CDN, Dropbox, or public server.
            </p>
          </div>

          {/* Album & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Album Name</span>
                <span className="text-[11px] text-neutral-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="e.g. Encore"
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Genre</span>
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#1db954] transition"
              >
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Pop">Pop</option>
                <option value="R&B">R&B</option>
                <option value="Rock">Rock</option>
                <option value="Electronic">Electronic</option>
                <option value="Indie">Indie</option>
                <option value="Classical">Classical</option>
                <option value="Acoustic">Acoustic</option>
              </select>
            </div>
          </div>

          {/* Cover Art URL (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#1db954]" />
              <span>Cover Art Image URL</span>
              <span className="text-[11px] text-neutral-500 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={albumArtPath}
              onChange={(e) => setAlbumArtPath(e.target.value)}
              placeholder="https://.../cover.jpg"
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1db954] transition"
            />
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1db954]/10 border border-[#1db954]/20 text-[#1db954] text-xs font-semibold">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-lg active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add Song</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
