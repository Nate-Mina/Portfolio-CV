import React from 'react';
import { X, Play, Pause, Youtube, Share2, Clock, Music, Disc } from 'lucide-react';
import { Track } from '../types';
import { getTrackLyrics } from '../data/lyrics';
import { LyricsViewer } from './LyricsViewer';

interface TrackDetailModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Track) => void;
  onOpenShare: (track: Track) => void;
  isDarkMode: boolean;
}

export const TrackDetailModal: React.FC<TrackDetailModalProps> = ({
  track,
  isOpen,
  onClose,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onOpenShare,
  isDarkMode
}) => {
  if (!isOpen || !track) return null;

  return (
    <div
      id="track-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        id="track-detail-container"
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all relative ${
          isDarkMode
            ? 'bg-[#0a0a0a] border-white/10 text-white'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-track-detail-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white border border-white/10 backdrop-blur-sm transition-colors"
          aria-label="Close track details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Artwork */}
        <div className="relative aspect-video w-full bg-black">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

          {/* Floating Play Action */}
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <button
              onClick={() => onPlay(track)}
              className="w-12 h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-xl shadow-cyan-950/60 font-bold transform active:scale-95 transition-transform"
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>
            <div>
              <span className="text-xs uppercase font-mono font-bold text-cyan-400">Track #{track.index.toString().padStart(2, '0')}</span>
              <h2 className="text-xl font-bold leading-tight drop-shadow-md text-white">{track.title}</h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div
            className={`flex items-center justify-between gap-4 pb-4 border-b ${
              isDarkMode ? 'border-white/10' : 'border-neutral-200'
            }`}
          >
            <div>
              <p className="text-xs text-white/40">Artist / Band</p>
              <p className="text-sm font-bold text-cyan-400">{track.artist}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Duration</p>
              <p className="text-sm font-mono font-semibold flex items-center gap-1 text-cyan-400">
                <Clock className="w-3.5 h-3.5" />
                {track.duration}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40">Category</p>
              <p className="text-sm font-semibold capitalize text-white/90">{track.category}</p>
            </div>
          </div>

          {/* Description & Story */}
          {track.description && (
            <div className="mt-4">
              <h4 className="text-xs uppercase font-semibold tracking-wider text-white/40 mb-1.5">
                Track Background
              </h4>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/70' : 'text-neutral-700'}`}>
                {track.description}
              </p>
            </div>
          )}

          {/* Full Song Lyrics */}
          <div
            className={`mt-4 p-4 rounded-2xl border ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <LyricsViewer
              lyrics={getTrackLyrics(track)}
              title={track.title}
              artist={track.artist}
              isDarkMode={isDarkMode}
              maxHeight="max-h-[280px]"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => onOpenShare(track)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Song</span>
            </button>

            <a
              href={track.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-cyan-400'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200'
              }`}
            >
              <Youtube className="w-4 h-4 text-[#FF0000]" />
              <span>Watch on YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
