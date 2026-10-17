import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp,
  Maximize2,
  ListMusic,
  Disc,
  Sparkles,
  FileText,
  X
} from 'lucide-react';
import { Track } from '../types';

interface AudioPlayerProps {
  currentTrack: Track | null;
  playlist: Track[];
  onTrackChange: (track: Track) => void;
  onOpenShare: (track: Track) => void;
  onOpenLyrics?: (track: Track) => void;
  isDarkMode: boolean;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  allPlaylists?: {
    youtube: Track[];
    suno: Track[];
  };
  onSwitchPlaylist?: (playlistType: 'youtube' | 'suno') => void;
  currentPlaylistType?: 'youtube' | 'suno';
  disableInternalPlayback?: boolean;
  onVolumeChange?: (volume: number, isMuted: boolean) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  playlist,
  onTrackChange,
  onOpenShare,
  onOpenLyrics,
  isDarkMode,
  isPlaying,
  setIsPlaying,
  allPlaylists,
  onSwitchPlaylist,
  currentPlaylistType = 'youtube',
  disableInternalPlayback = false,
  onVolumeChange,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false);
  const [queueTab, setQueueTab] = useState<'current' | 'youtube' | 'suno'>('current');

  const displayedQueueTracks = useMemo(() => {
    if (queueTab === 'youtube' && allPlaylists?.youtube) {
      return allPlaylists.youtube;
    }
    if (queueTab === 'suno' && allPlaylists?.suno) {
      return allPlaylists.suno;
    }
    return playlist;
  }, [queueTab, allPlaylists, playlist]);
  const [isExpandedMobile, setIsExpandedMobile] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<any>(null);
  const setupTimeoutRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const isReadyRef = useRef<boolean>(false);
  const pendingTrackIdRef = useRef<string | null>(null);
  const containerId = 'youtube-player-container';

  // Check if current track is a Suno AI track (plays through HTML5 audio stream or MP4 video)
  const isSunoTrack = Boolean(currentTrack?.audioUrl || currentTrack?.isSuno);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Next Track
  const handleNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      onTrackChange(playlist[randomIndex]);
      return;
    }
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    onTrackChange(playlist[nextIndex]);
  }, [currentTrack, playlist, isShuffle, onTrackChange]);

  // Previous Track
  const handlePrevious = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    if (currentTime > 4) {
      if (isSunoTrack && audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        return;
      }
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        try {
          playerRef.current.seekTo(0, true);
          setCurrentTime(0);
          return;
        } catch (err) {
          // fallback
        }
      }
    }
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    onTrackChange(playlist[prevIndex]);
  }, [currentTrack, playlist, currentTime, isSunoTrack, onTrackChange]);

  // Handle Suno Track Audio loading & synchronization
  useEffect(() => {
    if (!currentTrack) return;

    if (disableInternalPlayback) {
      if (audioRef.current) audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
      return;
    }

    if (isSunoTrack) {
      // Pause YouTube player if running
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {
          // ignore
        }
      }

      const audioSrc = currentTrack.audioUrl || currentTrack.videoUrl || '';
      if (audioRef.current) {
        audioRef.current.src = audioSrc ? encodeURI(audioSrc) : '';
        audioRef.current.volume = isMuted ? 0 : (volume || 80) / 100;
        audioRef.current.muted = isMuted;
        audioRef.current.load();
        setCurrentTime(0);
        setDuration(currentTrack.durationSeconds || 180);
        if (isPlaying) {
          audioRef.current.play().catch((err) => {
            console.warn('Audio auto-play notice:', err);
          });
        }
      }

      if (videoRef.current) {
        videoRef.current.volume = isMuted ? 0 : (volume || 80) / 100;
        videoRef.current.muted = isMuted;
        if (isPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
      return;
    }

    // If it's a YouTube track, pause HTML5 audio and video
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentTrack?.id, isSunoTrack]);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const existingTag = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingTag) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }
  }, []);

  // Initialize or load YouTube video when currentTrack changes (for YouTube tracks only)
  useEffect(() => {
    if (!currentTrack || isSunoTrack || disableInternalPlayback) return;

    // If player is already initialized and ready
    if (playerRef.current && isReadyRef.current) {
      if (typeof playerRef.current.loadVideoById === 'function') {
        try {
          if (isPlaying) {
            playerRef.current.loadVideoById(currentTrack.id);
          } else {
            if (typeof playerRef.current.cueVideoById === 'function') {
              playerRef.current.cueVideoById(currentTrack.id);
            } else {
              playerRef.current.loadVideoById(currentTrack.id);
            }
          }
        } catch (err) {
          console.warn('Error loading video by ID:', err);
        }
      }
      return;
    }

    // Otherwise queue this track as pending and initialize player
    pendingTrackIdRef.current = currentTrack.id;

    if (setupTimeoutRef.current) {
      clearTimeout(setupTimeoutRef.current);
      setupTimeoutRef.current = null;
    }

    let retryCount = 0;
    const maxRetries = 50; // up to 5 seconds

    const setupPlayer = () => {
      const containerElem = ytContainerRef.current || document.getElementById(containerId);
      if (!containerElem) {
        if (retryCount++ < maxRetries) {
          setupTimeoutRef.current = setTimeout(setupPlayer, 100);
        }
        return;
      }

      if (!window.YT || !window.YT.Player) {
        if (retryCount++ < maxRetries) {
          setupTimeoutRef.current = setTimeout(setupPlayer, 100);
        }
        return;
      }

      if (!playerRef.current) {
        try {
          // Prepare clean inner slot so YouTube API replaces only the inner slot and not our ref container
          containerElem.innerHTML = '';
          const innerSlot = document.createElement('div');
          innerSlot.style.width = '100%';
          innerSlot.style.height = '100%';
          containerElem.appendChild(innerSlot);

          const safeOrigin = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
            ? window.location.origin
            : undefined;

          playerRef.current = new window.YT.Player(innerSlot, {
            height: '100%',
            width: '100%',
            videoId: currentTrack.id,
            playerVars: {
              autoplay: isPlaying ? 1 : 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
              enablejsapi: 1,
              ...(safeOrigin ? { origin: safeOrigin } : {}),
            },
            events: {
              onReady: (event: any) => {
                isReadyRef.current = true;
                if (typeof event.target?.setVolume === 'function') {
                  try {
                    event.target.setVolume(volume);
                  } catch (e) {}
                }
                // Check if another track was requested while player was initializing
                if (pendingTrackIdRef.current && pendingTrackIdRef.current !== currentTrack.id) {
                  const targetId = pendingTrackIdRef.current;
                  pendingTrackIdRef.current = null;
                  if (typeof event.target?.loadVideoById === 'function') {
                    try {
                      event.target.loadVideoById(targetId);
                      setIsPlaying(true);
                    } catch (e) {}
                  }
                } else if (isPlaying) {
                  if (typeof event.target?.playVideo === 'function') {
                    try {
                      event.target.playVideo();
                    } catch (e) {}
                  }
                }
              },
              onStateChange: (event: any) => {
                // 1 = playing, 2 = paused, 0 = ended
                if (event.data === 1) {
                  setIsPlaying(true);
                  if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
                    try {
                      const dur = playerRef.current.getDuration();
                      if (dur && dur > 0) setDuration(dur);
                    } catch (e) {}
                  }
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  if (isRepeat) {
                    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                      try {
                        playerRef.current.seekTo(0);
                      } catch (e) {}
                    }
                    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                      try {
                        playerRef.current.playVideo();
                      } catch (e) {}
                    }
                  } else {
                    handleNext();
                  }
                }
              },
              onError: (err: any) => {
                console.warn('YouTube Player event notice:', err);
              },
            },
          });
        } catch (e) {
          console.warn('Error instantiating YT.Player:', e);
        }
      }
    };

    setupPlayer();

    return () => {
      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
        setupTimeoutRef.current = null;
      }
    };
  }, [currentTrack?.id, isSunoTrack]);

  // Sync playback state when isPlaying prop changes from parent
  useEffect(() => {
    if (disableInternalPlayback) {
      if (audioRef.current) audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
      return;
    }

    if (isSunoTrack) {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Audio play notice:', err);
        });
      } else {
        audioRef.current.pause();
      }
      return;
    }

    if (!isReadyRef.current || !playerRef.current) return;
    try {
      if (isPlaying && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      } else if (!isPlaying && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.warn('Error syncing playback state:', e);
    }
  }, [isPlaying, isSunoTrack, disableInternalPlayback]);

  // Track progress polling & fallback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (isSunoTrack) {
          if (videoRef.current && !videoRef.current.paused) {
            const curr = videoRef.current.currentTime;
            if (curr !== undefined && !isNaN(curr)) setCurrentTime(curr);
            const dur = videoRef.current.duration;
            if (dur && !isNaN(dur) && dur > 0) setDuration(dur);
          } else if (audioRef.current && !audioRef.current.paused) {
            const curr = audioRef.current.currentTime;
            if (curr !== undefined && !isNaN(curr)) setCurrentTime(curr);
            const dur = audioRef.current.duration;
            if (dur && !isNaN(dur) && dur > 0) setDuration(dur);
          } else {
            // Smooth simulated fallback if audio stream is restricted
            setCurrentTime((prev) => {
              const maxDur = duration || currentTrack?.durationSeconds || 180;
              if (prev >= maxDur) {
                handleNext();
                return 0;
              }
              return prev + 1;
            });
          }
          return;
        }

        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const curr = playerRef.current.getCurrentTime();
            if (curr !== undefined && !isNaN(curr)) setCurrentTime(curr);
            if (typeof playerRef.current.getDuration === 'function') {
              const dur = playerRef.current.getDuration();
              if (dur && dur > 0) setDuration(dur);
            }
          } catch (e) {
            // ignore polling error
          }
        }
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isSunoTrack, duration, currentTrack?.durationSeconds, handleNext]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
      playerRef.current = null;
      isReadyRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  // Next Track in playlist (sequential navigation)
  const goToNextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    if (!currentTrack) {
      onTrackChange(playlist[0]);
      return;
    }
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = currentIndex === -1 || currentIndex >= playlist.length - 1 ? 0 : currentIndex + 1;
    onTrackChange(playlist[nextIndex]);
  }, [currentTrack, playlist, onTrackChange]);

  // Previous Track in playlist (sequential navigation)
  const goToPreviousTrack = useCallback(() => {
    if (playlist.length === 0) return;
    if (!currentTrack) {
      onTrackChange(playlist[playlist.length - 1]);
      return;
    }
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    onTrackChange(playlist[prevIndex]);
  }, [currentTrack, playlist, onTrackChange]);

  // Toggle Play / Pause
  const togglePlayPause = useCallback(() => {
    if (!currentTrack && playlist.length > 0) {
      onTrackChange(playlist[0]);
      return;
    }

    if (disableInternalPlayback) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isSunoTrack) {
      if (!audioRef.current) {
        setIsPlaying(!isPlaying);
        return;
      }
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((err) => {
          console.warn('Audio play error:', err);
        });
        setIsPlaying(true);
      }
      return;
    }

    if (!playerRef.current || !isReadyRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }
    try {
      if (isPlaying) {
        if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
        setIsPlaying(false);
      } else {
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Error toggling playback:', e);
      setIsPlaying(!isPlaying);
    }
  }, [currentTrack, playlist, isSunoTrack, isPlaying, setIsPlaying, onTrackChange]);

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (isSunoTrack) {
      if (audioRef.current) audioRef.current.currentTime = targetTime;
      if (videoRef.current) videoRef.current.currentTime = targetTime;
      return;
    }
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(targetTime, true);
      } catch (err) {
        console.warn('Error seeking:', err);
      }
    }
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (isSunoTrack) {
      if (audioRef.current) audioRef.current.volume = isMuted ? 0 : newVol / 100;
      if (videoRef.current) videoRef.current.volume = isMuted ? 0 : newVol / 100;
      return;
    }
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(newVol);
        if (newVol === 0) {
          setIsMuted(true);
          if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
        } else if (isMuted) {
          setIsMuted(false);
          if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
        }
      } catch (err) {
        console.warn('Error setting volume:', err);
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isSunoTrack) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      if (audioRef.current) audioRef.current.muted = nextMuted;
      if (videoRef.current) videoRef.current.muted = nextMuted;
      return;
    }
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
        setIsMuted(false);
        if (typeof playerRef.current.setVolume === 'function') playerRef.current.setVolume(volume || 50);
      } else {
        if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.warn('Error toggling mute:', err);
    }
  };

  const togglePlayPauseRef = useRef(togglePlayPause);
  togglePlayPauseRef.current = togglePlayPause;

  const goToNextTrackRef = useRef(goToNextTrack);
  goToNextTrackRef.current = goToNextTrack;

  const goToPreviousTrackRef = useRef(goToPreviousTrack);
  goToPreviousTrackRef.current = goToPreviousTrack;

  // Global Keyboard Event Listener: Spacebar for play/pause, Arrow keys for prev/next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if browser modifier keys (Cmd, Ctrl, Alt) are pressed
      if (e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      // Check if user is typing inside an editable field, input, or textarea
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName ? target.tagName.toUpperCase() : '';
        const isEditable = target.isContentEditable;
        const isInput = tagName === 'INPUT';
        const inputType = isInput ? (target as HTMLInputElement).type.toLowerCase() : '';

        // If typing in search input, text input, textarea, select, or contenteditable
        if (
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          isEditable ||
          (isInput && !['range', 'button', 'checkbox', 'radio'].includes(inputType))
        ) {
          return;
        }

        // On range sliders (seeker progress bar or volume slider), allow spacebar to play/pause,
        // but let arrow keys adjust the slider value normally
        if (isInput && inputType === 'range') {
          if (
            e.key === 'ArrowLeft' ||
            e.key === 'ArrowRight' ||
            e.key === 'ArrowUp' ||
            e.key === 'ArrowDown' ||
            e.code === 'ArrowLeft' ||
            e.code === 'ArrowRight' ||
            e.code === 'ArrowUp' ||
            e.code === 'ArrowDown'
          ) {
            return;
          }
        }
      }

      // Spacebar: Play / Pause
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar') {
        e.preventDefault();
        togglePlayPauseRef.current();
        return;
      }

      // Left Arrow / Up Arrow: Navigate to Previous Track in Playlist
      if (
        e.key === 'ArrowLeft' ||
        e.code === 'ArrowLeft' ||
        e.key === 'Left' ||
        e.key === 'ArrowUp' ||
        e.code === 'ArrowUp' ||
        e.key === 'Up'
      ) {
        e.preventDefault();
        goToPreviousTrackRef.current();
        return;
      }

      // Right Arrow / Down Arrow: Navigate to Next Track in Playlist
      if (
        e.key === 'ArrowRight' ||
        e.code === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowDown' ||
        e.code === 'ArrowDown' ||
        e.key === 'Down'
      ) {
        e.preventDefault();
        goToNextTrackRef.current();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!currentTrack) return null;

  const currentDuration = duration || currentTrack.durationSeconds || 180;
  const progressPercent = currentDuration > 0 ? (currentTime / currentDuration) * 100 : 0;

  const videoViewportContent = (
    <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden rounded-2xl">
      {isSunoTrack ? (
        currentTrack.videoUrl ? (
          <video
            ref={videoRef}
            src={encodeURI(currentTrack.videoUrl)}
            controls
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-contain bg-black"
            onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime;
              if (!isNaN(t)) setCurrentTime(t);
            }}
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              if (d && !isNaN(d) && d > 0) setDuration(d);
            }}
            onEnded={() => {
              if (isRepeat) {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(() => {});
                }
              } else {
                handleNext();
              }
            }}
          />
        ) : (
          <iframe
            src={encodeURI(currentTrack.embedUrl || currentTrack.youtubeUrl || '')}
            title={`Suno Embed - ${currentTrack.title}`}
            className="w-full h-full border-0"
            allow="autoplay"
          />
        )
      ) : null}
      <div
        ref={ytContainerRef}
        id={containerId}
        className={`w-full h-full min-h-[220px] ${isSunoTrack ? 'hidden' : ''}`}
      />
    </div>
  );

  return (
    <>
      {/* Floating Video Modal for mobile or when user explicitly opens modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300 ${
          showVideoModal
            ? 'opacity-100 pointer-events-auto visible'
            : 'opacity-0 pointer-events-none invisible'
        }`}
        onClick={() => setShowVideoModal(false)}
      >
        <div
          className={`relative w-full ${
            isSunoTrack ? 'max-w-sm sm:max-w-[380px] aspect-[9/16] max-h-[90vh]' : 'max-w-3xl aspect-video'
          } bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col transition-all duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 bg-neutral-950/90 border-b border-white/10 flex items-center justify-between text-xs">
            <span className="font-bold text-white truncate max-w-[80%]">
              {currentTrack.title} — {currentTrack.artist}
            </span>
            <button
              onClick={() => setShowVideoModal(false)}
              className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-colors"
            >
              Close Video Mode
            </button>
          </div>
          <div className="flex-1 w-full h-full relative">
            {videoViewportContent}
          </div>
        </div>
      </div>

      {/* HTML5 Audio Element for Suno stream playback */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onError={() => {
          if (audioRef.current && currentTrack?.videoUrl && audioRef.current.src !== currentTrack.videoUrl) {
            audioRef.current.src = currentTrack.videoUrl;
            audioRef.current.load();
            if (isPlaying) audioRef.current.play().catch(() => {});
          }
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (!isNaN(t)) setCurrentTime(t);
        }}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (d && !isNaN(d) && d > 0) setDuration(d);
        }}
        onEnded={() => {
          if (isRepeat) {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
          } else {
            handleNext();
          }
        }}
        preload="auto"
      />

      {/* Floating Bottom Audio Player */}
      <div
        id="persistent-audio-player"
        className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          isDarkMode
            ? 'bg-black/95 border-white/10 text-white'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Scrubber Progress Bar at the Very Top of Player */}
        <div className="relative w-full h-1.5 group cursor-pointer bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all pointer-events-none relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg shadow-cyan-500/50 scale-0 group-hover:scale-100 transition-transform" />
          </div>
          <input
            id="audio-progress-bar"
            type="range"
            min="0"
            max={currentDuration}
            step="1"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Seek track"
          />
        </div>

        {/* Player Bar Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <div className="flex items-center justify-between gap-4 sm:gap-8">
            {/* Left: Track Info & Thumbnail */}
            <div className="flex items-center gap-3.5 min-w-0 max-w-[40%] sm:max-w-[28%]">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md bg-black">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 bg-cyan-400 animate-eq-1" />
                      <span className="w-0.5 bg-cyan-300 animate-eq-2" />
                      <span className="w-0.5 bg-purple-400 animate-eq-3" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold truncate leading-tight hover:text-cyan-400 transition-colors">
                  {currentTrack.title}
                </h4>
                <p className={`text-[11px] sm:text-xs truncate ${isDarkMode ? 'text-white/50' : 'text-neutral-500'}`}>
                  {currentTrack.artist} • <span className="font-mono text-cyan-400">#{currentTrack.index.toString().padStart(2, '0')}</span>
                </p>
              </div>
            </div>

            {/* Center: Playback Controls & Scrubber Times */}
            <div className="flex flex-col items-center justify-center gap-1.5 flex-1 max-w-md">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Shuffle */}
                <button
                  id="player-shuffle-btn"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                    isShuffle
                      ? 'text-cyan-400 font-bold'
                      : isDarkMode
                      ? 'text-white/40 hover:text-white'
                      : 'text-neutral-400 hover:text-black'
                  }`}
                  title={isShuffle ? 'Shuffle Active' : 'Enable Shuffle'}
                  aria-label="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Previous */}
                <button
                  id="player-prev-btn"
                  onClick={goToPreviousTrack}
                  className={`p-1.5 rounded-full transition-colors opacity-70 hover:opacity-100 ${
                    isDarkMode ? 'text-white hover:text-cyan-400' : 'text-neutral-700 hover:text-black'
                  }`}
                  title="Previous Track (←)"
                  aria-label="Previous Track"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                {/* High Contrast Circular Play / Pause Toggle matching Immersive UI */}
                <button
                  id="player-play-pause-btn"
                  onClick={togglePlayPause}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-black hover:bg-cyan-300 flex items-center justify-center font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  id="player-next-btn"
                  onClick={goToNextTrack}
                  className={`p-1.5 rounded-full transition-colors opacity-70 hover:opacity-100 ${
                    isDarkMode ? 'text-white hover:text-cyan-400' : 'text-neutral-700 hover:text-black'
                  }`}
                  title="Next Track (→)"
                  aria-label="Next Track"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                {/* Repeat */}
                <button
                  id="player-repeat-btn"
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-1.5 rounded-full transition-colors hidden sm:block ${
                    isRepeat
                      ? 'text-cyan-400 font-bold'
                      : isDarkMode
                      ? 'text-white/40 hover:text-white'
                      : 'text-neutral-400 hover:text-black'
                  }`}
                  title={isRepeat ? 'Repeat Active' : 'Enable Repeat'}
                  aria-label="Repeat"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Time display & keyboard shortcuts hint */}
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold">
                <span className="text-cyan-400">{formatTime(currentTime)}</span>
                <span className="text-white/30">/</span>
                <span className={isDarkMode ? 'text-white/40' : 'text-neutral-400'}>{formatTime(currentDuration)}</span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-white/40 font-normal ml-2">
                  <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/70 border border-white/10 text-[9px] font-mono">
                    Space
                  </kbd>
                  <span>Play</span>
                  <span className="text-white/20">•</span>
                  <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/70 border border-white/10 text-[9px] font-mono">
                    ←
                  </kbd>
                  <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/70 border border-white/10 text-[9px] font-mono">
                    →
                  </kbd>
                  <span>Tracks</span>
                </span>
              </div>
            </div>

            {/* Right: Volume, Share, & Video popup */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Volume Slider matching Immersive UI VOL label */}
              <div className="hidden md:flex items-center gap-2.5 w-36 lg:w-48">
                <span className={`text-[10px] font-bold tracking-wider ${isDarkMode ? 'text-white/40' : 'text-neutral-400'}`}>
                  VOL
                </span>
                <button
                  onClick={toggleMute}
                  className={`p-1 rounded-md transition-colors ${
                    isDarkMode ? 'text-white/60 hover:text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <div className="flex-1 flex items-center">
                  <input
                    id="player-volume-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-400"
                    aria-label="Volume slider"
                  />
                </div>
              </div>

              {/* Playlist / Queue Drawer Toggle */}
              <button
                id="player-queue-modal-btn"
                onClick={() => setShowQueueModal(!showQueueModal)}
                className={`p-2 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  showQueueModal
                    ? 'bg-cyan-500 border-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/25'
                    : isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:bg-white/10'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                }`}
                title="Playlist Queue & Up Next"
                aria-label="Toggle Playlist Queue"
              >
                <ListMusic className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Queue</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-mono">
                  {displayedQueueTracks.length}
                </span>
              </button>

              {/* Watch Video Mode Button */}
              <button
                id="player-video-modal-btn"
                onClick={() => setShowVideoModal(!showVideoModal)}
                className={`p-2 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  showVideoModal
                    ? 'bg-cyan-500 border-cyan-400 text-black font-bold'
                    : isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:bg-white/10'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                }`}
                title="Open Video View"
                aria-label="Toggle Video Mode"
              >
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline text-[11px] uppercase tracking-wider">Video</span>
              </button>

              {/* View Lyrics Button */}
              {onOpenLyrics && (
                <button
                  id="player-lyrics-btn"
                  onClick={() => onOpenLyrics(currentTrack)}
                  className={`p-2 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:bg-white/10'
                      : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  title="View Full Lyrics"
                  aria-label="View Full Song Lyrics"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline text-[11px] uppercase tracking-wider">Lyrics</span>
                </button>
              )}

              {/* Quick Share Current Playing Track */}
              <button
                id="player-share-current-btn"
                onClick={() => onOpenShare(currentTrack)}
                className={`p-2 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-cyan-400 hover:bg-white/10'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-black hover:bg-neutral-200'
                }`}
                title="Share Song"
                aria-label="Share current song"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Playlist Queue Drawer / Modal */}
      {showQueueModal && (
        <div
          id="player-queue-drawer"
          className={`fixed bottom-24 sm:bottom-28 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-96 md:w-[420px] max-h-[70vh] z-50 rounded-2xl border shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden transition-all ${
            isDarkMode
              ? 'bg-neutral-950/95 border-white/15 text-white shadow-cyan-950/40'
              : 'bg-white/95 border-neutral-200 text-neutral-900 shadow-xl'
          }`}
        >
          {/* Queue Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm tracking-wide">Playlist Queue</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold">
                {displayedQueueTracks.length} Songs
              </span>
            </div>
            <button
              onClick={() => setShowQueueModal(false)}
              className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
                isDarkMode ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              aria-label="Close Queue"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Playlist Selection Tabs in Queue */}
          <div className="p-2 border-b border-white/10 flex items-center gap-1.5 bg-black/20 text-xs">
            <button
              onClick={() => setQueueTab('current')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition-all ${
                queueTab === 'current'
                  ? 'bg-cyan-500 text-black font-bold shadow-sm'
                  : isDarkMode
                  ? 'text-white/70 hover:bg-white/5'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Current ({playlist.length})
            </button>
            {allPlaylists?.youtube && (
              <button
                onClick={() => {
                  setQueueTab('youtube');
                  if (onSwitchPlaylist) onSwitchPlaylist('youtube');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                  queueTab === 'youtube'
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : isDarkMode
                    ? 'text-white/70 hover:bg-white/5'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Disc className="w-3 h-3 text-red-500" />
                <span>YouTube ({allPlaylists.youtube.length})</span>
              </button>
            )}
            {allPlaylists?.suno && (
              <button
                onClick={() => {
                  setQueueTab('suno');
                  if (onSwitchPlaylist) onSwitchPlaylist('suno');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                  queueTab === 'suno'
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : isDarkMode
                    ? 'text-white/70 hover:bg-white/5'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Suno ({allPlaylists.suno.length})</span>
              </button>
            )}
          </div>

          {/* Track List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[50vh] divide-y divide-white/5">
            {displayedQueueTracks.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={`${track.id}-${i}`}
                  onClick={() => {
                    onTrackChange(track);
                    setIsPlaying(true);
                  }}
                  className={`p-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isCurrent
                      ? isDarkMode
                        ? 'bg-cyan-500/20 border border-cyan-400/40 text-white shadow-sm'
                        : 'bg-cyan-50 border border-cyan-300 text-cyan-950 font-medium'
                      : isDarkMode
                      ? 'hover:bg-white/5 text-white/80 hover:text-white'
                      : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[10px] opacity-40 w-4 text-center shrink-0">
                      {isCurrent ? (
                        <span className="text-cyan-400 font-bold">▶</span>
                      ) : (
                        (track.index || i + 1).toString().padStart(2, '0')
                      )}
                    </span>
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-neutral-900">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {track.title}
                      </p>
                      <p className={`text-[10px] truncate ${isDarkMode ? 'text-white/50' : 'text-neutral-500'}`}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCurrent && isPlaying && (
                      <div className="flex items-end gap-0.5 h-2.5">
                        <span className="w-0.5 bg-cyan-400 animate-eq-1" />
                        <span className="w-0.5 bg-cyan-300 animate-eq-2" />
                        <span className="w-0.5 bg-purple-400 animate-eq-3" />
                      </div>
                    )}
                    <span className="font-mono text-[10px] opacity-60">
                      {track.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </>
  );
};
