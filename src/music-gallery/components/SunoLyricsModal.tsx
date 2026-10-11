import React, { useState } from 'react';
import { SunoTrack } from '../types';
import { X, Copy, Check, Music2, ExternalLink, Sparkles } from 'lucide-react';

interface SunoLyricsModalProps {
  track: SunoTrack | null;
  onClose: () => void;
  isDarkMode: boolean;
  onPlayTrack?: (track: SunoTrack) => void;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
}

export const SunoLyricsModal: React.FC<SunoLyricsModalProps> = ({
  track,
  onClose,
  isDarkMode,
  onPlayTrack,
  isPlaying,
  isCurrentTrack,
}) => {
  const [copied, setCopied] = useState(false);

  if (!track) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(track.lyrics || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format lyrics with highlighted section markers
  const renderLyrics = (raw: string) => {
    if (!raw || raw.trim() === '') {
      return (
        <div className="py-12 text-center text-sm opacity-60">
          Instrumental or no written lyrics provided for this track.
        </div>
      );
    }

    const lines = raw.split('\n');
    return (
      <div className="space-y-2 font-mono text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          const isHeader =
            trimmed.startsWith('**[') ||
            trimmed.startsWith('[') ||
            trimmed.endsWith(']**') ||
            trimmed.endsWith(']');
          const isEmphasis = trimmed.startsWith('*') && trimmed.endsWith('*');

          if (isHeader) {
            return (
              <div
                key={idx}
                className="pt-3 pb-1 text-cyan-400 font-bold tracking-wider uppercase text-[11px] sm:text-xs"
              >
                {trimmed.replace(/\*\*/g, '')}
              </div>
            );
          }

          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          return (
            <div
              key={idx}
              className={`${
                isEmphasis ? 'italic opacity-80' : isDarkMode ? 'text-white/90' : 'text-neutral-800'
              }`}
            >
              {trimmed.replace(/\*\*/g, '').replace(/\*/g, '')}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isDarkMode ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-4 ${
            isDarkMode ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={track.image}
              alt={track.title}
              className="w-12 h-12 rounded-lg object-cover shadow border border-white/10"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg truncate tracking-tight">{track.title}</h3>
              <p className="text-xs text-cyan-400 font-medium truncate">
                {track.artist} • {track.durationFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                  : 'bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Copy Lyrics"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={track.sunoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 hover:text-cyan-400 hover:border-cyan-400/40 text-white/80'
                  : 'bg-white border-neutral-300 hover:text-cyan-600 text-neutral-700'
              }`}
              title="Open on Suno.com"
            >
              <span className="hidden sm:inline">Suno</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-neutral-200 text-neutral-600'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tags bar if any */}
        {track.tags && track.tags.length > 0 && (
          <div
            className={`px-5 py-2.5 border-b flex flex-wrap gap-1.5 text-[11px] ${
              isDarkMode ? 'border-white/5 bg-black/40' : 'border-neutral-100 bg-neutral-100/50'
            }`}
          >
            <span className="opacity-50 uppercase tracking-wider text-[10px] self-center mr-1 font-mono">
              Styles:
            </span>
            {track.tags.map((tag, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded-full border ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-white/80' : 'bg-white border-neutral-200 text-neutral-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Lyrics Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
          {renderLyrics(track.lyrics)}
        </div>

        {/* Footer actions */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="flex items-center gap-2 text-white/50 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-generated vocals and production via Suno v4.5</span>
          </div>

          {onPlayTrack && (
            <button
              onClick={() => onPlayTrack(track)}
              className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>{isCurrentTrack && isPlaying ? 'Pause Audio' : 'Play Audio'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
