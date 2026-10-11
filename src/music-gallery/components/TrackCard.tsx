import React from 'react';
import { Play, Pause, Share2, Youtube, Clock, Music, FileText } from 'lucide-react';
import { Track } from '../types';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Track) => void;
  onOpenShare: (track: Track) => void;
  onOpenDetails?: (track: Track) => void;
  onOpenLyrics?: (track: Track) => void;
  isDarkMode: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onOpenShare,
  onOpenDetails,
  onOpenLyrics,
  isDarkMode,
}) => {
  return (
    <div
      id={`track-card-${track.id}`}
      className={`group rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden relative ${
        isCurrentTrack
          ? isDarkMode
            ? 'bg-white/10 border-cyan-400/80 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-400/40'
            : 'bg-cyan-50/40 border-cyan-500 shadow-md ring-1 ring-cyan-400/30'
          : isDarkMode
          ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15 shadow-sm hover:shadow-md'
          : 'bg-white hover:bg-neutral-50/90 border-neutral-200 hover:border-neutral-300 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Thumbnail + Play Overlay */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <img
          src={track.thumbnail}
          alt={track.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Gradient Index Badge */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {track.index.toString().padStart(2, '0')}
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/80 backdrop-blur-xs text-cyan-400 border border-white/10 flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3 h-3 text-cyan-400" />
            {track.duration}
          </span>
        </div>

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            id={`play-btn-${track.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(track);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 ${
              isCurrentTrack && isPlaying
                ? 'bg-cyan-400 text-black scale-100 ring-4 ring-cyan-400/40 font-bold'
                : 'bg-white/90 hover:bg-white text-black backdrop-blur-sm group-hover:scale-110 shadow-lg'
            }`}
            aria-label={isCurrentTrack && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Animated Equalizer when actively playing */}
        {isCurrentTrack && isPlaying && (
          <div className="absolute bottom-2.5 left-2.5 flex items-end gap-1 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-xs border border-cyan-400/40">
            <span className="w-1 bg-cyan-400 rounded-full animate-eq-1" />
            <span className="w-1 bg-cyan-300 rounded-full animate-eq-2" />
            <span className="w-1 bg-purple-400 rounded-full animate-eq-3" />
            <span className="w-1 bg-cyan-400 rounded-full animate-eq-4" />
            <span className="text-[10px] font-mono text-cyan-300 ml-1 font-bold uppercase tracking-wider">Playing</span>
          </div>
        )}
      </div>

      {/* Card Content - Clean Track Name */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => onPlay(track)}
            className={`text-sm sm:text-base font-bold line-clamp-1 cursor-pointer transition-colors ${
              isCurrentTrack
                ? isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
                : isDarkMode
                ? 'text-white hover:text-cyan-400'
                : 'text-neutral-900 hover:text-cyan-700'
            }`}
            title={track.title}
          >
            {track.title}
          </h3>
        </div>

        {/* Card Actions & Social Sharing Buttons for Every Song */}
        <div
          className={`mt-4 pt-3.5 border-t flex items-center justify-between gap-2 ${
            isDarkMode ? 'border-white/10' : 'border-neutral-200'
          }`}
        >
          {/* Left: Play button & Lyrics button */}
          <div className="flex items-center gap-1.5">
            <button
              id={`card-play-toggle-${track.id}`}
              onClick={() => onPlay(track)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isCurrentTrack && isPlaying
                  ? 'bg-cyan-500 text-black font-bold'
                  : isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
              }`}
            >
              {isCurrentTrack && isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            {onOpenLyrics && (
              <button
                id={`card-lyrics-btn-${track.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLyrics(track);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-cyan-400 border border-white/10'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
                title="View Full Lyrics"
                aria-label={`View lyrics for ${track.title}`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Lyrics</span>
              </button>
            )}
          </div>

          {/* Right: Social Media Sharing buttons for this song */}
          <div className="flex items-center gap-1">
            {/* Quick Share to X / Twitter */}
            <a
              id={`quick-x-share-${track.id}`}
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Listening to "${track.title}" by DomInNATEly 🔥`
              )}&url=${encodeURIComponent(track.youtubeUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-md transition-colors ${
                isDarkMode
                  ? 'text-white/60 hover:text-cyan-400 hover:bg-white/10'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200'
              }`}
              title="Share on X"
              aria-label={`Share ${track.title} on X`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Quick Share to Facebook */}
            <a
              id={`quick-fb-share-${track.id}`}
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(track.youtubeUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-md transition-colors ${
                isDarkMode
                  ? 'text-white/60 hover:text-cyan-400 hover:bg-white/10'
                  : 'text-neutral-600 hover:text-[#1877F2] hover:bg-neutral-200'
              }`}
              title="Share on Facebook"
              aria-label={`Share ${track.title} on Facebook`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Watch on YouTube button */}
            <a
              id={`card-youtube-link-${track.id}`}
              href={track.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-md transition-colors ${
                isDarkMode
                  ? 'text-white/60 hover:text-cyan-400 hover:bg-white/10'
                  : 'text-neutral-600 hover:text-[#FF0000] hover:bg-neutral-200'
              }`}
              title="Watch Video on YouTube"
              aria-label={`Watch ${track.title} on YouTube`}
            >
              <Youtube className="w-3.5 h-3.5 fill-current" />
            </a>

            {/* All Social Share Options Modal Trigger */}
            <button
              id={`open-share-modal-${track.id}`}
              onClick={() => onOpenShare(track)}
              className={`p-1.5 rounded-md transition-colors ${
                isDarkMode
                  ? 'text-white/60 hover:text-cyan-400 hover:bg-white/10'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
              title="More Share Options (WhatsApp, Reddit, Copy Link, etc.)"
              aria-label={`Share ${track.title}`}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

