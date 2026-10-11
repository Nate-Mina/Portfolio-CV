import React from 'react';
import { Track, SunoTrack } from '../types';
import { getTrackLyrics } from '../data/lyrics';
import { LyricsViewer } from './LyricsViewer';
import { X, Play, Pause, Music2, Share2 } from 'lucide-react';

interface LyricsModalProps {
  track: Track | SunoTrack | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  onPlay?: (track: any) => void;
  onOpenShare?: (track: any) => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  track,
  isOpen,
  onClose,
  isDarkMode,
  isPlaying = false,
  isCurrentTrack = false,
  onPlay,
  onOpenShare,
}) => {
  if (!isOpen || !track) return null;

  const fullLyrics = getTrackLyrics(track);
  const trackThumbnail = 'thumbnail' in track ? track.thumbnail : track.image;

  return (
    <div
      id="lyrics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        id="lyrics-modal-container"
        className={`relative w-full max-w-2xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-neutral-950/95 border-white/10 text-white'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-black/30">
          <div className="flex items-center gap-3 min-w-0">
            {trackThumbnail && (
              <img
                src={trackThumbnail}
                alt={track.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10 shadow-md"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                Track #{track.index} • {'isSuno' in track && track.isSuno ? 'Suno AI Collection' : 'YouTube Media'}
              </span>
              <h3 className="text-base sm:text-lg font-black truncate leading-tight">
                {track.title}
              </h3>
              <p className={`text-xs truncate ${isDarkMode ? 'text-white/60' : 'text-neutral-500'}`}>
                {track.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onPlay && (
              <button
                onClick={() => onPlay(track)}
                className="w-10 h-10 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center font-bold shadow-md transition-all transform active:scale-95"
                title={isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
                aria-label={isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
              aria-label="Close lyrics modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lyrics Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          <LyricsViewer
            lyrics={fullLyrics}
            title={track.title}
            artist={track.artist}
            isDarkMode={isDarkMode}
            maxHeight="max-h-[50vh]"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-mono">
            <Music2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>DomInNATEly Official Lyrics</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenShare && (
              <button
                onClick={() => onOpenShare(track)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3 h-3 text-cyan-400" />
                <span>Share</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
