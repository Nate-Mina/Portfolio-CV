import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SunoTrack } from '../types';
import { playerManager } from '../services/playerManager';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Share2,
  Tv,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

interface SunoAudioPlayerProps {
  currentTrack: SunoTrack | null;
  playlist: SunoTrack[];
  onTrackChange: (track: SunoTrack) => void;
  onOpenShare: (track: SunoTrack) => void;
  onOpenLyrics: (track: SunoTrack) => void;
  onOpenEmbed: (track: SunoTrack) => void;
  isDarkMode: boolean;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const SunoAudioPlayer: React.FC<SunoAudioPlayerProps> = ({
  currentTrack,
  playlist,
  onTrackChange,
  onOpenShare,
  onOpenLyrics,
  onOpenEmbed,
  isDarkMode,
  isPlaying,
  setIsPlaying,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(currentTrack?.duration || 0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isExpandedMobile, setIsExpandedMobile] = useState<boolean>(false);

  const [isAudioStreamFailed, setIsAudioStreamFailed] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // PlayerManager synchronization to prevent simultaneous audio output with YouTube
  useEffect(() => {
    if (isPlaying) {
      playerManager.setActivePlayer('suno');
    }
  }, [isPlaying]);

  useEffect(() => {
    const unsubscribe = playerManager.subscribe((active) => {
      if (active === 'youtube' && isPlaying) {
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    });
    return unsubscribe;
  }, [isPlaying, setIsPlaying]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Next Track
  const handleNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    if (isShuffle) {
      const remaining = playlist.filter((t) => t.id !== currentTrack.id);
      const nextIndex = Math.floor(Math.random() * (remaining.length || 1));
      onTrackChange(remaining[nextIndex] || playlist[0]);
    } else {
      const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      onTrackChange(playlist[nextIndex]);
    }
  }, [currentTrack, playlist, isShuffle, onTrackChange]);

  // Previous Track
  const handlePrevious = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    if (currentTime > 4 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    onTrackChange(playlist[prevIndex]);
  }, [currentTrack, playlist, currentTime, onTrackChange]);

  // Fallback timer when audio stream fails or for smooth playback simulation
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (isPlaying) {
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const maxDur = duration || currentTrack?.duration || 180;
          if (prev >= maxDur) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying, duration, currentTrack, handleNext]);

  // Handle Track Audio changes
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    const audio = audioRef.current;

    setIsAudioStreamFailed(false);
    const sanitizedAudioUrl = encodeURI(currentTrack.audioUrl || '');
    audio.src = sanitizedAudioUrl;
    audio.load();
    setCurrentTime(0);
    setDuration(currentTrack.duration || 180);

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn('Audio stream playback restricted/blocked, using simulated sync player:', err);
        setIsAudioStreamFailed(true);
      });
    }
  }, [currentTrack?.id, currentTrack?.audioUrl]);

  // Handle Play/Pause sync
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (!isAudioStreamFailed) {
        audioRef.current.play().catch((err) => {
          console.warn('Audio resume failed:', err);
          setIsAudioStreamFailed(true);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isAudioStreamFailed]);

  // Volume sync
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // Toggle Play / Pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  // Volume Slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Audio Events
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      handleNext();
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onError={() => setIsAudioStreamFailed(true)}
        onStalled={() => setIsAudioStreamFailed(true)}
        onCanPlay={() => setIsAudioStreamFailed(false)}
        preload="auto"
      />

      {/* Floating Bottom Audio Player */}
      <div
        id="suno-audio-player-bar"
        className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-all duration-300 ${
          isDarkMode
            ? 'bg-neutral-950/95 border-white/10 text-white shadow-[0_-10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          {/* Scrubber Progress Bar */}
          <div className="w-full flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono opacity-60 w-9 text-right select-none">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 group flex items-center h-4 cursor-pointer">
              <input
                id="suno-player-scrubber"
                type="range"
                min="0"
                max={duration > 0 ? duration : 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
            </div>
            <span className="text-[11px] font-mono opacity-60 w-9 select-none">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Track Info & Thumbnail */}
            <div className="flex items-center gap-3 min-w-0 max-w-[45%] sm:max-w-[30%]">
              <div className="relative flex-shrink-0 group">
                <img
                  src={currentTrack.image}
                  alt={currentTrack.title}
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl object-cover shadow-md border border-white/10"
                  crossOrigin="anonymous"
                />
                <button
                  onClick={() => onOpenEmbed(currentTrack)}
                  className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Watch Video / Embed"
                >
                  <Tv className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm truncate tracking-tight">
                    {currentTrack.title}
                  </span>
                  <span className="hidden md:inline px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    Suno
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] opacity-75 truncate">
                  <span className="truncate">{currentTrack.artist}</span>
                </div>
              </div>
            </div>

            {/* Center: Playback Controls */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Shuffle */}
              <button
                id="suno-player-shuffle-btn"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                  isShuffle ? 'text-cyan-400' : 'opacity-40 hover:opacity-100'
                }`}
                title="Toggle Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous */}
              <button
                id="suno-player-prev-btn"
                onClick={handlePrevious}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Play / Pause */}
              <button
                id="suno-player-play-pause-btn"
                onClick={togglePlayPause}
                className="p-2.5 sm:p-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-400/25 transition-transform active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                id="suno-player-next-btn"
                onClick={handleNext}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Repeat */}
              <button
                id="suno-player-repeat-btn"
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                  isRepeat ? 'text-cyan-400' : 'opacity-40 hover:opacity-100'
                }`}
                title="Repeat Current Track"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Actions & Volume */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Lyrics button */}
              <button
                onClick={() => onOpenLyrics(currentTrack)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                }`}
                title="View Full Lyrics"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Lyrics</span>
              </button>

              {/* Video/Embed Button */}
              <button
                onClick={() => onOpenEmbed(currentTrack)}
                className={`p-2 rounded-lg border transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:border-cyan-400/40'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                }`}
                title="Open Video / Embed Player"
              >
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Video</span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => onOpenShare(currentTrack)}
                className={`p-2 rounded-lg border transition-colors hidden sm:flex ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                }`}
                title="Share track"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* Volume Slider */}
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10">
                <button onClick={toggleMute} className="opacity-70 hover:opacity-100">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                </button>
                <input
                  id="suno-player-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-18 h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Mobile collapse button */}
              <button
                onClick={() => setIsExpandedMobile(!isExpandedMobile)}
                className="p-1.5 rounded-md hover:bg-white/10 sm:hidden"
              >
                {isExpandedMobile ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile expanded drawer */}
          {isExpandedMobile && (
            <div className="mt-3 pt-3 border-t border-white/10 flex sm:hidden items-center justify-around text-xs">
              <button
                onClick={() => onOpenLyrics(currentTrack)}
                className="flex items-center gap-1.5 text-cyan-400 font-medium"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lyrics</span>
              </button>
              <button
                onClick={() => onOpenEmbed(currentTrack)}
                className="flex items-center gap-1.5 text-white/80 font-medium"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Watch Video</span>
              </button>
              <button
                onClick={() => onOpenShare(currentTrack)}
                className="flex items-center gap-1.5 text-white/80 font-medium"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <a
                href={currentTrack.sunoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/60 font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Suno</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
