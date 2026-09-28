import React, { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { TrackList } from '../TrackList';
import { Play, Shuffle, Music, Edit3, Trash2, Check, X } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export function PlaylistDetailView({
  playlistId,
  onNavigate,
  onDeletePlaylist,
  playlists = [],
  onAddToPlaylist,
}) {
  const { playTrack, toggleShuffle } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchPlaylist = () => {
    setLoading(true);
    fetch(`/api/playlists/${playlistId}`)
      .then((r) => r.json())
      .then((data) => {
        setPlaylist(data);
        setEditName(data.name || '');
        setEditDescription(data.description || '');
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch playlist error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-neutral-400">
        <div className="w-8 h-8 rounded-full border-2 border-[#1db954]/20 border-t-[#1db954] animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading playlist data...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-8 text-center text-neutral-400 space-y-4">
        <p className="text-white font-bold">Playlist not found.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 rounded-full text-white text-xs font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * playlist.tracks.length);
      playTrack(playlist.tracks[randomIndex], playlist.tracks, randomIndex);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
        }),
      });
      const updated = await res.json();
      setPlaylist((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
    } catch (err) {
      console.error('Update playlist error:', err);
    }
  };

  const handleRemoveTrack = async (plId, trackId) => {
    try {
      await fetch(`/api/playlists/${plId}/tracks/${trackId}`, { method: 'DELETE' });
      setPlaylist((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((t) => t.id !== trackId),
      }));
    } catch (err) {
      console.error('Remove track error:', err);
    }
  };

  const handleMoveTrack = async (index, direction) => {
    const targetIndex = index + direction;
    if (!playlist.tracks || targetIndex < 0 || targetIndex >= playlist.tracks.length) return;

    const newTracks = [...playlist.tracks];
    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIndex];
    newTracks[targetIndex] = temp;

    setPlaylist((prev) => ({ ...prev, tracks: newTracks }));

    try {
      await fetch(`/api/playlists/${playlistId}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds: newTracks.map((t) => t.id) }),
      });
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 md:p-10 bg-gradient-to-b from-[#182b28] via-[#111c1a] to-transparent flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-8 pb-6 sm:pb-8 relative overflow-hidden">
        {/* Playlist Art Cover Box */}
        <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-2xl bg-neutral-900 border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
          {playlist.tracks && playlist.tracks.length > 0 && playlist.tracks[0].albumArtPath ? (
            <img
              src={playlist.tracks[0].albumArtPath}
              alt={playlist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <Music className="w-20 h-20 text-neutral-600" />
          )}
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#1db954] font-black">
            Playlist
          </span>

          {isEditing ? (
            <div className="mt-3 space-y-2.5 max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-white/20 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-[#1db954]"
                placeholder="Playlist name"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-900 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#1db954]"
                placeholder="Add an optional description..."
                rows={2}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 rounded-full bg-[#1db954] text-black text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight truncate">
                  {playlist.name}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white border border-white/[0.06] transition active:scale-95"
                  title="Edit details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {playlist.description && (
                <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-xl">
                  {playlist.description}
                </p>
              )}
            </>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs sm:text-sm text-neutral-300 mt-3 sm:mt-4 font-medium">
            <span className="font-bold text-white">Custom Mix</span>
            <span className="text-neutral-500">•</span>
            <span className="font-mono tabular-nums">
              {playlist.tracks?.length || 0} {playlist.tracks?.length === 1 ? 'song' : 'songs'}
            </span>
            {playlist.totalDurationSec > 0 && (
              <>
                <span className="text-neutral-500">•</span>
                <span className="font-mono tabular-nums text-neutral-400">
                  {formatDuration(playlist.totalDurationSec)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls & Tracks */}
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              onClick={handlePlayAll}
              disabled={!playlist.tracks || playlist.tracks.length === 0}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black flex items-center justify-center transition-all duration-200 shadow-[0_4px_24px_rgba(29,185,84,0.35)] transform hover:scale-105 active:scale-95"
              title="Play Playlist"
            >
              <Play className="w-6 h-6 fill-black ml-0.5" />
            </button>
            <button
              onClick={handleShuffleAll}
              disabled={!playlist.tracks || playlist.tracks.length === 0}
              className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white transition active:scale-90 disabled:opacity-40"
              title="Shuffle"
            >
              <Shuffle className="w-4.5 h-4.5" />
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm(`Delete playlist "${playlist.name}"?`)) {
                onDeletePlaylist(playlist.id);
                onNavigate('home');
              }
            }}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 border border-white/[0.06] hover:border-rose-500/20 transition active:scale-95"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {playlist.tracks && playlist.tracks.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 text-sm space-y-3">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-30 text-neutral-500" />
            <p className="text-white font-bold">This playlist is empty</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Add songs from your library using the three-dot menu on any track!
            </p>
          </div>
        ) : (
          <TrackList
            tracks={playlist.tracks || []}
            playlistId={playlist.id}
            onRemoveFromPlaylist={handleRemoveTrack}
            onMoveTrack={handleMoveTrack}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
          />
        )}
      </div>
    </div>
  );
}
