import React, { useState, useMemo } from 'react';
import { SUNO_TRACKS, SUNO_PLAYLIST_INFO } from '../data/sunoData';
import { TRACKS } from '../data/tracks';
import { SunoTrack } from '../types';
import { SunoTrackCard } from './SunoTrackCard';
import { SunoLyricsModal } from './SunoLyricsModal';
import { SunoEmbedModal } from './SunoEmbedModal';
import { SunoShareModal } from './SunoShareModal';
import { SocialSubscribeBanner } from './SocialSubscribeBanner';
import {
  Play,
  Pause,
  Shuffle,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  Share2,
  Sparkles,
  Music,
  Clock,
  Disc,
  Flame,
  FileText,
  Tv,
} from 'lucide-react';

interface SunoPageProps {
  isDarkMode: boolean;
  currentTrack: SunoTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: SunoTrack) => void;
  onTogglePlayPause: () => void;
  onTrackChange: (track: SunoTrack) => void;
  onSwitchToYouTube?: () => void;
}

export const SunoPage: React.FC<SunoPageProps> = ({
  isDarkMode,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlayPause,
  onTrackChange,
  onSwitchToYouTube,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'index' | 'title' | 'duration-desc' | 'duration-asc'>('index');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [lyricsTrack, setLyricsTrack] = useState<SunoTrack | null>(null);
  const [embedTrack, setEmbedTrack] = useState<SunoTrack | null>(null);
  const [shareTrack, setShareTrack] = useState<SunoTrack | null>(null);

  // Genre tags extracted from tracks
  const availableTags = useMemo(() => {
    return [
      { id: 'all', label: 'All Tracks' },
      { id: 'alt-drill', label: 'Alt-Drill & Trap' },
      { id: 'rock', label: 'Rock & Alt Pop' },
      { id: 'hip-hop', label: 'Rap & Hip-Hop' },
      { id: 'duet', label: 'Duets' },
      { id: 'ballad', label: 'Ballads & Acoustic' },
    ];
  }, []);

  const formattedTotalDuration = useMemo(() => {
    const totalSecs = SUNO_PLAYLIST_INFO.totalDurationSeconds || SUNO_TRACKS.reduce((acc, t) => acc + t.duration, 0);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    return `${hrs} hr ${mins} min`;
  }, []);

  // Filter & Sort Tracks
  const filteredTracks = useMemo(() => {
    let list = [...SUNO_TRACKS];

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.lyrics.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedTag !== 'all') {
      list = list.filter((t) => {
        const fullText = (t.tags.join(' ') + ' ' + t.title + ' ' + t.lyrics).toLowerCase();
        if (selectedTag === 'alt-drill') {
          return fullText.includes('drill') || fullText.includes('trap') || fullText.includes('dubstep');
        }
        if (selectedTag === 'rock') {
          return fullText.includes('rock') || fullText.includes('pop') || fullText.includes('punk');
        }
        if (selectedTag === 'hip-hop') {
          return fullText.includes('rap') || fullText.includes('hip-hop') || fullText.includes('hip hop');
        }
        if (selectedTag === 'duet') {
          return fullText.includes('duet') || fullText.includes('female vocals');
        }
        if (selectedTag === 'ballad') {
          return fullText.includes('ballad') || fullText.includes('acoustic') || fullText.includes('piano');
        }
        return true;
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'duration-desc') {
        return b.duration - a.duration;
      }
      if (sortBy === 'duration-asc') {
        return a.duration - b.duration;
      }
      return a.index - b.index;
    });

    return list;
  }, [searchQuery, selectedTag, sortBy]);

  // Quick Play All / Shuffle All
  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      onPlayTrack(filteredTracks[0]);
    }
  };

  const handleShufflePlayAll = () => {
    if (filteredTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredTracks.length);
      onPlayTrack(filteredTracks[randomIndex]);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero Banner Section */}
      <section
        id="suno-hero-banner"
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border mb-4 sm:mb-8 p-3.5 sm:p-8 md:p-10 transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-br from-neutral-900/90 via-black to-neutral-950 border-white/10 shadow-2xl'
            : 'bg-gradient-to-br from-cyan-50/80 via-white to-neutral-100 border-neutral-200 shadow-lg'
        }`}
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-8">
          {/* Playlist Artwork with badge */}
          <div className="relative flex-shrink-0 group">
            <div className="w-28 h-28 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-900">
              <img
                src={SUNO_PLAYLIST_INFO.cover}
                alt={SUNO_PLAYLIST_INFO.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-2.5 sm:-bottom-3 left-1/2 -translate-x-1/2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500 text-black font-mono font-bold text-[9px] sm:text-[10px] tracking-wider uppercase shadow-lg shadow-cyan-500/30 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span>Suno Top Hits</span>
            </div>
          </div>

          {/* Playlist Meta & Actions */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 flex items-center gap-1 sm:gap-1.5">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Suno Playlist</span>
                </span>
                <span
                  className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono border ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white/70' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
                  }`}
                >
                  {SUNO_TRACKS.length} Official Tracks
                </span>
                <span
                  className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono border ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white/70' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
                  }`}
                >
                  {formattedTotalDuration}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {SUNO_PLAYLIST_INFO.name}
              </h1>

              {/* Creator & Links */}
              <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium">
                <span className="text-cyan-400 font-bold">{SUNO_PLAYLIST_INFO.user_display_name}</span>
                <span className="opacity-40">•</span>
                <a
                  href="https://www.tiktok.com/@dominnately"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:underline flex items-center gap-1 font-mono text-[11px] sm:text-xs"
                >
                  <span>🎵 TikTok: @dominnately</span>
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </a>
                <span className="opacity-40">•</span>
                <a
                  href="https://www.youtube.com/@DomInNATEly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:underline flex items-center gap-1 font-mono text-[11px] sm:text-xs"
                >
                  <span>▶️ YouTube: @DomInNATEly</span>
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </a>
                <span className="opacity-40">•</span>
                <a
                  href="https://nate-mina.github.io/Portfolio-CV/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:underline flex items-center gap-1 font-mono text-[11px] sm:text-xs"
                  title="About Nate Mina - Portfolio & CV"
                >
                  <span>👤 About Me</span>
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </a>
              </div>

              {/* Description */}
              <p
                className={`mt-2 sm:mt-3 text-xs sm:text-sm max-w-2xl leading-relaxed ${
                  isDarkMode ? 'text-white/70' : 'text-neutral-600'
                }`}
              >
                {SUNO_PLAYLIST_INFO.description}. Stream the official Suno AI audio collection featuring high-fidelity guitars, dual vocal anthems, hard-hitting trap beats, and psychological lyricism.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
              <button
                id="suno-play-all-btn"
                onClick={handlePlayAll}
                className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-cyan-400/25 transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span>Play All</span>
              </button>

              <button
                id="suno-shuffle-all-btn"
                onClick={handleShufflePlayAll}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-white/10'
                    : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>Shuffle</span>
              </button>

              <a
                id="suno-open-official-btn"
                href={SUNO_PLAYLIST_INFO.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-white/10'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>Open on Suno</span>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70" />
              </a>

              {onSwitchToYouTube && (
                <button
                  id="switch-to-youtube-hero-btn"
                  onClick={onSwitchToYouTube}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-red-400 hover:bg-white/10'
                      : 'bg-neutral-100 border-neutral-300 text-red-700 hover:bg-neutral-200'
                  }`}
                >
                  <Disc className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                  <span>Switch to YouTube Gallery ({TRACKS.length})</span>
                </button>
              )}

              <button
                onClick={() => setShareTrack(null)}
                className={`p-2.5 rounded-full border transition-all ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }`}
                title="Share Playlist"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Follow & Subscribe Banner */}
      <SocialSubscribeBanner isDarkMode={isDarkMode} />

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            id="suno-search-input"
            type="text"
            placeholder="Search Suno tracks, lyrics, styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors ${
              isDarkMode
                ? 'bg-neutral-900 border-white/10 text-white placeholder-white/40 focus:border-cyan-400/60'
                : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-cyan-500'
            }`}
          />
        </div>

        {/* Right side: Sort & View Mode */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Sort Dropdown */}
          <select
            id="suno-sort-select"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none cursor-pointer ${
              isDarkMode
                ? 'bg-neutral-900 border-white/10 text-white'
                : 'bg-white border-neutral-300 text-neutral-800'
            }`}
          >
            <option value="index">Tracklist Order (#1 - #{SUNO_TRACKS.length})</option>
            <option value="title">Title (A to Z)</option>
            <option value="duration-desc">Duration (Longest first)</option>
            <option value="duration-asc">Duration (Shortest first)</option>
          </select>

          {/* View Mode Toggle */}
          <div
            className={`flex items-center p-1 rounded-xl border ${
              isDarkMode ? 'border-white/10 bg-white/5' : 'border-neutral-300 bg-neutral-100'
            }`}
          >
            <button
              id="suno-view-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : isDarkMode
                  ? 'text-white/60 hover:text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              id="suno-view-list"
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : isDarkMode
                  ? 'text-white/60 hover:text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Genre Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 custom-scrollbar">
        {availableTags.map((t) => (
          <button
            key={t.id}
            id={`suno-filter-tag-${t.id}`}
            onClick={() => setSelectedTag(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              selectedTag === t.id
                ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                : isDarkMode
                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="text-[11px] font-mono opacity-50 ml-auto whitespace-nowrap">
          Showing {filteredTracks.length} of {SUNO_TRACKS.length} tracks
        </span>
      </div>

      {/* Tracks Grid or List */}
      {filteredTracks.length > 0 ? (
        viewMode === 'grid' ? (
          <div
            id="suno-tracks-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredTracks.map((track) => (
              <SunoTrackCard
                key={`${track.id}-${track.index}`}
                track={track}
                isPlaying={isPlaying}
                isCurrentTrack={currentTrack?.id === track.id}
                onPlay={(t) => onPlayTrack(t)}
                onOpenLyrics={(t) => setLyricsTrack(t)}
                onOpenEmbed={(t) => setEmbedTrack(t)}
                onOpenShare={(t) => setShareTrack(t)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div id="suno-tracks-list" className="flex flex-col gap-2.5">
            {/* Table Column Header matching Clean Minimal UI */}
            <div
              className={`grid grid-cols-12 text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 ${
                isDarkMode ? 'text-white/40' : 'text-neutral-500'
              }`}
            >
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-8 sm:col-span-9">Track Name</div>
              <div className="col-span-3 sm:col-span-2 text-right">Duration</div>
            </div>

            {filteredTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={`${track.id}-${track.index}`}
                  id={`suno-list-item-${track.id}`}
                  onClick={() => onPlayTrack(track)}
                  className={`group p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? isDarkMode
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                        : 'bg-cyan-50 border-cyan-300 text-cyan-900'
                      : isDarkMode
                      ? 'bg-neutral-900/50 border-white/5 hover:border-white/15 hover:bg-neutral-900'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
                  }`}
                >
                  {/* Left info */}
                  <div className="grid grid-cols-12 items-center flex-1 min-w-0">
                    {/* Index or play icon */}
                    <div className="col-span-1 flex items-center justify-center font-mono text-xs opacity-60">
                      {isCurrent && isPlaying ? (
                        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                      ) : (
                        <span>{track.index}</span>
                      )}
                    </div>

                    {/* Image & Title */}
                    <div className="col-span-8 sm:col-span-9 flex items-center gap-3 min-w-0 pr-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900">
                        <img
                          src={track.image}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`font-bold text-xs sm:text-sm truncate transition-colors ${
                            isCurrent ? 'text-cyan-400' : 'group-hover:text-cyan-400'
                          }`}
                        >
                          {track.title}
                        </h4>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="col-span-3 sm:col-span-2 text-right font-mono text-xs opacity-75">
                      {track.durationFormatted}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLyricsTrack(track);
                      }}
                      className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                      title="Lyrics"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmbedTrack(track);
                      }}
                      className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                      title="Watch Video"
                    >
                      <Tv className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareTrack(track);
                      }}
                      className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="py-20 text-center rounded-2xl border border-dashed border-white/15 my-6">
          <Music className="w-10 h-10 mx-auto text-cyan-400/50 mb-3" />
          <p className="font-bold text-base">No tracks found matching "{searchQuery}"</p>
          <p className="text-xs opacity-60 mt-1">Try clearing your search query or selecting "All Tracks"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('all');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Modals */}
      <SunoLyricsModal
        track={lyricsTrack}
        onClose={() => setLyricsTrack(null)}
        isDarkMode={isDarkMode}
        onPlayTrack={(t) => onPlayTrack(t)}
        isPlaying={isPlaying}
        isCurrentTrack={currentTrack?.id === lyricsTrack?.id}
      />

      <SunoEmbedModal
        track={embedTrack}
        onClose={() => setEmbedTrack(null)}
        isDarkMode={isDarkMode}
      />

      <SunoShareModal
        track={shareTrack}
        isOpen={Boolean(shareTrack || shareTrack === null && false)} // handles both
        onClose={() => setShareTrack(null)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
