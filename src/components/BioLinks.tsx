import React, { useState } from 'react';
import {
  Globe,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Video,
  MessageSquare,
  AtSign,
  Image,
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
  Share2,
  CheckCircle2,
  Maximize2,
  Camera,
  Award,
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

  const handleQrClick = (url: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenCustomQr) {
      onOpenCustomQr(url, title);
    } else {
      onOpenQr();
    }
  };

  // Icon mapping helper
  const renderIcon = (iconName: string, color?: string) => {
    const props = { className: 'w-5 h-5', style: color ? { color } : undefined };
    switch (iconName) {
      case 'Globe': return <Globe {...props} />;
      case 'Github': return <Github {...props} />;
      case 'Linkedin': return <Linkedin {...props} />;
      case 'Facebook': return <Facebook {...props} />;
      case 'Instagram': return <Instagram {...props} />;
      case 'Video': return <Video {...props} />;
      case 'MessageSquare': return <MessageSquare {...props} />;
      case 'AtSign': return <AtSign {...props} />;
      case 'Image': return <Image {...props} />;
      case 'Compass': return <Compass {...props} />;
      case 'Award': return <Award {...props} />;
      default: return <Globe {...props} />;
    }
  };

  const handleCopy = (url: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const filteredLinks = profileData.links.filter((link) => {
    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.displayUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className={`relative overflow-hidden rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl backdrop-blur-md`}>
        {/* Banner Image */}
        <div className="h-40 sm:h-48 w-full relative overflow-hidden bg-slate-900">
          <img
            src={profileData.bannerUrl}
            alt="Hardware Banner"
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={onOpenTerminal}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-slate-700/80 backdrop-blur-sm text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>CLI Terminal</span>
            </button>
            <button
              onClick={onOpenQr}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-sky-400 border border-slate-700/80 backdrop-blur-sm text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Avatar Frame */}
            <div
              onClick={onOpenGallery}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-gradient-to-br from-emerald-400 via-sky-500 to-emerald-600 shadow-xl shrink-0 cursor-pointer group hover:scale-105 transition-all duration-300"
              title="Click to view photo gallery (5 photos)"
            >
              <img
                src={profileData.avatarUrl}
                alt={profileData.name}
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-xl bg-slate-950/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200">
                <Maximize2 className="w-6 h-6 text-emerald-400" />
                <span className="text-[10px] font-mono font-bold text-white mt-1 bg-emerald-600 px-2 py-0.5 rounded-full">
                  View Carousel
                </span>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-md animate-pulse" title="Online / Open for Consulting" />
            </div>

            {/* Title & Info */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 tracking-tight">
                  {profileData.name}
                </h2>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {profileData.handle}
                </span>

                {/* Photo Gallery Trigger Button */}
                {onOpenGallery && (
                  <button
                    type="button"
                    onClick={onOpenGallery}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all shadow-sm"
                    title="Open Interactive Photo Gallery"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{profileData.galleryPhotos?.length || 0} Photos</span>
                  </button>
                )}
              </div>
              
              <p className="text-sm font-mono font-medium text-slate-300">
                {profileData.title}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 font-sans pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {profileData.location}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  {profileData.emails[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Bio Description Summary */}
          <p className="mt-5 text-sm text-slate-300 font-sans leading-relaxed border-t border-slate-800/80 pt-4">
            {profileData.bioSummary}
          </p>

          {/* Quick Stats Badges */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Liquid-Cooled Hardware
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Local AI &amp; Automation
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> First-Principles Design
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 font-mono text-xs">
            {[
              { id: 'all', label: 'All Links' },
              { id: 'primary', label: 'Primary Work' },
              { id: 'credentials', label: 'Certifications' },
              { id: 'developer', label: 'Developer' },
              { id: 'social', label: 'Social' },
              { id: 'community', label: 'Community' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter links..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Link Tree Buttons List */}
      <div className="space-y-3">
        {filteredLinks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs">
            No bio links matched &quot;{searchQuery}&quot;. Clear search to see all profile endpoints.
          </div>
        ) : (
          filteredLinks.map((link) => {
            const isCopied = copiedLinkId === link.id;
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative block p-4 rounded-xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} hover:border-emerald-400 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 group-hover:border-emerald-500/50 transition-colors">
                      {renderIcon(link.iconName, link.color)}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-mono font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                          {link.title}
                        </h3>
                        {link.badge && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${currentTheme.badgeBg}`}>
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-sans truncate mt-0.5">
                        {link.subtitle}
                      </p>
                      <span className="text-[11px] font-mono text-emerald-400/80 group-hover:text-emerald-300 underline mt-1 block">
                        {link.displayUrl}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleQrClick(link.url, link.title, e)}
                      className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-800 transition-colors shadow-sm"
                      title="Pop out QR code for this link"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleCopy(link.url, link.id, e)}
                      className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>

      {/* Direct Contact & Pure Computers Callout Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Systems Optimization &amp; Consulting
          </div>
          <span className="text-xs font-mono text-slate-400">Pittsford &amp; Rochester, NY</span>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Need bespoke high-performance workstation builds, liquid cooling thermal optimization, or enterprise Power Automate AI pipelines? Reach out directly.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="https://www.PureComp.Net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors shadow-lg"
          >
            <Globe className="w-4 h-4" /> Visit PureComp.Net
          </a>
          <a
            href={`mailto:${profileData.emails[0]}`}
            className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition-colors"
          >
            <Mail className="w-4 h-4 text-sky-400" /> Email Nathaniel
          </a>
        </div>
      </div>
    </div>
  );
};
