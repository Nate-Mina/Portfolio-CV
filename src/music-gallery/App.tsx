import React, { useState, useMemo, useEffect } from 'react';
import { TRACKS, PLAYLIST_URL, YOUTUBE_CHANNEL_URL, YOUTUBE_PLAYLIST_INFO } from './data/tracks';
import { SUNO_TRACKS } from './data/sunoData';
import { Track, SunoTrack, ActivePage, SortField, CategoryFilter, sunoToTrack } from './types';
import { Header } from './components/Header';
import { TrackCard } from './components/TrackCard';
import { SortingAndFilter } from './components/SortingAndFilter';
import { AudioPlayer } from './components/AudioPlayer';
import { ShareModal } from './components/ShareModal';
import { TrackDetailModal } from './components/TrackDetailModal';
import { LyricsModal } from './components/LyricsModal';
import { LyricsViewer } from './components/LyricsViewer';
import { getTrackLyrics } from './data/lyrics';
import { SunoPage } from './components/SunoPage';
import { ShowcaseVideoPlayer } from './components/ShowcaseVideoPlayer';
import { SocialSubscribeBanner } from './components/SocialSubscribeBanner';
import { SocialFooter } from './components/SocialFooter';
import { Play, Pause, Shuffle, LayoutGrid, List, Music, Sparkles, Disc, Heart, Share2, ExternalLink, Flame, Clock, Tv, FileText } from 'lucide-react';

