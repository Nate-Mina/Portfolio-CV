import React, { useState, useRef, useEffect } from 'react';
import { Terminal, QrCode, Download, Sparkles, Code2, ExternalLink, Mail, Check } from 'lucide-react';
import { JekyllTheme } from '../types';
import { jekyllThemes, profileData } from '../data/profileData';
import { handleImageError } from '../utils/imageUtils';
import { exportCvPdf } from '../utils/exportPdfCv';

interface HeaderProps {
  currentTheme: JekyllTheme;
  onSelectTheme: (theme: JekyllTheme) => void;
  activeTab: 'links' | 'purecomp' | 'portfolio' | 'resume' | 'music' | 'cases' | 'calculator';
  setActiveTab: (tab: 'links' | 'purecomp' | 'portfolio' | 'resume' | 'music' | 'cases' | 'calculator') => void;
  onOpenTerminal: () => void;
  onOpenQr: () => void;
  onOpenGallery?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onSelectTheme,
  activeTab,
  setActiveTab,
  onOpenTerminal,
  onOpenQr,
  onOpenGallery,
}) => {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--portfolio-header-height', `${height}px`);
      }
    };

    updateHeaderHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  const handleExportCvPdf = () => {
    try {
      exportCvPdf();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error('Failed to export PDF CV:', err);
    }
  };

  return (
    <header
      id="portfolio-main-header"
      ref={headerRef}
      className="relative w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40"
    >
      {/* Primary Navigation & Brand Header Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            onClick={onOpenGallery}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 p-0.5 shadow-lg shadow-emerald-950/40 cursor-pointer group hover:scale-105 transition-all relative shrink-0"
            title={`Click to view photo gallery (${profileData.galleryPhotos?.length || 0} photos)`}
          >
            <img
              src={profileData.avatarUrl}
              alt={profileData.name}
              data-filename="MAIN.jpg"
              className="w-full h-full object-cover rounded-[7px] sm:rounded-[10px]"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e, 'MAIN.jpg')}
            />
            <div className="absolute inset-0 rounded-[7px] sm:rounded-[10px] bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-mono font-bold text-slate-100 tracking-tight truncate">
                {profileData.name}
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-none">
              Pure Computers | Mechanical Engineer &amp; Systems Architect
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar scroll-smooth max-w-full flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setActiveTab('links')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'links'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Link In Bio
          </button>
          <button
            onClick={() => setActiveTab('purecomp')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'purecomp'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Pure Computers
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'portfolio'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Portfolio / Works
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'music'
                ? 'bg-red-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Music &amp; Podcasts
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'resume'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            CV &amp; Resume
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'cases'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Case Studies
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-medium whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            &eta; Calculator
          </button>
        </div>

        {/* Right Tools & Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* CLI Terminal Button */}
          <button
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/40 text-xs font-mono font-medium transition-all shadow-sm"
            title="Open Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CLI Terminal</span>
          </button>

          {/* QR Share Button */}
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 hover:border-sky-500/40 text-xs font-mono font-medium transition-all shadow-sm"
            title="Share via QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">QR Share</span>
          </button>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-all"
              title="Change Jekyll Theme"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{currentTheme.name}</span>
            </button>

            {showThemePicker && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider font-mono">
                  Select Theme
                </div>
                <div className="space-y-1 mt-1">
                  {jekyllThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        onSelectTheme(theme);
                        setShowThemePicker(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                        currentTheme.id === theme.id
                          ? 'bg-slate-800 text-emerald-400 font-semibold border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <span>{theme.name}</span>
                      </div>
                      {currentTheme.id === theme.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export CV */}
          <button
            onClick={handleExportCvPdf}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-medium transition-colors shrink-0"
            title="Export Official CV (PDF format)"
          >
            {downloaded ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">{downloaded ? 'Exported PDF' : 'Export CV (PDF)'}</span>
            <span className="sm:hidden">{downloaded ? 'PDF' : 'CV (PDF)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
