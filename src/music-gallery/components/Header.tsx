import React from 'react';
import { ExternalLink, Music2, Share2, Disc3, Sparkles, User } from 'lucide-react';
import { PLAYLIST_URL, YOUTUBE_CHANNEL_URL } from '../data/tracks';
import { SUNO_PLAYLIST_INFO } from '../data/sunoData';
import { ABOUT_ME_URL } from '../data/socials';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  trackCount: number;
  onQuickShareAll?: () => void;
  onSelectTab?: (tab: 'youtube' | 'suno') => void;
  activeTab?: 'youtube' | 'suno';
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  trackCount,
  onQuickShareAll
}) => {
  return (
    <header
      id="main-header"
      className={`sticky z-30 backdrop-blur-md border-b transition-colors duration-200 ${
        isDarkMode
          ? 'bg-black/40 border-white/10 text-white'
          : 'bg-white/80 border-neutral-200 text-neutral-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-16 lg:h-20 flex items-center justify-between">
        {/* Left: Band Brand Title matching Immersive UI */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-3xl md:text-4xl tracking-tighter leading-none select-none">
              <span className="font-black">D</span>
              <span className="font-light opacity-80">o</span>
              <span className="font-medium opacity-90">m</span>
              <span className="font-black text-cyan-400">I</span>
              <span className="font-light opacity-80">n</span>
              <span className="font-black bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">NATE</span>
              <span className="font-light opacity-80">l</span>
              <span className="font-medium opacity-90">y</span>
            </h1>
            <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-bold mt-0.5">
              Official Gallery
            </p>
          </div>

          {/* Badge */}
          <span
            className={`hidden md:inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-cyan-300'
                : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}
          >
            {trackCount} Tracks
          </span>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6">
          {/* About Me Button */}
          <a
            id="about-me-header-link"
            href={ABOUT_ME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all shadow-xs ${
              isDarkMode
                ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-teal-500/20 border-cyan-400/50 text-cyan-300 hover:text-white hover:bg-cyan-500/30 hover:border-cyan-300 hover:shadow-cyan-500/20'
                : 'bg-cyan-50 border-cyan-400 text-cyan-800 hover:bg-cyan-100 hover:text-cyan-950'
            }`}
            title="About Me - Nate Mina Portfolio & CV"
          >
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span>About Me</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-60" />
          </a>

          {/* External Links */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              id="youtube-channel-link"
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-white/10'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-cyan-600 hover:bg-neutral-200'
              }`}
              title="Visit DomInNATEly on YouTube"
            >
              <Disc3 className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden lg:inline">YT Channel</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              id="youtube-playlist-link"
              href={PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-white/10'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-cyan-600 hover:bg-neutral-200'
              }`}
              title="Open DomInNATEly official playlists on YouTube"
            >
              <Music2 className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden lg:inline">YT Playlists</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              id="tiktok-header-link"
              href="https://www.tiktok.com/@dominnately"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white/80 hover:text-pink-400 hover:border-pink-400/40 hover:bg-white/10'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-pink-600 hover:bg-neutral-200'
              }`}
              title="Follow @dominnately on TikTok"
            >
              <span className="text-xs">🎵</span>
              <span className="hidden lg:inline">TikTok</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              id="suno-playlist-header-link"
              href={SUNO_PLAYLIST_INFO.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-white/10'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-cyan-600 hover:bg-neutral-200'
              }`}
              title="Open official DomInNATEly playlist on Suno"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Suno Playlist</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {/* Quick Share Gallery */}
          {onQuickShareAll && (
            <button
              id="share-gallery-btn"
              onClick={onQuickShareAll}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full border text-xs font-semibold tracking-wider inline-flex items-center gap-1.5 transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-cyan-600'
              }`}
              title="Share Gallery"
              aria-label="Share DomInNATEly Music Gallery"
            >
              <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span className="hidden md:inline uppercase text-[11px]">Share</span>
            </button>
          )}

          {/* Immersive UI Dark Mode Switch */}
          <div
            className={`flex items-center gap-2 sm:gap-3 border-l pl-2.5 sm:pl-5 ${
              isDarkMode ? 'border-white/10' : 'border-neutral-200'
            }`}
          >
            <button
              id="dark-mode-toggle"
              onClick={onToggleDarkMode}
              className={`w-8 h-5 sm:w-10 sm:h-6 rounded-full relative flex items-center px-0.5 transition-colors focus:outline-hidden ${
                isDarkMode ? 'bg-cyan-500' : 'bg-neutral-300'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div
                className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  isDarkMode ? 'translate-x-3 sm:translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider hidden sm:inline ${
                isDarkMode ? 'text-white/80' : 'text-neutral-700'
              }`}
            >
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

