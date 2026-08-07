import React, { useState } from 'react';
import { jekyllThemes, profileData } from './data/profileData';
import { JekyllTheme } from './types';
import { Header } from './components/Header';
import { BioLinks } from './components/BioLinks';
import { CvResume } from './components/CvResume';
import { PureComputersPage } from './components/PureComputersPage';
import { PortfolioWorksPage } from './components/PortfolioWorksPage';
import { SystemCalculator } from './components/SystemCalculator';
import { TerminalModal } from './components/TerminalModal';
import { QrCodeModal } from './components/QrCodeModal';
import { PhotoCarouselModal } from './components/PhotoCarouselModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<JekyllTheme>(jekyllThemes[0]);
  const [activeTab, setActiveTab] = useState<'links' | 'purecomp' | 'portfolio' | 'resume' | 'cases' | 'calculator'>('links');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; url?: string; title?: string }>({
    isOpen: false,
  });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleOpenQr = (url?: string, title?: string) => {
    setQrModalData({
      isOpen: true,
      url: url || 'https://beacons.ai/p_c/aboutme',
      title: title || 'Beacons Profile Hub',
    });
  };

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} ${currentTheme.textPrimary} flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-slate-950`}>
      {/* Top Header & Jekyll Theme Switcher */}
      <Header
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenQr={() => handleOpenQr('https://beacons.ai/p_c/aboutme', 'Beacons Profile Hub')}
        onOpenGallery={() => setIsGalleryOpen(true)}
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

        {activeTab === 'calculator' && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-mono font-bold text-slate-100">
                Systemic Efficiency Interactive Sandbox
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Calculate &eta; based on Value-Generated Throughput vs. Energy &amp; Time Capital
              </p>
            </div>

            <SystemCalculator themeAccent={currentTheme.accentColor} />
          </div>
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

      {/* Footer */}
      <Footer
        currentTheme={currentTheme}
        onOpenTerminal={() => setIsTerminalOpen(true)}
      />
    </div>
  );
}
