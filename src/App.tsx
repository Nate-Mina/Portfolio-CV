import React, { useState, useEffect, useCallback } from 'react';
import { jekyllThemes, profileData } from './data/profileData';
import { JekyllTheme, PortfolioTabId } from './types';
import { Header } from './components/Header';
import { BioLinks } from './components/BioLinks';
import { AboutMePage } from './components/AboutMePage';
import { CvResume } from './components/CvResume';
import { PureComputersPage } from './components/PureComputersPage';
import { PortfolioWorksPage } from './components/PortfolioWorksPage';
import { MusicPage } from './components/MusicPage';
import { HireMePage, HireInquiryType } from './components/HireMePage';
import { TerminalModal } from './components/TerminalModal';
import { QrCodeModal } from './components/QrCodeModal';
import { PhotoCarouselModal } from './components/PhotoCarouselModal';
import { Footer } from './components/Footer';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import { AIAssistantWidget } from './components/assistant/AIAssistantWidget';

const VALID_TABS: PortfolioTabId[] = ['links', 'about', 'purecomp', 'portfolio', 'music', 'resume', 'cases', 'hire'];

const HASH_ALIASES: Record<string, PortfolioTabId> = {
  links: 'links',
  bio: 'links',
  about: 'about',
  'about-me': 'about',
  purecomp: 'purecomp',
  'pure-computers': 'purecomp',
  portfolio: 'portfolio',
  works: 'portfolio',
  music: 'music',
  resume: 'resume',
  cv: 'resume',
  cases: 'cases',
  hire: 'hire',
  'hire-me': 'hire',
  'custom-portfolio': 'hire',
};

function getInitialTabFromUrl(): PortfolioTabId {
  if (typeof window === 'undefined') return 'links';
  const params = new URLSearchParams(window.location.search);
  const queryTab = params.get('tab')?.toLowerCase();
  if (queryTab && HASH_ALIASES[queryTab]) return HASH_ALIASES[queryTab];
  const hashKey = window.location.hash.replace(/^#/, '').toLowerCase();
  if (hashKey && HASH_ALIASES[hashKey]) return HASH_ALIASES[hashKey];
  return 'links';
}

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<JekyllTheme>(jekyllThemes[0]);
  const [activeTab, setActiveTabState] = useState<PortfolioTabId>(getInitialTabFromUrl);
  const [hirePreset, setHirePreset] = useState<HireInquiryType>('contract');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; url?: string; title?: string }>({
    isOpen: false,
  });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const setActiveTab = useCallback((tab: PortfolioTabId) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetHash = tab === 'links' ? '' : `#${tab}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash || window.location.pathname + window.location.search);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hashKey = window.location.hash.replace(/^#/, '').toLowerCase();
      if (!hashKey) {
        setActiveTabState('links');
      } else if (HASH_ALIASES[hashKey] && VALID_TABS.includes(HASH_ALIASES[hashKey])) {
        setActiveTabState(HASH_ALIASES[hashKey]);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenQr = (url?: string, title?: string) => {
    setQrModalData({
      isOpen: true,
      url: url || 'https://www.PureComp.Net',
      title: title || 'Pure Computers Official Hub',
    });
  };

  return (
    <ToastProvider>
      <div className={`min-h-screen ${currentTheme.bgClass} ${currentTheme.textPrimary} flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-slate-950`}>
      {/* Top Header & Jekyll Theme Switcher */}
      <Header
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenQr={() => handleOpenQr('https://www.PureComp.Net', 'Pure Computers Official Hub')}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenHire={(preset = 'contract') => {
          setHirePreset(preset);
          setActiveTab('hire');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 w-full">
        {activeTab === 'links' && (
          <BioLinks
            currentTheme={currentTheme}
            onOpenQr={() => handleOpenQr()}
            onOpenTerminal={() => setIsTerminalOpen(true)}
            onOpenGallery={() => setIsGalleryOpen(true)}
            onOpenCustomQr={(url, title) => handleOpenQr(url, title)}
          />
        )}

        {activeTab === 'about' && (
          <AboutMePage
            currentTheme={currentTheme}
            onOpenTerminal={() => setIsTerminalOpen(true)}
            onOpenQr={() => handleOpenQr()}
            onOpenGallery={() => setIsGalleryOpen(true)}
          />
        )}

        {activeTab === 'purecomp' && (
          <PureComputersPage
            currentTheme={currentTheme}
            onOpenTerminal={() => setIsTerminalOpen(true)}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioWorksPage
            currentTheme={currentTheme}
            onOpenTerminal={() => setIsTerminalOpen(true)}
          />
        )}

        {activeTab === 'music' && (
          <MusicPage
            currentTheme={currentTheme}
            onOpenTerminal={() => setIsTerminalOpen(true)}
            onOpenCustomQr={(url, title) => handleOpenQr(url, title)}
          />
        )}

        {activeTab === 'resume' && (
          <CvResume
            currentTheme={currentTheme}
            onOpenTerminal={() => setIsTerminalOpen(true)}
            onOpenGallery={() => setIsGalleryOpen(true)}
          />
        )}

        {activeTab === 'cases' && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-mono font-bold text-slate-100">
                Proven Metrics &amp; Selected Case Studies
              </h2>
              <p className="text-sm font-mono text-slate-400">
                Detailed breakdowns of industrial process optimization, custom hardware engineering, and AI pipelines
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileData.caseStudies.map((cs) => (
                <div
                  key={cs.id}
                  className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl`}
                >
                  <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
                    {cs.category}
                  </div>
                  <h3 className="text-lg font-mono font-bold text-slate-100">
                    {cs.title}
                  </h3>
                  <p className="text-xs font-sans text-slate-300 leading-relaxed">
                    {cs.description}
                  </p>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-xs font-mono text-slate-400">{cs.metricLabel}</div>
                    <div className="text-3xl font-mono font-bold text-emerald-400">{cs.metricValue}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1">{cs.formula}</div>
                  </div>

                  <p className="text-xs font-sans text-slate-400 italic">
                    &ldquo;{cs.impactText}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hire' && (
          <HireMePage
            currentTheme={currentTheme}
            initialInquiryType={hirePreset}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Terminal Command Modal */}
      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        activeThemeName={currentTheme.name}
      />

      {/* QR Code Sharing Modal */}
      <QrCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ isOpen: false })}
        url={qrModalData.url}
        title={qrModalData.title}
      />

      {/* Profile Photo Gallery Carousel Modal */}
      <PhotoCarouselModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        photos={profileData.galleryPhotos || []}
      />

        {/* Nate Mina AI Voice & Chatbot Assistant */}
        <AIAssistantWidget currentTheme={currentTheme} activeTab={activeTab} />

        {/* Global Toast Container */}
        <ToastContainer />

        {/* Footer */}
        <Footer
          currentTheme={currentTheme}
          onOpenTerminal={() => setIsTerminalOpen(true)}
        />
      </div>
    </ToastProvider>
  );
}
