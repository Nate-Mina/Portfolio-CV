import React, { useState } from 'react';
import {
  Music,
  Headphones,
  Radio,
  Youtube,
  Play,
  ExternalLink,
  Copy,
  Check,
  Share2,
  QrCode,
  Disc3,
  Sliders,
  Volume2,
  Sparkles,
  Zap,
  Mic2,
  Video,
  ListMusic,
  Maximize2,
  Tv,
} from 'lucide-react';
import { JekyllTheme } from '../types';
import { profileData } from '../data/profileData';

interface MusicPageProps {
  currentTheme: JekyllTheme;
  onOpenTerminal: () => void;
  onOpenCustomQr?: (url: string, title: string) => void;
}

export const MusicPage: React.FC<MusicPageProps> = ({
  currentTheme,
  onOpenTerminal,
  onOpenCustomQr,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'podcast' | 'phonk' | 'ambient' | 'tech'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string>('PLcnHmqF3gRltqGbFV9159hzav6eVGVwaH');
  const [isVideoMode, setIsVideoMode] = useState<'playlist' | 'single'>('playlist');

  const playlistUrl = 'https://youtube.com/playlist?list=PLcnHmqF3gRltqGbFV9159hzav6eVGVwaH&si=-4sY3NJGfDM0XSyH';
  const youtubeChannelUrl = 'https://www.youtube.com/@DomInNATEly';
  const playlistEmbedUrl = 'https://www.youtube.com/embed/videoseries?list=PLcnHmqF3gRltqGbFV9159hzav6eVGVwaH';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleQrClick = (url: string, title: string) => {
    if (onOpenCustomQr) {
      onOpenCustomQr(url, title);
    }
  };

  // Sample curated track highlights from the channel & podcast collection
  const trackCollection = [
    {
      id: 'track-1',
      title: 'Dom-I-NATE Podcast & High-Octane Soundscapes Series',
      category: 'podcast',
      categoryLabel: 'Featured Podcast',
      badgeVariant: 'purple',
      duration: 'Curated Mix',
      embedType: 'playlist',
      playlistId: 'PLcnHmqF3gRltqGbFV9159hzav6eVGVwaH',
      url: playlistUrl,
      description: 'Official continuous audio playlist featuring high-energy beats, dark drift phonk, electronic synthesis, and tech dialogue.',
      tags: ['Podcast Series', 'Electronic', 'Phonk Mix', 'Continuous Play'],
    },
    {
      id: 'track-2',
      title: 'Dom-I-NATE Tech & Hardware Engineering Talks',
      category: 'tech',
      categoryLabel: 'Tech & Podcasts',
      badgeVariant: 'blue',
      duration: 'Channel Series',
      embedType: 'channel',
      url: youtubeChannelUrl,
      description: 'Discussions on custom liquid loops, algorithmic pipeline automation, custom workstation architecture, and system thermodynamics.',
      tags: ['Engineering', 'System Architecture', 'Hardware Deep Dive'],
    },
    {
      id: 'track-3',
      title: 'Dark Phonk & High-BPM Drift Beats',
      category: 'phonk',
      categoryLabel: 'Music Production',
      badgeVariant: 'rose',
      duration: 'High Energy',
      embedType: 'playlist',
      playlistId: 'PLcnHmqF3gRltqGbFV9159hzav6eVGVwaH',
      url: playlistUrl,
      description: 'Aggressive 808 sub-bass, cowbell rhythms, distorted vinyl textures, and atmospheric tension engineered for maximum focus and adrenaline.',
      tags: ['Drift Phonk', '808 Bass', 'Adrenaline Mix', 'Production'],
    },
    {
      id: 'track-4',
      title: 'Ambient Deep Focus & Code Flow Soundscapes',
      category: 'ambient',
      categoryLabel: 'Focus Soundscapes',
      badgeVariant: 'emerald',
      duration: 'Deep Flow',
      embedType: 'playlist',
      playlistId: 'PLcnHmqF3gRltqGbFV9159hzav6eVGVwaH',
      url: playlistUrl,
      description: 'Subtle generative analog chords, low-pass filter sweeps, and polyrhythmic pulse lines designed for deep coding sprints and late-night bench sessions.',
      tags: ['Lo-Fi Focus', 'Coding Flow', 'Atmospheric Synth', 'Bespoke DSP'],
    },
  ];

  const filteredTracks = trackCollection.filter((t) => {
    if (selectedFilter === 'all') return true;
    return t.category === selectedFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Studio Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0b0f1f]/95 border border-[#1e2746] shadow-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Eyebrow & Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-950/70 border border-red-800/60 text-red-300 text-xs font-mono font-semibold shadow-sm">
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>@DomInNATEly &bull; YouTube Official</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-950/70 border border-purple-800/60 text-purple-300 text-xs font-mono font-semibold shadow-sm">
              <ListMusic className="w-3.5 h-3.5 text-purple-400" />
              <span>Curated Audio &amp; Podcast Playlist</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-semibold shadow-sm">
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>High-Fidelity Sound Lab</span>
            </span>
          </div>

          {/* Headline and Description */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-white tracking-tight flex items-center gap-3">
                <Music className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 shrink-0" />
                <span>Music, Podcasts &amp; Audio Lab</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
                Stream original music releases, energetic phonk mixes, sound design tracks, and technology podcast episodes curated by Nathaniel Mina across YouTube (
                <a
                  href={youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 font-semibold underline hover:text-red-300 transition-colors"
                >
                  @DomInNATEly
                </a>
                ) and TikTok (
                <a
                  href="https://tiktok.com/@dom_i_nater"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 font-semibold underline hover:text-rose-300 transition-colors"
                >
                  @dom_i_nater
                </a>
                ).
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <a
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-sans font-semibold text-xs sm:text-sm shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Youtube className="w-4 h-4" />
                <span>Visit YouTube Channel</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>

              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-sans font-semibold text-xs sm:text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ListMusic className="w-4 h-4" />
                <span>Open Full Playlist</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Equalizer Visualizer Aesthetic Strip */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span>NOW PLAYING &bull; OFFICIAL PODCAST &amp; MUSIC PLAYLIST</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Playlist ID: <span className="text-purple-300 font-semibold">PLcnHmqF3gRltqGbFV9159hzav6eVGVwaH</span>
                </div>
              </div>
            </div>

            {/* Soundwave bars animation */}
            <div className="flex items-end gap-1 h-6">
              {[40, 75, 55, 90, 65, 30, 85, 95, 45, 70, 80, 50, 60, 88, 35, 78, 62, 92].map((height, idx) => (
                <span
                  key={idx}
                  className="w-1 bg-gradient-to-t from-red-500 via-purple-500 to-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${height}%`,
                    animationDuration: `${0.6 + (idx % 5) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Video & Playlist Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Embedded YouTube Player */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-4 sm:p-5">
            {/* Player Top Controls Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-200">
                <Disc3 className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="font-bold">Embedded Podcast &amp; Video Station</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQrClick(playlistUrl, 'YouTube Podcast & Music Playlist')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 transition-colors flex items-center gap-1"
                  title="Share Playlist via QR"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(playlistUrl, 'playlist-url')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-1"
                  title="Copy Playlist URL"
                >
                  {copiedUrl === 'playlist-url' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline text-[11px]">
                    {copiedUrl === 'playlist-url' ? 'Copied' : 'Copy Link'}
                  </span>
                </button>

                <a
                  href={playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 px-2.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                >
                  <Tv className="w-3.5 h-3.5 text-red-400" />
                  <span>Open in YouTube</span>
                </a>
              </div>
            </div>

            {/* Embedded Iframe Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800/80">
              <iframe
                className="w-full h-full"
                src={playlistEmbedUrl}
                title="Dom-I-NATE Podcast & Music Playlist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Caption & Playback Notes */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>Continuous YouTube Playlist Stream with full chapter &amp; track navigation</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Created &amp; Curated by @DomInNATEly
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Quick Info & YouTube Channel Card */}
        <div className="lg:col-span-4 space-y-5">
          {/* YouTube Channel Spotlight Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1a0f1f] via-[#0f152d] to-[#0b0f1f] border border-red-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-500 shadow-lg">
                <Youtube className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/30 font-bold uppercase tracking-wider">
                Official Channel
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-sans tracking-tight">
                Dom-I-NATE
              </h3>
              <p className="text-xs font-mono text-red-400 font-semibold">
                @DomInNATEly
              </p>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Subscribe to Nathaniel Mina&apos;s channel for engineering deep dives, custom PC hardware overhauls, high-energy music drops, and tech podcast episodes.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-sans text-xs font-bold transition-all shadow-lg hover:shadow-red-600/30"
              >
                <Youtube className="w-4 h-4" />
                <span>Subscribe on YouTube</span>
              </a>

              <a
                href="https://tiktok.com/@dom_i_nater"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-sans text-xs font-semibold transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-rose-400" />
                <span>TikTok Audio Clips (@dom_i_nater)</span>
              </a>
            </div>
          </div>

          {/* Audio Production & Signal Chain Specs */}
          <div className="p-6 rounded-3xl bg-[#0f152d]/90 border border-[#212b4d] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-purple-400" /> Audio Production &amp; Gear
            </div>

            <ul className="space-y-2.5 text-xs font-mono text-slate-300">
              <li className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">DAW &amp; Synthesis:</strong> FL Studio 21, Ableton Live Suite, Serum, Vital &amp; Analog Emulations</span>
              </li>
              <li className="flex items-start gap-2">
                <Headphones className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Monitoring:</strong> Beyerdynamic DT 990 Pro + Dedicated High-Current DAC/Amp</span>
              </li>
              <li className="flex items-start gap-2">
                <Mic2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Voice &amp; Podcast:</strong> Shure SM7B dynamic broadcast mic with hardware preamps &amp; gate</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Curated Track & Episode Highlights */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-sans font-bold text-white tracking-tight flex items-center gap-2.5">
              <ListMusic className="w-6 h-6 text-purple-400" />
              <span>Playlist Highlights &amp; Curated Sections</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Explore key themes, podcast discussions, and electronic music series included in the collection.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 font-mono text-xs">
            {[
              { id: 'all', label: 'All Audio' },
              { id: 'podcast', label: 'Podcast Series' },
              { id: 'tech', label: 'Tech Talks' },
              { id: 'phonk', label: 'Phonk Beats' },
              { id: 'ambient', label: 'Focus & Ambient' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                  selectedFilter === cat.id
                    ? 'bg-purple-600 text-white font-bold shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Track Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTracks.map((item) => (
            <div
              key={item.id}
              className="group p-6 rounded-3xl bg-[#0f152d]/90 hover:bg-[#141b38] border border-[#212b4d] hover:border-purple-500/50 shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30 font-semibold">
                    {item.categoryLabel}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {item.duration}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors font-sans">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono font-semibold text-xs text-red-400 hover:text-red-300 group-hover:underline"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play on YouTube</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(item.url, item.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title="Copy Link"
                >
                  {copiedUrl === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Cross-Link to Beacons Hub */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white font-sans">
              Looking for more social feeds, developer repos &amp; bio links?
            </h3>
            <p className="text-xs text-slate-300 font-sans">
              Access the complete profile tree, system engineering repos, and creator hub at Beacons.
            </p>
          </div>

          <a
            href="https://beacons.ai/p_c/aboutme"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold transition-all shadow-lg hover:shadow-purple-600/30"
          >
            <span>Visit Beacons Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
