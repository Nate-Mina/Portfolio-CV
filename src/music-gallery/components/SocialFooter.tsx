import React from 'react';
import { ExternalLink, Heart, Sparkles, Youtube } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/socials';

interface SocialFooterProps {
  isDarkMode: boolean;
}

export const SocialFooter: React.FC<SocialFooterProps> = ({ isDarkMode }) => {
  return (
    <footer
      id="site-social-footer"
      className={`mt-16 pt-10 pb-8 border-t transition-colors ${
        isDarkMode ? 'border-white/10 bg-black/40' : 'border-neutral-200 bg-neutral-100/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info & Support Note */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
              <span className="font-black text-lg tracking-wider">DomInNATEly</span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                Official Artist Hub
              </span>
            </div>
            <p className={`text-xs max-w-md ${isDarkMode ? 'text-white/60' : 'text-neutral-600'}`}>
              Please like and subscribe to my YouTube and TikTok channels to support the music and stay updated on every new release!
            </p>
          </div>

          {/* Social Links Grid */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {/* YouTube Direct */}
            <a
              id="footer-youtube-link"
              href="https://www.youtube.com/@DomInNATEly?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-transform active:scale-95 shadow-md shadow-red-600/20"
            >
              <Youtube className="w-3.5 h-3.5 fill-current" />
              <span>YouTube Channel</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            {/* Social Links List */}
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.id}
                id={`footer-social-${item.id}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-cyan-400 hover:border-cyan-400/40'
                    : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-200 hover:text-cyan-600'
                }`}
                title={item.label}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom copyright / quote */}
        <div
          className={`mt-8 pt-4 border-t flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2 ${
            isDarkMode ? 'border-white/5 text-white/40' : 'border-neutral-200 text-neutral-500'
          }`}
        >
          <div>
            &copy; {new Date().getFullYear()} DomInNATEly. Built for fans, listeners, and creators.
          </div>
          <div className="flex items-center gap-1">
            <span>Made with passion for high-energy alt-rock &amp; storytelling</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
