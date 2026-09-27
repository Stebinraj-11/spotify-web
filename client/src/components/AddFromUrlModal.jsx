import React, { useState, useEffect } from 'react';
import {
  X,
  Link,
  Download,
  CheckCircle,
  AlertCircle,
  CloudDownload,
  Loader2,
  Music2,
  Sparkles,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export function AddFromUrlModal({ isOpen, onClose, onTrackAdded }) {
  const [url, setUrl] = useState('');
  const [downloadId, setDownloadId] = useState(null);
  const [status, setStatus] = useState(null); // { status, progress, totalBytes, receivedBytes, error, track, filename }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sampleTracks, setSampleTracks] = useState([]);
  const [batchImporting, setBatchImporting] = useState(false);
  const [batchJobs, setBatchJobs] = useState([]);

  // Fetch samples on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/samples')
        .then((r) => r.json())
        .then((data) => setSampleTracks(data))
        .catch(console.warn);
    }
  }, [isOpen]);

  // Poll active single download
  useEffect(() => {
    if (!downloadId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/downloads/${downloadId}`);
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data);

        if (data.status === 'completed') {
          clearInterval(interval);
          setIsSubmitting(false);
          if (onTrackAdded) onTrackAdded(data.track);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error('Download poll error:', err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [downloadId, onTrackAdded]);

  // Poll batch import jobs
  useEffect(() => {
    if (!batchImporting || batchJobs.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/downloads');
        const allDownloads = await res.json();
        const map = new Map(allDownloads.map((d) => [d.id, d]));

        let allFinished = true;
        setBatchJobs((prev) =>
          prev.map((job) => {
            const current = map.get(job.downloadId);
            if (current) {
              if (current.status !== 'completed' && current.status !== 'failed') {
                allFinished = false;
              }
              return { ...job, ...current };
            }
            return job;
          })
        );

        if (allFinished) {
          setBatchImporting(false);
          clearInterval(interval);
          if (onTrackAdded) onTrackAdded();
        }
      } catch (err) {
        console.error('Batch poll error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [batchImporting, batchJobs.length, onTrackAdded]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    setStatus({ status: 'connecting', progress: 0 });

    try {
      const res = await fetch('/api/tracks/from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start download');
      }

      setDownloadId(data.downloadId);
      setUrl('');
    } catch (err) {
      setIsSubmitting(false);
      setStatus({ status: 'failed', error: err.message });
    }
  };

  const handleImportSamples = async () => {
    setBatchImporting(true);
    try {
      const res = await fetch('/api/tracks/import-samples', { method: 'POST' });
      const data = await res.json();
      setBatchJobs(data.jobs || []);
    } catch (err) {
      console.error('Error importing samples:', err);
      setBatchImporting(false);
    }
  };

  const handleDownloadSingleSample = (sampleUrl) => {
    setUrl(sampleUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1db954]/20 flex items-center justify-center text-[#1db954]">
              <CloudDownload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Track from Direct URL</h2>
              <p className="text-xs text-neutral-400">
                Downloads to local library & extracts ID3 metadata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Direct URL Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Direct Audio File URL (.mp3, .m4a, .flac)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../song.mp3"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#1db954] transition"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !url.trim()}
                  className="px-5 py-2.5 rounded-lg bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold text-sm flex items-center gap-2 transition flex-shrink-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Active Download Progress State */}
            {status && (
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/10 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white truncate max-w-xs">
                    {status.filename || 'Audio stream'}
                  </span>
                  <span className="text-neutral-400 font-mono">
                    {status.status === 'completed' && '100%'}
                    {status.status === 'downloading' && `${status.progress}%`}
                    {status.status === 'processing' && 'Processing tags...'}
                    {status.status === 'connecting' && 'Connecting...'}
                    {status.status === 'failed' && 'Error'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      status.status === 'failed'
                        ? 'bg-red-500'
                        : status.status === 'completed'
                        ? 'bg-[#1db954]'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${
                        status.status === 'completed'
                          ? 100
                          : status.status === 'failed'
                          ? 100
                          : Math.max(5, status.progress || 0)
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>
                    {status.totalBytes > 0
                      ? `${formatBytes(status.receivedBytes)} / ${formatBytes(status.totalBytes)}`
                      : status.receivedBytes > 0
                      ? `${formatBytes(status.receivedBytes)} downloaded`
                      : ''}
                  </span>
                  {status.status === 'completed' && (
                    <span className="text-[#1db954] flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Cached & Added to Library!
                    </span>
                  )}
                  {status.status === 'failed' && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {status.error || 'Download failed'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Quick Import Cloud Platform Tracks */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1db954]" />
                <h3 className="text-sm font-semibold text-white">Your Cloud Storage Tracks</h3>
              </div>
              <button
                onClick={handleImportSamples}
                disabled={batchImporting}
                className="text-xs bg-[#1db954]/20 hover:bg-[#1db954]/30 text-[#1db954] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {batchImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Importing Cloud Tracks...
                  </>
                ) : (
                  <>
                    <CloudDownload className="w-3.5 h-3.5" />
                    Import All 7 Cloud Tracks
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-3">
              One-click import for the Cloudinary audio tracks you provided.
            </p>

            <div className="space-y-2">
              {sampleTracks.map((sample, idx) => {
                const job = batchJobs.find((j) => j.url === sample.url);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 flex-shrink-0">
                        <Music2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{sample.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{sample.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {job ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-neutral-400">
                            {job.status === 'completed' && (
                              <span className="text-[#1db954] flex items-center gap-1 font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" /> Ready
                              </span>
                            )}
                            {job.status === 'downloading' && `${job.progress}%`}
                            {job.status === 'processing' && 'Tagging...'}
                            {job.status === 'failed' && (
                              <span className="text-red-400">Failed</span>
                            )}
                          </span>
                          {job.status === 'downloading' && (
                            <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1db954]"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownloadSingleSample(sample.url)}
                          className="px-2.5 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Paste URL</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
