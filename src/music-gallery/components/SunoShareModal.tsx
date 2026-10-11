import React, { useState } from 'react';
import { X, Check, Copy, Share2, ExternalLink } from 'lucide-react';
import { SunoTrack } from '../types';
import { SUNO_PLAYLIST_INFO } from '../data/sunoData';

interface SunoShareModalProps {
  track: SunoTrack | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const SunoShareModal: React.FC<SunoShareModalProps> = ({
  track,
  isOpen,
  onClose,
  isDarkMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedPlaylist, setCopiedPlaylist] = useState(false);

  if (!isOpen) return null;

  const trackUrl = track ? track.sunoUrl : SUNO_PLAYLIST_INFO.url;
  const title = track ? track.title : SUNO_PLAYLIST_INFO.name;
  const subtitle = track ? track.artist : `Curated playlist by ${SUNO_PLAYLIST_INFO.user_display_name}`;

  const handleCopyTrack = async () => {
    try {
      await navigator.clipboard.writeText(trackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyPlaylist = async () => {
    try {
      await navigator.clipboard.writeText(SUNO_PLAYLIST_INFO.url);
      setCopiedPlaylist(true);
      setTimeout(() => setCopiedPlaylist(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - DomInNATEly`,
          text: `Listen to "${title}" on Suno!`,
          url: trackUrl,
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
          isDarkMode ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{track ? 'Share Track' : 'Share Playlist'}</h3>
              <p className="text-xs opacity-60">Spread the sound of DomInNATEly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item preview */}
        <div
          className={`p-3 rounded-xl border flex items-center gap-3 mb-5 ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <img
            src={track ? track.image : SUNO_PLAYLIST_INFO.cover}
            alt={title}
            className="w-12 h-12 rounded-lg object-cover border border-white/10"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm truncate">{title}</h4>
            <p className="text-xs text-cyan-400 truncate">{subtitle}</p>
          </div>
        </div>

        {/* Copy Link input */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider opacity-60 block mb-1.5">
              {track ? 'Track Suno Link' : 'Playlist Suno Link'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={trackUrl}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                  isDarkMode
                    ? 'bg-neutral-900 border-white/10 text-white/90'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                }`}
              />
              <button
                onClick={handleCopyTrack}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {track && (
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider opacity-60 block mb-1.5">
                DomInNATEly Top Hits Playlist Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={SUNO_PLAYLIST_INFO.url}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${
                    isDarkMode
                      ? 'bg-neutral-900 border-white/10 text-white/90'
                      : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                  }`}
                />
                <button
                  onClick={handleCopyPlaylist}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {copiedPlaylist ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPlaylist ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Native Share button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-4 py-2.5 rounded-xl border border-white/15 hover:border-cyan-400/50 flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Open System Share Menu</span>
          </button>
        )}

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <a
            href={SUNO_PLAYLIST_INFO.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
          >
            <span>Open Playlist on Suno</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
