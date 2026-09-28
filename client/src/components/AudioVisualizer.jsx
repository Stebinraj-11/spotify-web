import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Sliders, Activity, RotateCcw } from 'lucide-react';

export function AudioVisualizer() {
  const {
    analyserRef,
    isPlaying,
    currentTrack,
    isVisualizerOpen,
    setIsVisualizerOpen,
    eqGains,
    updateEqGain,
  } = usePlayer();

  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!isVisualizerOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    if (analyser) {
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    const render = () => {
      animationFrameId.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle wave animation when paused
        const time = Date.now() * 0.003;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(10, Math.sin(time + i * 0.2) * 20 + 25);
        }
      }

      const barWidth = (width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;

        // Gradient for each bar
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(0.5, '#1ed760');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(29, 185, 84, 0.4)';

        // Rounded bar caps
        const y = height - barHeight;
        const radius = Math.min(barWidth / 2, 4);

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, height);
        ctx.lineTo(x, height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        x += barWidth + 3;
      }
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isVisualizerOpen, analyserRef, isPlaying]);

  if (!isVisualizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#131319]/95 backdrop-blur-3xl border border-white/[0.12] rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.9)] p-6 sm:p-7 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1db954]/15 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] shadow-[0_0_16px_rgba(29,185,84,0.3)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Studio Visualizer & Equalizer</h2>
              <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-sm">
                {currentTrack ? `${currentTrack.title} • ${currentTrack.artist}` : 'Web Audio API Real-time DSP'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisualizerOpen(false)}
            className="p-2 rounded-full hover:bg-white/[0.1] text-neutral-400 hover:text-white transition active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer Canvas Box */}
        <div className="my-5 bg-black/70 rounded-2xl p-4 border border-white/[0.08] relative overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full h-44 block"
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
              <span className="text-[11px] font-bold tracking-wider text-neutral-300 uppercase bg-neutral-900/90 px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
                Play track to see live frequencies
              </span>
            </div>
          )}
        </div>

        {/* Hardware Equalizer Controls */}
        <div className="bg-white/[0.03] rounded-2xl p-4 sm:p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-[#1db954]" />
              <span>3-Band Studio DSP Equalizer</span>
            </div>
            <button
              onClick={() => {
                updateEqGain('bass', 0);
                updateEqGain('mid', 0);
                updateEqGain('treble', 0);
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#1db954] transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Curve</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {/* Bass */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex justify-between w-full text-[11px]">
                <span className="text-neutral-400 font-medium">Bass (200Hz)</span>
                <span className="text-[#1db954] font-mono tabular-nums font-bold">
                  {eqGains.bass > 0 ? `+${eqGains.bass}` : eqGains.bass} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={eqGains.bass}
                onChange={(e) => updateEqGain('bass', e.target.value)}
                className="w-full"
              />
              <span className="text-[10px] text-neutral-500">Low-end punch</span>
            </div>

            {/* Mid */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex justify-between w-full text-[11px]">
                <span className="text-neutral-400 font-medium">Mid (1kHz)</span>
                <span className="text-[#1db954] font-mono tabular-nums font-bold">
                  {eqGains.mid > 0 ? `+${eqGains.mid}` : eqGains.mid} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={eqGains.mid}
                onChange={(e) => updateEqGain('mid', e.target.value)}
                className="w-full"
              />
              <span className="text-[10px] text-neutral-500">Vocals & clarity</span>
            </div>

            {/* Treble */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex justify-between w-full text-[11px]">
                <span className="text-neutral-400 font-medium">Treble (3.2kHz)</span>
                <span className="text-[#1db954] font-mono tabular-nums font-bold">
                  {eqGains.treble > 0 ? `+${eqGains.treble}` : eqGains.treble} dB
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={eqGains.treble}
                onChange={(e) => updateEqGain('treble', e.target.value)}
                className="w-full"
              />
              <span className="text-[10px] text-neutral-500">Air & sparkle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
