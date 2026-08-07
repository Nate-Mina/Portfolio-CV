import React from 'react';
import { Github, Globe, Terminal, ShieldCheck, Heart } from 'lucide-react';
import { JekyllTheme } from '../types';
import { profileData } from '../data/profileData';

interface FooterProps {
  currentTheme: JekyllTheme;
  onOpenTerminal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ currentTheme, onOpenTerminal }) => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 text-slate-400 py-10 font-mono text-xs">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              PC
            </div>
            <div>
              <div className="text-slate-100 font-bold">{profileData.name}</div>
              <div className="text-slate-500">{profileData.title}</div>
            </div>
          </div>

          {/* Social Quick Matrix */}
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            {profileData.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors"
                title={link.title}
              >
                {link.title.split(' ')[0]}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} {profileData.name}. Pure Computers.</span>
            <span>&bull;</span>
            <span className="text-emerald-400">Pittsford &amp; Rochester, NY</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenTerminal}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Terminal className="w-3 h-3" /> Jekyll CLI
            </button>
            <span>&bull;</span>
            <span>Theme: <strong className="text-slate-300">{currentTheme.name}</strong></span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              gh-pages: success
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