export default function App() {
  // Dark Mode state with safe localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage?.getItem('dominnately_theme');
        if (saved) return saved === 'dark';
      } catch (err) {
        // Fallback for sandboxed iframes or restricted storage
        return true;
      }
    }
    return true; // Default to dark mode for rock/metal band aesthetic
  });

  // Active Page State ('youtube' | 'suno')
  const [activePage, setActivePage] = useState<ActivePage>('youtube'); // Default to YouTube Audio Gallery first

  // Screen width state for desktop XL stage vs mobile audio player
  const [isDesktopXL, setIsDesktopXL] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopXL(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // YouTube Player State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(TRACKS[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Desktop Stage View Mode ('video' | 'lyrics' | 'artwork')
  const [stageMode, setStageMode] = useState<'video' | 'lyrics' | 'artwork'>('video');

  // Desktop Right-hand Player Size State ('sm' | 'md' | 'lg') - Defaults to 'sm' (smaller and further right)
  const [stagePlayerSize, setStagePlayerSize] = useState<'sm' | 'md' | 'lg'>(() => {
    try {
      const saved = localStorage.getItem('dominately_stage_size');
      if (saved === 'sm' || saved === 'md' || saved === 'lg') return saved;
    } catch {
      // ignore
    }
    return 'sm';
  });

  const handleStageSizeChange = (newSize: 'sm' | 'md' | 'lg') => {
    setStagePlayerSize(newSize);
    try {
      localStorage.setItem('dominately_stage_size', newSize);
    } catch {
      // ignore
    }
  };

  // Suno Player State
  const [currentSunoTrack, setCurrentSunoTrack] = useState<SunoTrack | null>(SUNO_TRACKS[0] || null);
  const [isSunoPlaying, setIsSunoPlaying] = useState<boolean>(false);

  // Sorting & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('playlist');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [sharingTrack, setSharingTrack] = useState<Track | null>(null);
  const [detailedTrack, setDetailedTrack] = useState<Track | null>(null);
  const [lyricsTrack, setLyricsTrack] = useState<Track | null>(null);

  // Persist dark mode setting safely
  useEffect(() => {
    try {
      window.localStorage?.setItem('dominnately_theme', isDarkMode ? 'dark' : 'light');
    } catch (err) {
      // Ignore storage errors in restricted contexts
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Suno Tracks converted to standard Track interface for AudioPlayer
  const sunoTracksAsStandard = useMemo(() => SUNO_TRACKS.map(sunoToTrack), []);

  // Handle Play/Pause
  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  // Handle Play/Pause for Suno Tracks (seamlessly links to sticky AudioPlayer)
  const handlePlaySunoTrack = (sunoTrack: SunoTrack) => {
    setCurrentSunoTrack(sunoTrack);
    const converted = sunoToTrack(sunoTrack);
    if (currentTrack?.id === converted.id) {
      setIsPlaying(!isPlaying);
      setIsSunoPlaying(!isPlaying);
    } else {
      setCurrentTrack(converted);
      setIsPlaying(true);
      setIsSunoPlaying(true);
    }
  };

  // Active Suno Track synced with currentTrack
  const activeSunoTrack = useMemo(() => {
    if (currentTrack?.isSuno) {
      return SUNO_TRACKS.find((st) => st.id === currentTrack.id) || currentSunoTrack;
    }
    return currentSunoTrack;
  }, [currentTrack, currentSunoTrack]);

  // Filtered & Sorted Tracks
  const filteredAndSortedTracks = useMemo(() => {
    let result = [...TRACKS];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          (t.featuredLyrics && t.featuredLyrics.toLowerCase().includes(q)) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortField) {
        case 'playlist':
          return a.index - b.index;
        case 'newest':
          return b.index - a.index;
        case 'duration-desc':
          return b.durationSeconds - a.durationSeconds;
        case 'duration-asc':
          return a.durationSeconds - b.durationSeconds;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return a.index - b.index;
      }
    });

    return result;
  }, [searchQuery, selectedCategory, sortField]);

  // Playlist passed to sticky AudioPlayer
  const activePlaylistForAudioPlayer = useMemo(() => {
    if (activePage === 'suno' || currentTrack?.isSuno) {
      return sunoTracksAsStandard;
    }
    return filteredAndSortedTracks.length > 0 ? filteredAndSortedTracks : TRACKS;
  }, [activePage, currentTrack?.isSuno, sunoTracksAsStandard, filteredAndSortedTracks]);

  // Quick Play All / Shuffle All
  const handlePlayAll = () => {
    if (filteredAndSortedTracks.length > 0) {
      setCurrentTrack(filteredAndSortedTracks[0]);
      setIsPlaying(true);
    }
  };

  const handleShufflePlayAll = () => {
    if (filteredAndSortedTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAndSortedTracks.length);
      setCurrentTrack(filteredAndSortedTracks[randomIndex]);
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={`min-h-screen font-outfit transition-colors duration-200 flex flex-col ${
        isDarkMode ? 'bg-[#050505] text-white' : 'bg-neutral-50 text-neutral-900'
      }`}
    >
      {/* Top Header with Band Name DomInNATEly & Dark Mode Toggle */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        trackCount={activePage === 'suno' ? SUNO_TRACKS.length : TRACKS.length}
        onQuickShareAll={() => setSharingTrack(currentTrack || TRACKS[0])}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-36">
        {/* Page Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            id="tab-youtube-gallery"
            onClick={() => {
              setActivePage('youtube');
            }}
            className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all border shadow-sm ${
              activePage === 'youtube'
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                : isDarkMode
                ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-cyan-400'
                : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>YouTube Audio Gallery ({TRACKS.length} Tracks)</span>
          </button>

          <button
            id="tab-suno-playlist"
            onClick={() => {
              setActivePage('suno');
            }}
            className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all border shadow-sm ${
              activePage === 'suno'
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                : isDarkMode
                ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-cyan-400'
                : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Suno AI Playlist ({SUNO_TRACKS.length} Tracks)</span>
          </button>
        </div>

        {/* Responsive Catalog Layout (with Now Playing Showcase Stage on XL screens) */}
        <div className="xl:grid xl:grid-cols-12 xl:gap-8 items-start">
          {/* Main Catalog Column (Sized dynamically based on right player size preference) */}
          <div
            className={
              stagePlayerSize === 'sm'
                ? 'xl:col-span-8 2xl:col-span-9 transition-all duration-300'
                : stagePlayerSize === 'md'
                ? 'xl:col-span-7 2xl:col-span-8 transition-all duration-300'
                : 'xl:col-span-6 transition-all duration-300'
            }
          >
            {activePage === 'suno' ? (
              <SunoPage
                isDarkMode={isDarkMode}
                currentTrack={activeSunoTrack}
                isPlaying={isPlaying && Boolean(currentTrack?.isSuno)}
                onPlayTrack={handlePlaySunoTrack}
                onTogglePlayPause={() => {
                  setIsPlaying(!isPlaying);
                  setIsSunoPlaying(!isPlaying);
                }}
                onTrackChange={handlePlaySunoTrack}
                onSwitchToYouTube={() => setActivePage('youtube')}
              />
            ) : (
              <>
            {/* YouTube Playlist Hero Banner */}
            <section
              id="youtube-hero-banner"
              className={`relative overflow-hidden rounded-3xl border mb-8 p-6 sm:p-8 md:p-10 transition-colors ${
                isDarkMode
                  ? 'bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 border-white/10 shadow-2xl'
                  : 'bg-gradient-to-br from-red-50/70 via-white to-neutral-100 border-neutral-200 shadow-lg'
              }`}
            >
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
                {/* Playlist Artwork */}
                <div className="relative flex-shrink-0 group">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-900">
                    <img
                      src={YOUTUBE_PLAYLIST_INFO.cover}
                      alt={YOUTUBE_PLAYLIST_INFO.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-600 text-white font-mono font-bold text-[10px] tracking-wider uppercase shadow-lg shadow-red-600/30 flex items-center gap-1.5 whitespace-nowrap">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>YouTube Top Hits</span>
                  </div>
                </div>

                {/* Playlist Info & Meta */}
                <div className="flex-1 text-center md:text-left flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                        <Disc className="w-3.5 h-3.5" />
                        <span>Official YouTube Playlist</span>
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono border ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-white/70' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
                        }`}
                      >
                        {TRACKS.length} Recorded Tracks
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono border ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-white/70' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
                        }`}
                      >
                        {YOUTUBE_PLAYLIST_INFO.totalDurationFormatted}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                      {YOUTUBE_PLAYLIST_INFO.name}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
                      <span className="text-cyan-400 font-bold">{YOUTUBE_PLAYLIST_INFO.channel}</span>
                      <span className="opacity-40">•</span>
                      <a
                        href={YOUTUBE_PLAYLIST_INFO.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        <span>▶️ YouTube: @DomInNATEly</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="opacity-40">•</span>
                      <a
                        href="https://www.tiktok.com/@dominnately"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        <span>🎵 TikTok: @dominnately</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="opacity-40">•</span>
                      <a
                        href="https://nate-mina.github.io/Portfolio-CV/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 hover:underline flex items-center gap-1 font-mono text-xs"
                        title="About Nate Mina - Portfolio & CV"
                      >
                        <span>👤 About Me</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="opacity-40">•</span>
                      <a
                        href={YOUTUBE_PLAYLIST_INFO.playlistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        <span>Open Playlist on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <p
                      className={`mt-3 text-sm max-w-2xl leading-relaxed ${
                        isDarkMode ? 'text-white/70' : 'text-neutral-600'
                      }`}
                    >
                      {YOUTUBE_PLAYLIST_INFO.description} Full-length studio recordings, explosive remixes, and introspective anthems.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button
                      id="youtube-hero-play-all-btn"
                      onClick={handlePlayAll}
                      className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-400/25 transition-transform active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play All ({TRACKS.length})</span>
                    </button>

                    <button
                      id="youtube-hero-shuffle-btn"
                      onClick={handleShufflePlayAll}
                      className={`px-4 py-2.5 rounded-full border text-sm font-bold flex items-center gap-2 transition-all active:scale-95 ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-white hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-white/10'
                          : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      <Shuffle className="w-4 h-4 text-cyan-400" />
                      <span>Shuffle</span>
                    </button>

                    <a
                      id="youtube-open-official-btn"
                      href={YOUTUBE_PLAYLIST_INFO.playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 rounded-full border text-sm font-semibold flex items-center gap-1.5 transition-all ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-white/80 hover:text-red-400 hover:border-red-400/40 hover:bg-white/10'
                          : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <Disc className="w-4 h-4 text-red-500" />
                      <span>Open YouTube Playlist</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>

                    <button
                      id="switch-to-suno-hero-btn"
                      onClick={() => setActivePage('suno')}
                      className={`px-4 py-2.5 rounded-full border text-sm font-semibold flex items-center gap-1.5 transition-all ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-cyan-400 hover:bg-white/10'
                          : 'bg-neutral-100 border-neutral-300 text-cyan-700 hover:bg-neutral-200'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Switch to Suno Playlist ({SUNO_TRACKS.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Social Follow & Subscribe Banner */}
            <SocialSubscribeBanner isDarkMode={isDarkMode} />

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <button
              id="play-all-tracks-btn"
              onClick={handlePlayAll}
              className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>

            <button
              id="shuffle-all-tracks-btn"
              onClick={handleShufflePlayAll}
              className={`px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-95 ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white hover:text-cyan-400 hover:border-cyan-400/40'
                  : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Shuffle</span>
            </button>
          </div>

          {/* View mode toggle (Grid / List) */}
          <div
            className={`flex items-center gap-1.5 p-1 rounded-full border ${
              isDarkMode ? 'border-white/10 bg-white/5' : 'border-neutral-300 bg-neutral-100'
            }`}
          >
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : isDarkMode
                  ? 'text-white/60 hover:text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              id="view-mode-list"
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : isDarkMode
                  ? 'text-white/60 hover:text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Sorting, Search & Filter Controls */}
        <SortingAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortField={sortField}
          onSortChange={setSortField}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalResults={filteredAndSortedTracks.length}
          totalTracks={TRACKS.length}
          isDarkMode={isDarkMode}
        />

        {filteredAndSortedTracks.length > 0 ? (
              viewMode === 'grid' ? (
                <div
                  id="tracks-grid-container"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {filteredAndSortedTracks.map((track) => (
                    <TrackCard
                      key={`${track.id}-${track.index}`}
                      track={track}
                      isPlaying={isPlaying}
                      isCurrentTrack={currentTrack?.id === track.id}
                      onPlay={handlePlayTrack}
                      onOpenShare={(t) => setSharingTrack(t)}
                      onOpenDetails={(t) => setDetailedTrack(t)}
                      onOpenLyrics={(t) => setLyricsTrack(t)}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              ) : (
                /* Compact Immersive List View */
                <div id="tracks-list-container" className="flex flex-col gap-2.5">
                  {/* Table Column Header matching Immersive UI */}
                  <div
                    className={`grid grid-cols-12 text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 ${
                      isDarkMode ? 'text-white/40' : 'text-neutral-500'
                    }`}
                  >
                    <div className="col-span-7 sm:col-span-6">Track Info</div>
                    <div className="hidden sm:block sm:col-span-3">Category</div>
                    <div className="col-span-3 sm:col-span-2">Duration</div>
                    <div className="col-span-2 sm:col-span-1 text-right">Share</div>
                  </div>

                  {filteredAndSortedTracks.map((track) => {
                    const isCurrent = currentTrack?.id === track.id;
                    return (
                      <div
                        key={`${track.id}-${track.index}`}
                        id={`track-list-item-${track.id}`}
                        onClick={() => handlePlayTrack(track)}
                        className={`group p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isCurrent
                            ? isDarkMode
                              ? 'bg-white/10 border-cyan-400/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/30'
                              : 'bg-cyan-50/50 border-cyan-400 text-cyan-900 shadow-xs'
                            : isDarkMode
                            ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15 text-white'
                            : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900 shadow-xs'
                        }`}
                      >
                        <div className="grid grid-cols-12 w-full items-center gap-2">
                          {/* Col: Track Info (Thumbnail, Play button, Title) */}
                          <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0">
                            {/* Gradient Index Badge */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
                              {track.index.toString().padStart(2, '0')}
                            </div>

                            {/* Thumbnail */}
                            <img
                              src={track.thumbnail}
                              alt={track.title}
                              className="w-12 h-8 rounded-lg object-cover border border-white/10 shrink-0 hidden sm:block"
                              referrerPolicy="no-referrer"
                            />

                            <div className="min-w-0">
                              <h4
                                className={`font-bold text-xs sm:text-sm truncate transition-colors ${
                                  isCurrent
                                    ? 'text-cyan-400'
                                    : 'group-hover:text-cyan-400'
                                }`}
                              >
                                {track.title}
                              </h4>
                              <p className={`text-[11px] truncate ${isDarkMode ? 'text-white/50' : 'text-neutral-500'}`}>
                                {track.artist}
                              </p>
                            </div>
                          </div>

                          {/* Col: Category */}
                          <div className="hidden sm:block sm:col-span-3">
                            <span
                              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                                isDarkMode
                                  ? 'bg-white/5 border-white/10 text-white/60'
                                  : 'bg-neutral-100 border-neutral-300 text-neutral-600'
                              }`}
                            >
                              {track.category}
                            </span>
                          </div>

                          {/* Col: Duration */}
                          <div className="col-span-3 sm:col-span-2">
                            <span className="text-xs font-mono text-cyan-400 font-bold">
                              {track.duration}
                            </span>
                          </div>

                          {/* Col: Actions */}
                          <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1">
                            <button
                              id={`list-lyrics-btn-${track.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLyricsTrack(track);
                              }}
                              className={`p-1.5 rounded-md transition-colors ${
                                isDarkMode
                                  ? 'text-white/50 hover:text-cyan-400 hover:bg-white/10'
                                  : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
                              }`}
                              title="View Full Lyrics"
                              aria-label={`View lyrics for ${track.title}`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`list-share-btn-${track.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSharingTrack(track);
                              }}
                              className={`p-1.5 rounded-md transition-colors ${
                                isDarkMode
                                  ? 'text-white/50 hover:text-cyan-400 hover:bg-white/10'
                                  : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
                              }`}
                              title="Share Track"
                              aria-label={`Share ${track.title}`}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Empty Search State */
              <div
                id="empty-tracks-state"
                className={`rounded-2xl border p-12 text-center my-6 backdrop-blur-md ${
                  isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-neutral-200'
                }`}
              >
                <Music className="w-10 h-10 mx-auto mb-3 text-cyan-400 opacity-80" />
                <h3 className="text-base font-bold">No tracks matched your search</h3>
                <p className={`text-xs mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-white/50' : 'text-neutral-600'}`}>
                  Try clearing your search query or selecting "All Tracks" to view the complete catalog.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSortField('playlist');
                  }}
                  className="mt-4 px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Column: Immersive UI Now Playing Showcase Stage (Desktop XL) */}
      {(() => {
        const showcaseTrack = currentTrack || (activePage === 'suno' ? sunoTracksAsStandard[0] : TRACKS[0]);
        if (!showcaseTrack) return null;
        return (
          <aside
            className={`hidden xl:block ${
              stagePlayerSize === 'sm'
                ? 'xl:col-span-4 2xl:col-span-3'
                : stagePlayerSize === 'md'
                ? 'xl:col-span-5 2xl:col-span-4'
                : 'xl:col-span-6'
            } sticky top-24 transition-all duration-300 flex justify-end`}
          >
            <div
              id="immersive-now-playing-stage"
              className={`w-full rounded-3xl border ${
                stagePlayerSize === 'sm'
                  ? 'p-3.5 sm:p-4 max-w-[320px]'
                  : stagePlayerSize === 'md'
                  ? 'p-4 sm:p-5 max-w-[400px]'
                  : 'p-5 sm:p-6 max-w-[490px]'
              } ml-auto flex flex-col items-center justify-center backdrop-blur-xl transition-all shadow-2xl relative overflow-hidden ${
                isDarkMode
                  ? 'bg-black/60 border-white/10 text-white'
                  : 'bg-white/95 border-neutral-200 text-neutral-900'
              }`}
            >
              {/* Ambient Cyan Pulse Glow from Design */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/15 blur-[60px] rounded-full pointer-events-none animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-600/15 blur-[60px] rounded-full pointer-events-none" />

              {/* Stage Mode Tabs & Size Adjuster Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 w-full mb-3 z-20">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-400 animate-ping' : 'bg-white/30'}`} />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400">
                    {isPlaying ? 'Live Stage' : 'Now Playing'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Mode Tabs */}
                  <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10 text-xs">
                    <button
                      onClick={() => setStageMode('video')}
                      className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                        stageMode === 'video'
                          ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                          : 'text-white/60 hover:text-white'
                      }`}
                      title="Watch Music Video"
                    >
                      <Tv className="w-3 h-3" />
                      <span className={stagePlayerSize === 'sm' ? 'hidden sm:inline text-[11px]' : 'text-xs'}>Video</span>
                    </button>
                    <button
                      onClick={() => setStageMode('lyrics')}
                      className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                        stageMode === 'lyrics'
                          ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                          : 'text-white/60 hover:text-white'
                      }`}
                      title="View Full Lyrics"
                    >
                      <FileText className="w-3 h-3" />
                      <span className={stagePlayerSize === 'sm' ? 'hidden sm:inline text-[11px]' : 'text-xs'}>Lyrics</span>
                    </button>
                    <button
                      onClick={() => setStageMode('artwork')}
                      className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                        stageMode === 'artwork'
                          ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                          : 'text-white/60 hover:text-white'
                      }`}
                      title="View Album Art"
                    >
                      <Disc className="w-3 h-3" />
                      <span className={stagePlayerSize === 'sm' ? 'hidden sm:inline text-[11px]' : 'text-xs'}>Art</span>
                    </button>
                  </div>

                  {/* Size Adjuster Buttons (S, M, L) */}
                  <div
                    className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10"
                    title="Adjust player size & right positioning"
                  >
                    <button
                      onClick={() => handleStageSizeChange('sm')}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        stagePlayerSize === 'sm'
                          ? 'bg-cyan-500 text-black shadow-sm font-black'
                          : 'text-white/50 hover:text-white'
                      }`}
                      title="Compact (Smaller & further right)"
                      aria-label="Set player size to small"
                    >
                      S
                    </button>
                    <button
                      onClick={() => handleStageSizeChange('md')}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        stagePlayerSize === 'md'
                          ? 'bg-cyan-500 text-black shadow-sm font-black'
                          : 'text-white/50 hover:text-white'
                      }`}
                      title="Medium player size"
                      aria-label="Set player size to medium"
                    >
                      M
                    </button>
                    <button
                      onClick={() => handleStageSizeChange('lg')}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        stagePlayerSize === 'lg'
                          ? 'bg-cyan-500 text-black shadow-sm font-black'
                          : 'text-white/50 hover:text-white'
                      }`}
                      title="Large expanded player size"
                      aria-label="Set player size to large"
                    >
                      L
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Visual Display Area */}
              <div className="relative w-full mb-3.5 z-10">
                {/* VIDEO MODE: Real interactive video player for YouTube & Suno */}
                <div className={stageMode === 'video' ? 'block' : 'hidden'}>
                  <ShowcaseVideoPlayer
                    track={showcaseTrack}
                    isPlaying={isPlaying && currentTrack?.id === showcaseTrack.id}
                    onPlay={(track) => {
                      if (currentTrack?.id === track.id) {
                        setIsPlaying(true);
                      } else {
                        handlePlayTrack(track);
                      }
                    }}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => {
                      const list = activePlaylistForAudioPlayer;
                      const idx = list.findIndex((t) => t.id === showcaseTrack.id);
                      if (idx !== -1 && idx < list.length - 1) {
                        handlePlayTrack(list[idx + 1]);
                      } else if (list.length > 0) {
                        handlePlayTrack(list[0]);
                      }
                    }}
                    isDarkMode={isDarkMode}
                    size={stagePlayerSize}
                  />
                </div>

                {/* LYRICS MODE: Formatted Full Song Lyrics */}
                {stageMode === 'lyrics' && (
                  <div className="w-full p-3.5 rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-md shadow-xl">
                    <LyricsViewer
                      lyrics={getTrackLyrics(showcaseTrack)}
                      title={showcaseTrack.title}
                      artist={showcaseTrack.artist}
                      isDarkMode={isDarkMode}
                      maxHeight="max-h-[440px]"
                    />
                  </div>
                )}

                {/* ARTWORK MODE: Full Artwork Box with Pulsing Glow & Watermark */}
                {stageMode === 'artwork' && (
                  <div className="relative w-full aspect-square group">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full animate-pulse pointer-events-none" />
                    <div className="relative z-10 w-full h-full bg-gradient-to-br from-neutral-800 to-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                      <img
                        src={showcaseTrack.thumbnail}
                        alt={showcaseTrack.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-3 right-3 text-2xl font-black text-white/25 font-mono tracking-widest pointer-events-none drop-shadow-md">
                        D-LY
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => {
                            if (currentTrack?.id === showcaseTrack.id) {
                              setIsPlaying(!isPlaying);
                            } else {
                              handlePlayTrack(showcaseTrack);
                            }
                          }}
                          className="w-14 h-14 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                          aria-label="Toggle playback"
                        >
                          {isPlaying && currentTrack?.id === showcaseTrack.id ? (
                            <Pause className="w-6 h-6 fill-current" />
                          ) : (
                            <Play className="w-6 h-6 fill-current translate-x-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Track Title, Artist, & Metadata */}
              <div className="text-center w-full z-10">
                <h2
                  className={`${
                    stagePlayerSize === 'sm' ? 'text-base font-extrabold' : 'text-xl font-black'
                  } mb-1 tracking-tight truncate hover:text-cyan-400 transition-colors`}
                  title={showcaseTrack.title}
                >
                  {showcaseTrack.title}
                </h2>
                <p className={`text-cyan-400 ${stagePlayerSize === 'sm' ? 'text-[10px]' : 'text-xs'} font-bold tracking-widest uppercase mb-2.5`}>
                  {isPlaying && currentTrack?.id === showcaseTrack.id ? 'Now Playing' : 'Selected Track'} • #{showcaseTrack.index.toString().padStart(2, '0')}
                </p>

                {/* Equalizer Bars */}
                <div className={`flex gap-1 justify-center items-end ${stagePlayerSize === 'sm' ? 'h-5 mb-3' : 'h-7 mb-4'}`}>
                  <div className={`w-1 bg-cyan-500 rounded-full ${isPlaying && currentTrack?.id === showcaseTrack.id ? 'h-[60%] animate-eq-1' : 'h-[25%]'}`} />
                  <div className={`w-1 bg-cyan-500 rounded-full ${isPlaying && currentTrack?.id === showcaseTrack.id ? 'h-[90%] animate-eq-2' : 'h-[40%]'}`} />
                  <div className={`w-1 bg-cyan-500 rounded-full ${isPlaying && currentTrack?.id === showcaseTrack.id ? 'h-[40%] animate-eq-3' : 'h-[20%]'}`} />
                  <div className={`w-1 bg-cyan-500 rounded-full ${isPlaying && currentTrack?.id === showcaseTrack.id ? 'h-[70%] animate-eq-4' : 'h-[35%]'}`} />
                  <div className={`w-1 bg-cyan-500 rounded-full ${isPlaying && currentTrack?.id === showcaseTrack.id ? 'h-[30%] animate-eq-2' : 'h-[15%]'}`} />
                </div>

                {/* Action Buttons: Full Lyrics, Share, Story */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setLyricsTrack(showcaseTrack)}
                    className={`px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black ${
                      stagePlayerSize === 'sm' ? 'text-[11px]' : 'text-xs'
                    } font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95`}
                    title="View Full Lyrics in Modal"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lyrics</span>
                  </button>

                  <button
                    onClick={() => setSharingTrack(showcaseTrack)}
                    className={`px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 ${
                      stagePlayerSize === 'sm' ? 'text-[11px]' : 'text-xs'
                    } font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => setDetailedTrack(showcaseTrack)}
                    className={`px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 ${
                      stagePlayerSize === 'sm' ? 'text-[11px]' : 'text-xs'
                    } font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all`}
                  >
                    <Music className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Story</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        );
      })()}
        </div>

        {/* Rich Artist & Social Footer */}
        <SocialFooter isDarkMode={isDarkMode} />
      </main>

      {/* Interactive Sticky Audio Player */}
      <AudioPlayer
        currentTrack={currentTrack}
        playlist={activePlaylistForAudioPlayer}
        allPlaylists={{
          youtube: filteredAndSortedTracks.length > 0 ? filteredAndSortedTracks : TRACKS,
          suno: sunoTracksAsStandard,
        }}
        onSwitchPlaylist={(type) => {
          setActivePage(type);
          if (type === 'suno' && SUNO_TRACKS.length > 0) {
            handlePlaySunoTrack(SUNO_TRACKS[0]);
          } else if (type === 'youtube' && TRACKS.length > 0) {
            handlePlayTrack(TRACKS[0]);
          }
        }}
        currentPlaylistType={currentTrack?.isSuno ? 'suno' : 'youtube'}
        onTrackChange={(track) => {
          setCurrentTrack(track);
          setIsPlaying(true);
          if (track.isSuno) {
            const st = SUNO_TRACKS.find((s) => s.id === track.id);
            if (st) {
              setCurrentSunoTrack(st);
              setIsSunoPlaying(true);
            }
          } else {
            setIsSunoPlaying(false);
          }
        }}
        onOpenShare={(track) => setSharingTrack(track)}
        onOpenLyrics={(track) => setLyricsTrack(track)}
        disableInternalPlayback={isDesktopXL}
        isDarkMode={isDarkMode}
        isPlaying={isPlaying}
        setIsPlaying={(playing) => {
          setIsPlaying(playing);
          if (currentTrack?.isSuno) {
            setIsSunoPlaying(playing);
          }
        }}
      />

      {/* Social Media Sharing Modal for Every Song */}
      <ShareModal
        track={sharingTrack}
        isOpen={!!sharingTrack}
        onClose={() => setSharingTrack(null)}
        isDarkMode={isDarkMode}
      />

      {/* Track Details & Story Modal */}
      <TrackDetailModal
        track={detailedTrack}
        isOpen={!!detailedTrack}
        onClose={() => setDetailedTrack(null)}
        isPlaying={isPlaying}
        isCurrentTrack={currentTrack?.id === detailedTrack?.id}
        onPlay={handlePlayTrack}
        onOpenShare={(t) => setSharingTrack(t)}
        isDarkMode={isDarkMode}
      />

      {/* Dedicated Full Song Lyrics Modal with Suno Lyrics */}
      <LyricsModal
        track={lyricsTrack}
        isOpen={!!lyricsTrack}
        onClose={() => setLyricsTrack(null)}
        isDarkMode={isDarkMode}
        isPlaying={isPlaying}
        isCurrentTrack={currentTrack?.id === lyricsTrack?.id}
        onPlay={handlePlayTrack}
        onOpenShare={(t) => setSharingTrack(t)}
      />
    </div>
  );
}
