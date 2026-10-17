import React from 'react';
import { ExternalLink, Heart, Bell, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/socials';

interface SocialSubscribeBannerProps {
  isDarkMode: boolean;
}

export const SocialSubscribeBanner: React.FC<SocialSubscribeBannerProps> = ({ isDarkMode }) => {
  return (
    <div
      id="social-subscribe-banner"
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-5 mb-4 sm:mb-7 transition-all ${
        isDarkMode
          ? 'bg-gradient-to-r from-neutral-900/90 via-black to-neutral-900/90 border-cyan-500/20 shadow-xl'
          : 'bg-gradient-to-r from-cyan-50/80 via-white to-pink-50/80 border-cyan-200/80 shadow-md'
      }`}
    >
      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-1/4 w-72 h-36 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Call to action message */}
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
              isDarkMode
                ? 'bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border-white/10 text-cyan-400'
                : 'bg-cyan-100 border-cyan-200 text-cyan-600'
            }`}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Support the Music
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full border ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-white/60' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                }`}
              >
                Official Channels
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-black tracking-tight leading-snug mt-0.5">
              Please Like &amp; Subscribe to my{' '}
              <a
                href="https://www.youtube.com/@DomInNATEly"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:underline inline-flex items-center gap-0.5"
              >
                YouTube
              </a>{' '}
              and{' '}
              <a
                href="https://www.tiktok.com/@dominnately"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:underline inline-flex items-center gap-0.5"
              >
                TikTok
              </a>{' '}
              channel!
            </h3>
            <p className={`text-[11px] sm:text-xs mt-0.5 ${isDarkMode ? 'text-white/65' : 'text-neutral-600'}`}>
              Stream music, drop a like on videos, follow for upcoming track drops &amp; connect across socials!
            </p>
          </div>
        </div>

        {/* Action badges / links */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Primary YouTube Subscribe Button */}
          <a
            id="cta-youtube-subscribe"
            href="https://www.youtube.com/@DomInNATEly?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 sm:gap-1.5 shadow-md shadow-red-600/25 transition-transform active:scale-95 shrink-0"
            title="Subscribe to DomInNATEly on YouTube"
          >
            <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current group-hover:rotate-12 transition-transform" />
            <span>Subscribe YT</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70" />
          </a>

          {/* Primary TikTok Follow Button */}
          <a
            id="cta-tiktok-follow"
            href="https://www.tiktok.com/@dominnately"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white flex items-center gap-1 sm:gap-1.5 shadow-md shadow-pink-600/25 transition-transform active:scale-95 shrink-0"
            title="Follow DomInNATEly on TikTok"
          >
            <span className="text-xs sm:text-sm">🎵</span>
            <span>Follow TikTok</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70" />
          </a>

          {/* All 4 Social Quick Links pill row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 lg:pt-0">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.id}
                id={`social-link-${link.id}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-cyan-300 hover:border-cyan-400/40'
                    : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:text-cyan-700'
                }`}
                title={`${link.label}: ${link.url}`}
              >
                <span className="text-xs">{link.icon}</span>
                <span className="font-semibold text-[11px]">{link.name}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
