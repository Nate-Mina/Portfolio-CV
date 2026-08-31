import React, { useState } from 'react';
import { handleImageError } from '../utils/imageUtils';
import {
  Globe,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Video,
  MessageSquare,
  AtSign,
  Image as ImageIcon,
  Compass,
  Copy,
  Check,
  Search,
  ExternalLink,
  MapPin,
  Mail,
  Zap,
  Sparkles,
  QrCode,
  CheckCircle2,
  Maximize2,
  Camera,
  Award,
  Flame,
  Activity,
  Cpu,
  Layers,
  Code2,
  Share2,
} from 'lucide-react';
import { JekyllTheme, LinkItem } from '../types';
import { profileData } from '../data/profileData';

interface BioLinksProps {
  currentTheme: JekyllTheme;
  onOpenQr: () => void;
  onOpenTerminal: () => void;
  onOpenGallery?: () => void;
  onOpenCustomQr?: (url: string, title: string) => void;
}

export const BioLinks: React.FC<BioLinksProps> = ({
  currentTheme,
  onOpenQr,
  onOpenTerminal,
  onOpenGallery,
  onOpenCustomQr,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleQrClick纯 = (url: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenCustomQr) {
      onOpenCustomQr(url, title);
    } else {
      onOpenQr();
    }
  };

  const handleCopy = (url: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  // Helper to render icon with styled icon box
  const renderCardIcon = (link: LinkItem) => {
    if (link.iconText || link.iconName === 'Monogram') {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-800/60 flex items-center justify-center font-mono font-bold text-xs text-purple-300 shadow-inner">
          {link.iconText || 'p_c'}
        </div>
      );
    }

    const iconColor = link.color || '#38bdf8';
    
    // Choose specific box backgrounds based on platform
    let boxBg = 'bg-slate-900/90 border-slate-800';
    if (link.id === 'linkedin' || link.iconName === 'Linkedin') {
      boxBg = 'bg-sky-950/70 border-sky-800/60 text-sky-400';
    } else if (link.id === 'youtube' || link.iconName === 'Youtube') {
      boxBg = 'bg-red-950/70 border-red-800/60 text-red-500';
    } else if (link.id === 'facebook' || link.iconName === 'Facebook') {
      boxBg = 'bg-blue-950/70 border-blue-800/60 text-blue-400';
    } else if (link.id === 'tiktok' || link.iconName === 'Video') {
      boxBg = 'bg-rose-950/70 border-rose-800/60 text-rose-400';
    } else if (link.id === 'instagram' || link.iconName === 'Instagram') {
      boxBg = 'bg-pink-950/70 border-pink-800/60 text-pink-400';
    } else if (link.id === 'reddit' || link.iconName === 'MessageSquare') {
      boxBg = 'bg-orange-950/70 border-orange-800/60 text-orange-400';
    } else if (link.id === 'threads' || link.iconName === 'AtSign') {
      boxBg = 'bg-slate-900 border-slate-700 text-slate-300';
    } else if (link.id === 'pinterest' || link.iconName === 'Image') {
      boxBg = 'bg-red-950/70 border-red-800/60 text-red-400';
    } else if (link.id === 'github' || link.iconName === 'Github') {
      boxBg = 'bg-amber-950/70 border-amber-800/60 text-amber-400';
    } else if (link.id === 'website' || link.iconName === 'Globe') {
      boxBg = 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400';
    }

    const iconProps = { className: 'w-5 h-5', style: { color: iconColor } };

    let iconEl = <Globe {...iconProps} />;
    switch (link.iconName) {
      case 'Linkedin': iconEl = <Linkedin {...iconProps} />; break;
      case 'Youtube': iconEl = <Youtube {...iconProps} />; break;
      case 'Facebook': iconEl = <Facebook {...iconProps} />; break;
      case 'Instagram': iconEl = <Instagram {...iconProps} />; break;
      case 'Video': iconEl = <Video {...iconProps} />; break;
      case 'MessageSquare': iconEl = <MessageSquare {...iconProps} />; break;
      case 'AtSign': iconEl = <AtSign {...iconProps} />; break;
      case 'Image': iconEl = <ImageIcon {...iconProps} />; break;
      case 'Github': iconEl = <Github {...iconProps} />; break;
      case 'Globe': iconEl = <Globe {...iconProps} />; break;
      case 'Flame': iconEl = <Flame {...iconProps} />; break;
      case 'Activity': iconEl = <Activity {...iconProps} />; break;
      case 'Compass': iconEl = <Compass {...iconProps} />; break;
      default: iconEl = <Globe {...iconProps} />;
    }

    return (
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${boxBg}`}>
        {iconEl}
      </div>
    );
  };

  // Badge pill styling helper
  const getBadgeStyle = (badgeVariant?: string, customBadge?: string) => {
    switch (badgeVariant) {
      case 'purple':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/30';
      case 'blue':
        return 'bg-sky-950/60 text-sky-300 border-sky-500/30';
      case 'rose':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/30';
      case 'pink':
        return 'bg-pink-950/60 text-pink-300 border-pink-500/30';
      case 'orange':
        return 'bg-orange-950/60 text-orange-300 border-orange-500/30';
      case 'slate':
        return 'bg-slate-800/80 text-slate-300 border-slate-600/40';
      case 'amber':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
    }
  };

  const filteredLinks = profileData.links.filter((link) => {
    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
    const matchesSearch棱 =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.handle && link.handle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      link.displayUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch棱;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className={`relative overflow-hidden rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl backdrop-blur-md`}>
        {/* Banner Image */}
        <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-slate-900">
          <img
            src={profileData.bannerUrl}
            alt="Hardware Banner"
            data-filename="jekyll_banner_header_1786134616127.jpg"
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e, 'jekyll_banner_header_1786134616127.jpg')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={onOpenTerminal}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-slate-700/80 backdrop-blur-sm text-xs font-mono flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>CLI Terminal</span>
            </button>
            <button
              onClick={onOpenQr}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-400 border border-slate-700/80 backdrop-blur-sm text-xs font-mono flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar Frame */}
            <div
              onClick={onOpenGallery}
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-1 bg-gradient-to-br from-emerald-400 via-sky-500 to-purple-600 shadow-2xl shrink-0 cursor-pointer group hover:scale-105 transition-all duration-300"
              title="Click to view photo gallery (8 high-res photos)"
            >
              <img
                src={profileData.avatarUrl}
                alt={profileData.name}
                data-filename="MAIN.jpg"
                className="w-full h-full object-cover rounded-2xl"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, 'MAIN.jpg')}
              />
              <div className="absolute inset-0 rounded-2xl bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200">
                <Maximize2 className="w-7 h-7 text-emerald-400" />
                <span className="text-[11px] font-mono font-bold text-white mt-1.5 bg-emerald-600 px-2.5 py-0.5 rounded-full shadow">
                  View Carousel
                </span>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-md animate-pulse" title="Online / Open for Consulting" />
            </div>

            {/* Title & Info */}
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 tracking-tight">
                  {profileData.name}
                </h1>
                <span className="text-xs font-mono px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {profileData.handle}
                </span>

                {/* Photo Gallery Trigger Button */}
                {onOpenGallery && (
                  <button
                    type="button"
                    onClick={onOpenGallery}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold transition-all shadow-sm"
                    title="Open Interactive Photo Gallery"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{profileData.galleryPhotos?.length || 8} Photos</span>
                  </button>
                )}
              </div>
              
              <p className="text-sm font-mono font-medium text-slate-300">
                {profileData.title}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-xs text-slate-400 font-sans pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {profileData.location}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  {profileData.emails[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Bio Description Summary */}
          <p className="mt-6 text-sm text-slate-300 font-sans leading-relaxed border-t border-slate-800/80 pt-4">
            {profileData.bioSummary}
          </p>

          {/* Quick Stats Badges */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Liquid-Cooled Hardware
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Local AI &amp; Automation
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> First-Principles Systems Engineering
            </span>
          </div>
        </div>
      </div>

      {/* Main Social Profiles & Media Hub Section (Pixel-matched with Reference Design) */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0b0f1f]/95 border border-[#1e2746] shadow-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-xl">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 space-y-4">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-mono shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Featured Subsection &bull; Beacons Creator Hub &amp; Social Networks</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-white tracking-tight">
                Social Profiles, Content Channels &amp; Media Hub
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-sans max-w-3xl leading-relaxed">
                Connect with Nathaniel Mina across social media networks, video channels, business pages, and the official Beacons creator profile hub at{' '}
                <a
                  href="https://beacons.ai/p_c/aboutme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 font-semibold underline hover:text-purple-300 transition-colors"
                >
                  beacons.ai/p_c/aboutme
                </a>.
              </p>
            </div>

            {/* Visit Beacons CTA button */}
            <a
              href="https://beacons.ai/p_c/aboutme"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-sans font-semibold text-sm shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Visit Beacons.ai/p_c/aboutme</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Search & Category Filters */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 font-mono text-xs">
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'primary', label: 'Primary Platforms' },
                { id: 'social', label: 'Social & Video' },
                { id: 'community', label: 'Community & Boards' },
                { id: 'developer', label: 'Code & Dev' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles or handles..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Grid of Hub Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-6">
          {filteredLinks.length === 0 ? (
            <div className="col-span-full p-10 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 font-mono text-xs">
              No profiles matched &quot;{searchQuery}&quot;. Clear search to view all channels.
            </div>
          ) : (
            filteredLinks.map((link) => {
              const isCopied = copiedLinkId === link.id;
              return (
                <div
                  key={link.id}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#0f152d]/90 hover:bg-[#141b38] border border-[#212b4d] hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/50 transition-all duration-200 transform hover:-translate-y-1"
                >
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {renderCardIcon(link)}

                    {link.badge && (
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold whitespace-nowrap ${getBadgeStyle(link.badgeVariant, link.badge)}`}>
                        {link.badge}
                      </span>
                    )}
                  </div>

                  {/* Body: Title, Handle, Description */}
                  <div className="space-y-1 mb-5 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors font-sans tracking-tight">
                      {link.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      {link.handle || link.displayUrl}
                    </p>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1.5 line-clamp-3">
                      {link.subtitle}
                    </p>
                  </div>

                  {/* Footer Action Links */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto text-xs">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono font-semibold text-purple-400 hover:text-purple-300 group-hover:underline transition-all"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleQrClick纯(link.url, link.title, e)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-800 transition-colors"
                        title="Show QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopy(link.url, link.id, e)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
                        title="Copy Link URL"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Direct Contact & Pure Computers Callout Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Systems Optimization &amp; Engineering Consulting
          </div>
          <span className="text-xs font-mono text-slate-400">Pittsford &amp; Rochester, NY</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-4xl">
          Need bespoke high-performance workstation architecture, liquid cooling thermal optimization, automated enterprise workflows, or marine network infrastructure? Reach out directly to initiate collaboration.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="https://www.PureComp.Net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg hover:shadow-emerald-600/30"
          >
            <Globe className="w-4 h-4" /> Visit PureComp.Net
          </a>
          <a
            href={`mailto:${profileData.emails[0]}`}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition-all"
          >
            <Mail className="w-4 h-4 text-sky-400" /> Email Nathaniel
          </a>
        </div>
      </div>
    </div>
  );
};

