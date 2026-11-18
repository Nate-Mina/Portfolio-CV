import React, { useState } from 'react';
import {
  ExternalLink,
  Sparkles,
  Code2,
  Globe,
  Layers,
  Cpu,
  Monitor,
  Maximize2,
  X,
  Play,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Filter,
  BarChart2,
  Box,
  Github,
} from 'lucide-react';
import { JekyllTheme } from '../types';
import { GithubContributionsHeatmap } from './GithubContributionsHeatmap';
import { GitHubActivityWidget } from './GitHubActivityWidget';

interface PortfolioWorksPageProps {
  currentTheme: JekyllTheme;
  onOpenTerminal: () => void;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: 'aistudio' | 'web' | 'systems';
  categoryLabel: string;
  description: string;
  detailedSpecs: string[];
  technologies: string[];
  url: string;
  fullscreenUrl?: string;
  repoUrl?: string;
  previewImageUrl?: string;
  featured?: boolean;
  badge?: string;
  metrics?: {
    label: string;
    value: string;
  };
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'pull-house-heat-to-pool',
    title: 'Pull House Heat to Pool | ThermalCore v5.0 Heat Recovery Suite',
    category: 'systems',
    categoryLabel: 'Thermal Engineering & Energy Recovery',
    description: 'Sub-ambient liquid heat exchange & atmospheric evaporation suite for total home-pool thermal equilibrium. Uses titanium shell-and-tube heat exchangers and variable-speed pumps to recover waste AC condenser heat directly to pool water.',
    detailedSpecs: [
      'Interactive 5-stage pad hardware sequence schematic (Pump, Filter, Titanium HX, Salt Cell, 3-Way Valve).',
      'Dynamic ROI Engine calculating real-time AC efficiency gains (+34.2% COP) and natural gas heating displacement ($340+/mo).',
      'Calculus core deriving Log Mean Temperature Difference (LMTD), Fourier Conduction, and Evaporative Mass Transfer.',
      'Live COP comparison curves contrasting water-cooled sub-ambient heat exchange against standard air condensers.',
    ],
    technologies: ['HTML5', 'Tailwind CSS', 'Chart.js', 'Thermodynamic Calculus', 'Fira Code'],
    url: './pull-house-heat-to-pool.html',
    fullscreenUrl: './pull-house-heat-to-pool.html',
    featured: true,
    badge: 'Thermal Core',
    metrics: {
      label: 'COP Efficiency Gain',
      value: '+34.2% Saved',
    },
  },
  {
    id: 'vitalstats-clinical-portal',
    title: 'VitalStats | Clinical Supplement Analytics & Synthesis Portal',
    category: 'systems',
    categoryLabel: 'Clinical & Analytics Portal',
    description: 'Epidemiological surveillance & systematic research portal integrating CDC NHANES data with RCT meta-analyses to evaluate supplement efficacy, endocrine pathways, microvascular mechanisms, and safety audit protocols.',
    detailedSpecs: [
      'Interactive Clinical Evidence Database with dynamic filtering across 15+ evidence-graded compound matrices.',
      'Personalized Assessment Wizard calculating evidence-backed protocols, dosage targets, and contraindication flags.',
      'CDC NHANES top 10 motivation surveillance charts disaggregated by age and sex cohort.',
      'Includes Athletic Performance & Muscle Growth analysis, ED & Androgen synthesis tables, and Microvascular Sentinel models.',
    ],
    technologies: ['HTML5', 'Tailwind CSS', 'Chart.js', 'JavaScript ES6+', 'Epidemiological Models'],
    url: './supplement_portal.html',
    fullscreenUrl: './supplement_portal.html',
    featured: true,
    badge: 'Clinical Portal',
    metrics: {
      label: 'Evidence Matrix',
      value: 'v4.2 Clinical',
    },
  },
  {
    id: 'aistudio-app-1',
    title: 'AI Studio Application (81f331d4)',
    category: 'aistudio',
    categoryLabel: 'Google AI Studio App',
    description: 'Full-featured web application deployed on Google AI Studio Cloud Run architecture. Integrates responsive UI components, real-time interactivity, and high-performance frontend state orchestration.',
    detailedSpecs: [
      'Hosted on Google Cloud Run container infrastructure with automated HTTPS routing.',
      'Built with React 18, TypeScript, and Tailwind CSS.',
      'Responsive multi-viewport design optimized for mobile, tablet, and desktop displays.',
      'Instant cloud deployment with zero-cold-start latency.',
    ],
    technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'Google Cloud Run'],
    url: 'https://ai.studio/apps/81f331d4-2642-4ab3-893c-794a2b09e51f?fullscreenApplet=true',
    fullscreenUrl: 'https://ai.studio/apps/81f331d4-2642-4ab3-893c-794a2b09e51f?fullscreenApplet=true',
    featured: true,
    badge: 'Featured Applet',
    metrics: {
      label: 'Platform Host',
      value: 'Google Cloud Run',
    },
  },
  {
    id: 'aistudio-app-2',
    title: 'AI Studio Application (43b7e127)',
    category: 'aistudio',
    categoryLabel: 'Google AI Studio App',
    description: 'High-speed interactive web application engineered on Google AI Studio platform. Features server-side processing capabilities and optimized client state management.',
    detailedSpecs: [
      'Deployed via containerized Cloud Run environment.',
      'Engineered with modern modular component architecture.',
      'Leverages fast bundle stripping and responsive design systems.',
      'Optimized for continuous uptime and interactive user workflows.',
    ],
    technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloud Run Infrastructure'],
    url: 'https://ai.studio/apps/43b7e127-4943-4ddd-b67e-a507f18d0cc4',
    fullscreenUrl: 'https://ai.studio/apps/43b7e127-4943-4ddd-b67e-a507f18d0cc4',
    featured: true,
    badge: 'Featured Applet',
    metrics: {
      label: 'Performance Score',
      value: '99/100',
    },
  },
  {
    id: 'clarkandwolcott-net',
    title: 'Clark & Wolcott Masonry and Construction (clarkandwolcott.net)',
    category: 'web',
    categoryLabel: 'Websites Created',
    description: 'Official web platform created for Clark & Wolcott Masonry and Construction, a Rochester & Finger Lakes contractor with 35+ years of craftsmanship specializing in commercial and residential masonry, historic restoration, remodeling, chimney repair, and custom stonework.',
    detailedSpecs: [
      'Designed and launched custom web presence highlighting 35+ years of masonry craftsmanship and historic restoration expertise.',
      'Showcases commercial & residential masonry portfolios, chimney repair, basement waterproofing, and decorative stone/brickwork.',
      'Optimized responsive mobile-friendly layout with direct customer contact routing and project quote requests.',
      'Features comprehensive service breakdowns and local Rochester/Lima, NY regional business details.',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Responsive UI', 'SEO Optimization'],
    url: 'https://www.clarkandwolcott.net',
    featured: true,
    badge: 'Website Created',
    metrics: {
      label: 'Craftsmanship',
      value: '35+ Yrs Experience',
    },
  },
  {
    id: 'purecomp-net',
    title: 'Pure Computers Official Portal (PureComp.Net)',
    category: 'web',
    categoryLabel: 'Business Web Portal',
    description: 'Official digital platform for Pure Computers, serving Rochester & Pittsford, NY with custom hardware configuration, liquid cooling engineering, and IT service dispatch.',
    detailedSpecs: [
      'Comprehensive computer build configurator and IT service request workflows.',
      'Optimized for lightning-fast asset loading and clear service navigation.',
      'Direct integration with client support, ticketing, and hardware diagnostics.',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Microsoft 365 Integration'],
    url: 'https://www.PureComp.Net',
    featured: true,
    badge: 'Live Portal',
    metrics: {
      label: 'Client Satisfaction',
      value: '100% Uptime',
    },
  },
  {
    id: 'dominnately-music-site',
    title: 'DomInNATEly Music & Audio Portfolio (nate-mina.github.io/DomInNATEly)',
    category: 'web',
    categoryLabel: 'Music & Audio Portfolio',
    description: 'Official music and sound design portfolio for Nathaniel Mina (@DomInNATEly). Features original electronic compositions, drift phonk releases, ambient soundscapes, synthesizer sound lab, and continuous streaming discography.',
    detailedSpecs: [
      'Interactive discography showcase presenting original releases, productions, and audio streams.',
      'Hosted on GitHub Pages with responsive dark aesthetic and sound lab aesthetics.',
      'Integrated links to YouTube channel podcasts, TikTok sound bites, and complete continuous mixes.',
    ],
    technologies: ['GitHub Pages', 'Web Audio', 'HTML5/CSS3', 'Sound Design', 'Responsive UI'],
    url: 'https://nate-mina.github.io/DomInNATEly/',
    repoUrl: 'https://github.com/Nate-Mina/DomInNATEly',
    featured: true,
    badge: 'Music Portfolio',
    metrics: {
      label: 'Audio Discography',
      value: 'Original Works',
    },
  },
  {
    id: 'polymath-engineering-hub',
    title: 'Polymath: Systems, Engineering & Creative Architecture (nate-mina.github.io/Polymath)',
    category: 'web',
    categoryLabel: 'Live Web & Systems Portal',
    description: 'Official interactive Polymath web platform deployed on GitHub Pages by Nathaniel Mina. Features live interactive demonstrations, systems architecture blueprints, thermodynamic energy equations, and creative multimedia orchestration.',
    detailedSpecs: [
      'Live deployed web application hosted on GitHub Pages at nate-mina.github.io/Polymath.',
      'Demonstrates full-stack engineering with modern React, TypeScript, and responsive interactive interfaces.',
      'Bridges physical engineering (thermodynamics, hardware architecture) with modern software orchestration and AI integration.',
      'Includes direct link to inspect open-source code and commit history on GitHub (Nate-Mina/Polymath).',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'GitHub Pages', 'Systems Architecture', 'Python'],
    url: 'https://nate-mina.github.io/Polymath/',
    fullscreenUrl: 'https://nate-mina.github.io/Polymath/',
    repoUrl: 'https://github.com/Nate-Mina/Polymath',
    featured: true,
    badge: 'Live Portal & App',
    metrics: {
      label: 'Platform & Host',
      value: 'GitHub Pages',
    },
  },
  {
    id: 'the-system-and-the-soul-book',
    title: 'The System & The Soul — Book About Elon Musk (nate-mina.github.io/E.MUSK-AUTOBIO-PARODY)',
    category: 'web',
    categoryLabel: 'Interactive Book & Publication',
    description: 'Interactive web book and autobiographical parody examining Elon Musk through a first-principles systems engineering, aerospace/hardware ambition, and philosophical lens.',
    detailedSpecs: [
      'Full interactive web edition published on GitHub Pages at nate-mina.github.io/E.MUSK-AUTOBIO-PARODY.',
      'Blends first-principles systems thinking, deterministic physics, and sharp autobiographical parody exploring Elon Musk.',
      'Supports direct full-page launch or embedded interactive reader preview directly inside Portfolio Works.',
    ],
    technologies: ['GitHub Pages', 'HTML5', 'CSS3', 'Interactive Writing', 'Systems Philosophy'],
    url: 'https://nate-mina.github.io/E.MUSK-AUTOBIO-PARODY/',
    fullscreenUrl: 'https://nate-mina.github.io/E.MUSK-AUTOBIO-PARODY/',
    featured: true,
    badge: 'Book · Elon Musk',
    metrics: {
      label: 'Publication Type',
      value: 'Web Book',
    },
  },
  {
    id: 'portfolio-cv-hub',
    title: 'Portfolio, Link-in-Bio & Interactive CV Platform (nate-mina.github.io/Portfolio-CV)',
    category: 'web',
    categoryLabel: 'Full-Stack Portfolio & AI Hub',
    description: 'Jekyll-inspired dark interactive Link-in-Bio, Engineering Portfolio, Music Gallery, Pure Computers Portal, and Voice/Text Gemini AI Assistant built by Nathaniel Mina.',
    detailedSpecs: [
      'Multi-theme Jekyll styling (Midnight, Dracula, Chirpy, Cayman, Hacker) with responsive UI.',
      'Real-time GitHub Activity telemetry, contributions calendar, and live consultation booking workflows.',
      'Integrated Gemini Live audio & text assistant with Pure Computers technical diagnostics.',
    ],
    technologies: ['React 19', 'TypeScript', 'Express', 'Tailwind CSS', 'Gemini API', 'Firebase'],
    url: 'https://nate-mina.github.io/Portfolio-CV/',
    fullscreenUrl: 'https://nate-mina.github.io/Portfolio-CV/',
    repoUrl: 'https://github.com/Nate-Mina/Portfolio-CV',
    featured: true,
    badge: 'Flagship Hub',
    metrics: {
      label: 'Architecture',
      value: 'Full-Stack SPA',
    },
  },
];

export const PortfolioWorksPage: React.FC<PortfolioWorksPageProps> = ({ currentTheme }) => {
  const [filter, setFilter] = useState<'all' | 'aistudio' | 'web' | 'systems'>('all');
  const [activeIframeApp, setActiveIframeApp] = useState<PortfolioProject | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredProjects = portfolioProjects.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Header Banner */}
      <div className={`p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive App Deployments &amp; Portfolio</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold text-slate-100 tracking-tight">
              Portfolio &amp; Deployed Works
            </h1>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Projects ({portfolioProjects.length})
            </button>
            <button
              onClick={() => setFilter('aistudio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filter === 'aistudio'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Studio Apps
            </button>
            <button
              onClick={() => setFilter('web')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filter === 'web'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Web Portals
            </button>
            <button
              onClick={() => setFilter('systems')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filter === 'systems'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Systems Tools
            </button>
          </div>
        </div>

        <p className="text-xs font-sans text-slate-300 leading-relaxed max-w-3xl">
          A showcase of live web applications, AI Studio deployments, interactive systems tools, and enterprise portals engineered by Nathaniel Mina and Pure Computers. Click any project to open or launch an embedded preview.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl flex flex-col justify-between hover:border-emerald-500/60 transition-all group`}
          >
            <div className="space-y-3">
              {/* Top Card Bar */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {project.categoryLabel}
                </span>

                {project.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                    {project.badge}
                  </span>
                )}
              </div>

              {/* Title & Metrics Callout */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-mono font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {project.title}
                </h2>
                {project.metrics && (
                  <div className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-right">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                      {project.metrics.label}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-emerald-400">
                      {project.metrics.value}
                    </div>
                  </div>
                )}
              </div>

              {project.previewImageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={project.previewImageUrl}
                    alt={`${project.title} preview`}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                {project.description}
              </p>

              {/* Detailed Specs list */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Key Technical Specifications
                </div>
                <ul className="space-y-1">
                  {project.detailedSpecs.map((spec, sIdx) => (
                    <li key={sIdx} className="text-[11px] font-sans text-slate-300 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies list */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    #{tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(project.url, project.id)}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
                title="Copy Direct Link"
              >
                {copiedId === project.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {(project.category === 'aistudio' ||
                  project.url.endsWith('.html') ||
                  project.id === 'vitalstats-clinical-portal' ||
                  project.url.includes('github.io')) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIframeLoaded(false);
                      setActiveIframeApp(project);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Embed Preview</span>
                  </button>
                )}

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    title="View Source Repository on GitHub"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-400" />
                    <span>Repo</span>
                  </a>
                )}

                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  {project.url.includes('github.com') ? (
                    <>
                      <Github className="w-3.5 h-3.5" />
                      <span>View on GitHub</span>
                    </>
                  ) : (
                    <>
                      <span>{project.url.startsWith('#') ? 'Open Tool' : 'Launch App'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live GitHub Activity Widget */}
      <div className="pt-4">
        <GitHubActivityWidget currentTheme={currentTheme} />
      </div>

      {/* GitHub Contributions Heatmap */}
      <div className="pt-2">
        <GithubContributionsHeatmap currentTheme={currentTheme} />
      </div>

      {/* Embedded App Preview Modal */}
      {activeIframeApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-mono font-bold text-slate-100">
                  {activeIframeApp.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeIframeApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </a>

                <button
                  onClick={() => setActiveIframeApp(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Iframe Container */}
            <div className="flex-1 bg-slate-950 relative flex flex-col">
              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <span>
                  {iframeLoaded
                    ? 'Embedded live preview active. Some third-party sites restrict interactive frames.'
                    : 'Loading embedded preview... If the frame stays blank due to host security headers, open it directly.'}
                </span>
                <a
                  href={activeIframeApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={activeIframeApp.url}
                title={activeIframeApp.title}
                onLoad={() => setIframeLoaded(true)}
                className="w-full flex-1 border-none bg-slate-950"
                allow="camera; microphone; geolocation; clipboard-write"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
