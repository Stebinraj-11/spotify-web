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
    return <div className="p-8 text-neutral-400">Loading playlist...</div>;
  }

  if (!playlist) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <p>Playlist not found.</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs"
        >
          Back to Home
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
      {/* Header */}
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#253835] via-[#121212] to-[#121212] flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 pb-6 sm:pb-8">
        <div className="w-36 h-36 sm:w-56 sm:h-56 rounded-xl bg-neutral-800 shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
          {playlist.tracks && playlist.tracks.length > 0 && playlist.tracks[0].albumArtPath ? (
            <img
              src={playlist.tracks[0].albumArtPath}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-20 h-20 text-neutral-500" />
          )}
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <span className="text-xs uppercase tracking-widest text-neutral-300 font-bold">
            Playlist
          </span>

          {isEditing ? (
            <div className="mt-2 space-y-2 max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-900 border border-white/20 rounded text-xl font-bold text-white focus:outline-none focus:border-[#1db954]"
                placeholder="Playlist name"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-900 border border-white/20 rounded text-xs text-white focus:outline-none focus:border-[#1db954]"
                placeholder="Add an optional description..."
                rows={2}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded bg-[#1db954] text-black text-xs font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded bg-white/10 text-white text-xs flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                <h1 className="text-2xl sm:text-5xl font-black text-white leading-tight truncate">
                  {playlist.name}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {playlist.description && (
                <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-xl">
                  {playlist.description}
                </p>
              )}
            </>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-neutral-300 mt-2 sm:mt-4 font-medium">
            <span className="font-bold text-white">Personal Library</span>
            <span>•</span>
            <span>
              {playlist.tracks?.length || 0} {playlist.tracks?.length === 1 ? 'song' : 'songs'}
            </span>
            {playlist.totalDurationSec > 0 && (
              <>
                <span>•</span>
                <span className="font-mono text-neutral-400">
                  {formatDuration(playlist.totalDurationSec)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action controls & Tracks list */}
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={handlePlayAll}
              disabled={!playlist.tracks || playlist.tracks.length === 0}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black flex items-center justify-center transition shadow-lg active:scale-95"
              title="Play Playlist"
            >
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-0.5" />
            </button>
            <button
              onClick={handleShuffleAll}
              disabled={!playlist.tracks || playlist.tracks.length === 0}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-40"
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm(`Delete playlist "${playlist.name}"?`)) {
                onDeletePlaylist(playlist.id);
                onNavigate('home');
              }
            }}
            className="p-2.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-red-400 transition"
            title="Delete Playlist"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {playlist.tracks && playlist.tracks.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 text-sm">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
            This playlist is empty. Add songs from your library using the three-dot menu on any track!
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
