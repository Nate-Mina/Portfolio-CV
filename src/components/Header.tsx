import React, { useState } from 'react';
import { Terminal, QrCode, Download, Sparkles, Code2, ExternalLink, Mail, Check } from 'lucide-react';
import { JekyllTheme } from '../types';
import { jekyllThemes, profileData } from '../data/profileData';
import { handleImageError } from '../utils/imageUtils';

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

  const exportCvMarkdown = () => {
    const mdContent = `# ${profileData.name}
## ${profileData.title}
Location: ${profileData.location}
Emails: ${profileData.emails.join(', ')}
Website: ${profileData.website}

---

## Mission & Systems Philosophy
${profileData.missionStatement}

Formula:
$$${profileData.efficiencyFormulaLatex}$$

---

## Proven Metrics & Case Studies
${profileData.caseStudies
  .map(
    (cs) => `### ${cs.title} (${cs.category})
- Description: ${cs.description}
- Metric: ${cs.metricValue} (${cs.metricLabel})
- Formula: $${cs.formula}$
- Impact: ${cs.impactText}
`
  )
  .join('\n')}

---

## Technical Stack & Tooling
${profileData.techStack
  .map((ts) => `- **${ts.domain}**: ${ts.technologies.join(', ')}`)
  .join('\n')}

---

## Active Research & Focus Areas
${profileData.researchAreas.map((r) => `- **${r.title}**: ${r.description}`).join('\n')}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nathaniel_Mina_CV_Resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <header className="relative w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Primary Navigation & Brand Header Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenGallery}
            className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 p-0.5 shadow-lg shadow-emerald-950/40 cursor-pointer group hover:scale-105 transition-all relative"
            title={`Click to view photo gallery (${profileData.galleryPhotos?.length || 0} photos)`}
          >
            <img
              src={profileData.avatarUrl}
              alt={profileData.name}
              data-filename="MAIN.jpg"
              className="w-full h-full object-cover rounded-[10px]"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e, 'MAIN.jpg')}
            />
            <div className="absolute inset-0 rounded-[10px] bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-mono font-bold text-slate-100 tracking-tight">
                {profileData.name}
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Pure Computers | Mechanical Engineer &amp; Systems Architect
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('links')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'links'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Link In Bio
          </button>
          <button
            onClick={() => setActiveTab('purecomp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'purecomp'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Pure Computers
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'portfolio'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Portfolio / Works
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'music'
                ? 'bg-red-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Music &amp; Podcasts
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'resume'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            CV &amp; Resume
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'cases'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Case Studies
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            &eta; Calculator
          </button>
        </div>

        {/* Right Tools & Actions Toolbar */}
        <div className="flex items-center gap-2">
          {/* CLI Terminal Button */}
          <button
            onClick={onOpenTerminal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/40 text-xs font-mono font-medium transition-all shadow-sm"
            title="Open Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CLI Terminal</span>
          </button>

          {/* QR Share Button */}
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 hover:border-sky-500/40 text-xs font-mono font-medium transition-all shadow-sm"
            title="Share via QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">QR Share</span>
          </button>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-all"
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
            onClick={exportCvMarkdown}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-medium transition-colors"
            title="Export Markdown CV"
          >
            {downloaded ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{downloaded ? 'Exported' : 'Export CV'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
