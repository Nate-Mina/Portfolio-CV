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
} from 'lucide-react';
import { JekyllTheme } from '../types';

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
    id: 'efficiency-calc-app',
    title: 'Systemic Efficiency (η) Calculator',
    category: 'systems',
    categoryLabel: 'Engineering Tool',
    description: 'Interactive mathematical sandbox calculating system throughput (η) against energy and time capital expended. Derived from first-principles mechanical engineering equations.',
    detailedSpecs: [
      'Real-time LaTeX formula rendering using KaTeX math typesetting.',
      'Dynamic input sliders for value throughput and energy expenditure.',
      'Interactive chart visualizer plotting efficiency curves.',
    ],
    technologies: ['TypeScript', 'KaTeX', 'Recharts', 'Tailwind CSS'],
    url: '#calculator',
    badge: 'Built-in Tool',
    metrics: {
      label: 'Model Precision',
      value: 'Deterministic',
    },
  },
];

export const PortfolioWorksPage: React.FC<PortfolioWorksPageProps> = ({ currentTheme }) => {
  const [filter, setFilter] = useState<'all' | 'aistudio' | 'web' | 'systems'>('all');
  const [activeIframeApp, setActiveIframeApp] = useState<PortfolioProject | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredProjects = portfolioProjects.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
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

              {/* Title */}
              <h2 className="text-lg font-mono font-bold text-slate-100 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                <span>{project.title}</span>
              </h2>

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
                {project.category === 'aistudio' && (
                  <button
                    type="button"
                    onClick={() => setActiveIframeApp(project)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Embed Preview</span>
                  </button>
                )}

                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <span>Launch App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
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
            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={activeIframeApp.url}
                title={activeIframeApp.title}
                className="w-full h-full border-none"
                allow="camera; microphone; geolocation; clipboard-write"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
