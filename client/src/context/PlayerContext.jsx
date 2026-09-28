import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { getAuthToken, authFetch } from '../utils/api';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const filtersRef = useRef({ bass: null, mid: null, treble: null });

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [originalQueue, setOriginalQueue] = useState([]);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isExpandedNowPlaying, setIsExpandedNowPlaying] = useState(false);
  const [isNowPlayingPanelOpen, setIsNowPlayingPanelOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);

  // Equalizer gains in dB (-12 to +12)
  const [eqGains, setEqGains] = useState({ bass: 0, mid: 0, treble: 0 });

  // Init Web Audio API on first user interaction
  const initWebAudio = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // Bass filter
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;
      bass.gain.value = eqGains.bass;

      // Mid filter
      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1;
      mid.gain.value = eqGains.mid;

      // Treble filter
      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 3200;
      treble.gain.value = eqGains.treble;

      // Analyser for sound visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      filtersRef.current = { bass, mid, treble };

      // Connect graph: source -> bass -> mid -> treble -> analyser -> destination
      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (err) {
      console.warn('Web Audio API initialization note:', err.message);
    }
  }, [eqGains]);

  const updateEqGain = (band, val) => {
    const num = parseFloat(val);
    setEqGains(prev => ({ ...prev, [band]: num }));
    if (filtersRef.current[band]) {
      filtersRef.current[band].gain.value = num;
    }
  };

  // Play track
  const playTrack = useCallback((track, newQueue = null, startIndex = 0) => {
    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (newQueue) {
      setOriginalQueue(newQueue);
      if (isShuffle) {
        const remaining = newQueue.filter(t => t.id !== track.id);
        // Shuffle remaining
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        const shuffledList = [track, ...remaining];
        setQueue(shuffledList);
        setQueueIndex(0);
      } else {
        setQueue(newQueue);
        const idx = newQueue.findIndex(t => t.id === track.id);
        setQueueIndex(idx !== -1 ? idx : startIndex);
      }
    }

    setCurrentTrack(track);
    setCurrentTime(0);

    if (audioRef.current) {
      const token = getAuthToken();
      audioRef.current.src = `/api/stream/${track.id}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Playback error:', err));
    }
  }, [initWebAudio, isShuffle]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0], queue, 0);
      }
      return;
    }

    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.warn('Play error:', err));
      }
    }
  }, [currentTrack, isPlaying, queue, playTrack, initWebAudio]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }
    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      playTrack(nextTrack);
    }
  }, [queue, queueIndex, repeatMode, playTrack]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeatMode === 'all' ? queue.length - 1 : 0;
    }
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setQueueIndex(prevIdx);
      playTrack(prevTrack);
    }
  }, [queue, queueIndex, currentTime, repeatMode, playTrack]);

  const seek = (time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (newVol) => {
    const vol = Math.max(0, Math.min(1, newVol));
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : vol;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  const toggleShuffle = () => {
    const next = !isShuffle;
    setIsShuffle(next);
    if (!currentTrack || queue.length === 0) return;

    if (next) {
      // Shuffle upcoming tracks while keeping current
      const remaining = originalQueue.filter(t => t.id !== currentTrack.id);
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      setQueue([currentTrack, ...remaining]);
      setQueueIndex(0);
    } else {
      setQueue(originalQueue);
      const originalIdx = originalQueue.findIndex(t => t.id === currentTrack.id);
      setQueueIndex(originalIdx !== -1 ? originalIdx : 0);
    }
  };

  const cycleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const addToQueue = (track) => {
    setQueue(prev => [...prev, track]);
    setOriginalQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex(prev => prev - 1);
    }
  };

  const reorderQueue = (newQueue) => {
    setQueue(newQueue);
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  };

  const toggleLike = async (trackId) => {
    try {
      const res = await authFetch(`/api/tracks/${trackId}/like`, { method: 'PATCH' });
      const data = await res.json();

      if (currentTrack && currentTrack.id === trackId) {
        setCurrentTrack(prev => ({ ...prev, isLiked: data.isLiked }));
      }

      setQueue(prev => prev.map(t => (t.id === trackId ? { ...t, isLiked: data.isLiked } : t)));
      return data.isLiked;
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  // Audio element events setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, playNext]);

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        analyserRef,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        isVisualizerOpen,
        isQueueOpen,
        isExpandedNowPlaying,
        isNowPlayingPanelOpen,
        isLyricsOpen,
        isDevicePickerOpen,
        eqGains,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        changeVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        toggleLike,
        setIsVisualizerOpen,
        setIsQueueOpen,
        setIsExpandedNowPlaying,
        setIsNowPlayingPanelOpen,
        setIsLyricsOpen,
        setIsDevicePickerOpen,
        updateEqGain,
      }}
    >
      <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
}
