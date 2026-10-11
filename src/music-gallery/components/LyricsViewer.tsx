import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface LyricsViewerProps {
  lyrics: string;
  title?: string;
  artist?: string;
  isDarkMode: boolean;
  maxHeight?: string;
  compact?: boolean;
}

export const LyricsViewer: React.FC<LyricsViewerProps> = ({
  lyrics,
  title,
  artist,
  isDarkMode,
  maxHeight = 'max-h-[360px]',
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!lyrics) return;
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!lyrics || lyrics.trim() === '') {
    return (
      <div className="py-10 text-center text-xs opacity-60 flex flex-col items-center justify-center gap-2">
        <FileText className="w-6 h-6 opacity-40 text-cyan-400" />
        <p>No written lyrics available for this track.</p>
      </div>
    );
  }

  const lines = lyrics.split('\n');

  return (
    <div className="w-full flex flex-col">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Full Song Lyrics
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : isDarkMode
              ? 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
          }`}
          title="Copy lyrics to clipboard"
          aria-label="Copy lyrics"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 opacity-70" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Scrollable Lyrics Content */}
      <div
        className={`overflow-y-auto pr-2 space-y-2 ${maxHeight} custom-scrollbar font-mono ${
          compact ? 'text-[11px] leading-relaxed' : 'text-xs sm:text-sm leading-relaxed'
        }`}
      >
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          const isHeader =
            trimmed.startsWith('**[') ||
            trimmed.startsWith('[') ||
            trimmed.endsWith(']**') ||
            trimmed.endsWith(']');

          if (isHeader) {
            const cleanHeader = trimmed.replace(/\*\*/g, '');
            return (
              <div
                key={idx}
                className="pt-2 pb-0.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs"
              >
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 inline-block">
                  {cleanHeader}
                </span>
              </div>
            );
          }

          return (
            <p
              key={idx}
              className={`${
                isDarkMode ? 'text-white/80' : 'text-neutral-800'
              } hover:text-cyan-300 transition-colors select-text`}
            >
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
};
