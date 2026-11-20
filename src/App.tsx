import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { jekyllThemes, profileData } from './data/profileData';
import { JekyllTheme, PortfolioTabId } from './types';
import { Header } from './components/Header';
import { BioLinks } from './components/BioLinks';
import type { HireInquiryType } from './components/HireMePage';
import { Footer } from './components/Footer';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';

const AboutMePage = lazy(() =>
  import('./components/AboutMePage').then((m) => ({ default: m.AboutMePage }))
);
const CvResume = lazy(() =>
  import('./components/CvResume').then((m) => ({ default: m.CvResume }))
);
const PureComputersPage = lazy(() =>
  import('./components/PureComputersPage').then((m) => ({ default: m.PureComputersPage }))
);
const PortfolioWorksPage = lazy(() =>
  import('./components/PortfolioWorksPage').then((m) => ({ default: m.PortfolioWorksPage }))
);
const MusicPage = lazy(() =>
  import('./components/MusicPage').then((m) => ({ default: m.MusicPage }))
);
const HireMePage = lazy(() =>
  import('./components/HireMePage').then((m) => ({ default: m.HireMePage }))
);
const TerminalModal = lazy(() =>
  import('./components/TerminalModal').then((m) => ({ default: m.TerminalModal }))
);
const QrCodeModal = lazy(() =>
  import('./components/QrCodeModal').then((m) => ({ default: m.QrCodeModal }))
);
const PhotoCarouselModal = lazy(() =>
  import('./components/PhotoCarouselModal').then((m) => ({ default: m.PhotoCarouselModal }))
);
const AIAssistantWidget = lazy(() =>
  import('./components/assistant/AIAssistantWidget').then((m) => ({ default: m.AIAssistantWidget }))
);

const TabLoadingFallback: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3 text-xs font-mono text-slate-400">
    <div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
    <span>Loading view...</span>
  </div>
);

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
  const [assistantLaunchNonce, setAssistantLaunchNonce] = useState(0);

  const setActiveTab = useCallback((tab: PortfolioTabId) => {
    setActiveTabState(tab);
    if (tab === 'purecomp') {
      setAssistantLaunchNonce((n) => n + 1);
    }
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

        <Suspense fallback={<TabLoadingFallback />}>
          {activeTab === 'about' && (
            <AboutMePage
              currentTheme={currentTheme}
              onOpenTerminal={() => setIsTerminalOpen(true)}
              onOpenQr={() => handleOpenQr()}
              onOpenGallery={() => setIsGalleryOpen(true)}
              onNavigateTab={setActiveTab}
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

          {activeTab === 'hire' && (
            <HireMePage
              currentTheme={currentTheme}
              initialInquiryType={hirePreset}
              onNavigateTab={setActiveTab}
            />
          )}
        </Suspense>

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
      </main>

      {/* Terminal Command Modal (loaded on demand) */}
      {isTerminalOpen && (
        <Suspense fallback={null}>
          <TerminalModal
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
            activeThemeName={currentTheme.name}
          />
        </Suspense>
      )}

      {/* QR Code Sharing Modal (loaded on demand) */}
      {qrModalData.isOpen && (
        <Suspense fallback={null}>
          <QrCodeModal
            isOpen={qrModalData.isOpen}
            onClose={() => setQrModalData({ isOpen: false })}
            url={qrModalData.url}
            title={qrModalData.title}
          />
        </Suspense>
      )}

      {/* Profile Photo Gallery Carousel Modal (loaded on demand) */}
      {isGalleryOpen && (
        <Suspense fallback={null}>
          <PhotoCarouselModal
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            photos={profileData.galleryPhotos || []}
          />
        </Suspense>
      )}

        {/* Nate Mina AI Voice & Chatbot Assistant */}
        <Suspense fallback={null}>
          <AIAssistantWidget
            currentTheme={currentTheme}
            activeTab={activeTab}
            pureCompLaunchNonce={assistantLaunchNonce}
          />
        </Suspense>

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
