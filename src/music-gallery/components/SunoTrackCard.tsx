import React from 'react';
import { SunoTrack } from '../types';
import { Play, Pause } from 'lucide-react';

interface SunoTrackCardProps {
  track: SunoTrack;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: SunoTrack) => void;
  onOpenLyrics?: (track: SunoTrack) => void;
  onOpenEmbed?: (track: SunoTrack) => void;
  onOpenShare?: (track: SunoTrack) => void;
  isDarkMode: boolean;
}

export const SunoTrackCard: React.FC<SunoTrackCardProps> = ({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  isDarkMode,
}) => {
  return (
    <div
      id={`suno-track-card-${track.id}`}
      className={`group relative rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
        isCurrentTrack
          ? isDarkMode
            ? 'bg-white/[0.08] border-cyan-500/50 shadow-lg shadow-cyan-500/10'
            : 'bg-cyan-50/70 border-cyan-400 shadow-md'
          : isDarkMode
          ? 'bg-neutral-900/60 border-white/5 hover:border-white/20 hover:bg-neutral-900/90'
          : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
      }`}
    >
      {/* Top Cover Image Area */}
      <div 
        onClick={() => onPlay(track)}
        className="relative aspect-square w-full overflow-hidden bg-neutral-950 cursor-pointer"
      >
        <img
          src={track.image}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Index Badge */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white font-mono text-[11px] font-bold border border-white/10">
          #{track.index}
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-cyan-300 font-mono text-[11px] font-bold border border-white/10">
          {track.durationFormatted}
        </div>

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-95 transition-opacity" />

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(track);
            }}
            aria-label={isCurrentTrack && isPlaying ? 'Pause track' : 'Play track'}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform duration-300 active:scale-95 ${
              isCurrentTrack && isPlaying
                ? 'bg-cyan-400 text-black shadow-cyan-500/50 scale-105 ring-4 ring-cyan-400/40'
                : 'bg-white/90 text-black hover:bg-cyan-400 opacity-90 group-hover:opacity-100 group-hover:scale-110 shadow-lg'
            }`}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Equalizer Waveform indicator when playing */}
        {isCurrentTrack && isPlaying && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-cyan-400/40 flex items-center gap-1">
            <div className="w-1 h-3 bg-cyan-400 animate-pulse" />
            <div className="w-1 h-4 bg-cyan-400 animate-pulse delay-75" />
            <div className="w-1 h-2 bg-cyan-400 animate-pulse delay-150" />
            <span className="text-[10px] font-mono font-bold text-cyan-300 ml-1 uppercase">Playing</span>
          </div>
        )}
      </div>

      {/* Card Content Area - Just the Track Name */}
      <div 
        onClick={() => onPlay(track)}
        className="p-3.5 sm:p-4 cursor-pointer"
      >
        <h3
          className={`font-bold text-sm sm:text-base leading-snug line-clamp-1 transition-colors ${
            isCurrentTrack
              ? isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
              : isDarkMode
              ? 'text-white hover:text-cyan-400'
              : 'text-neutral-900 hover:text-cyan-600'
          }`}
          title={track.title}
        >
          {track.title}
        </h3>
      </div>
    </div>
  );
};
