import React, { useRef, useEffect } from 'react';
import { Track, SunoTrack } from '../types';
import { Tv, Sparkles } from 'lucide-react';

interface ShowcaseVideoPlayerProps {
  track: Track | SunoTrack;
  isPlaying: boolean;
  onPlay: (track: any) => void;
  onPause: () => void;
  onEnded?: () => void;
  isDarkMode: boolean;
  volume?: number;
  isMuted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  seekTarget?: number | null;
  onSeekHandled?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const ShowcaseVideoPlayer: React.FC<ShowcaseVideoPlayerProps> = ({
  track,
  isPlaying,
  onPlay,
  onPause,
  onEnded,
  isDarkMode: _isDarkMode,
  volume = 80,
  isMuted = false,
  size = 'sm',
  onTimeUpdate,
  seekTarget,
  onSeekHandled,
}) => {
  const isSuno = Boolean('isSuno' in track ? track.isSuno : track.audioUrl || track.videoUrl);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const pendingTrackIdRef = useRef<string | null>(null);
  const pendingPlayRef = useRef<boolean>(false);

  // Sync refs to avoid stale closures in YouTube event listeners
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const trackIdRef = useRef(track.id);
  trackIdRef.current = track.id;
  const trackRef = useRef(track);
  trackRef.current = track;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const onPlayRef = useRef(onPlay);
  onPlayRef.current = onPlay;
  const onPauseRef = useRef(onPause);
  onPauseRef.current = onPause;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  // Helper to trigger playback safely on YouTube player
  const playCurrentYouTubeTrack = (trackId: string) => {
    if (!ytPlayerRef.current || !isYtReadyRef.current) {
      pendingPlayRef.current = true;
      pendingTrackIdRef.current = trackId;
      return;
    }
    try {
      if (typeof ytPlayerRef.current.loadVideoById === 'function') {
        ytPlayerRef.current.loadVideoById(trackId);
      }
      if (typeof ytPlayerRef.current.playVideo === 'function') {
        ytPlayerRef.current.playVideo();
      }
    } catch (err) {
      console.warn('Error playing YouTube track:', err);
    }
  };

  const pauseCurrentYouTubeTrack = () => {
    pendingPlayRef.current = false;
    if (!ytPlayerRef.current || !isYtReadyRef.current) return;
    try {
      if (typeof ytPlayerRef.current.pauseVideo === 'function') {
        ytPlayerRef.current.pauseVideo();
      }
    } catch (err) {}
  };

  // Initialize YouTube Player inside Showcase stage
  useEffect(() => {
    if (isSuno) return;

    let retryCount = 0;
    let timer: any = null;

    const setupYT = () => {
      if (!window.YT || !window.YT.Player) {
        if (retryCount++ < 60) {
          timer = setTimeout(setupYT, 100);
        }
        return;
      }

      const container = ytContainerRef.current;
      if (!container) return;

      // Clean existing inner content before instantiating
      container.innerHTML = '';
      const slot = document.createElement('div');
      slot.id = 'yt-showcase-player-slot';
      slot.style.width = '100%';
      slot.style.height = '100%';
      container.appendChild(slot);

      const safeOrigin =
        typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
          ? window.location.origin
          : undefined;

      try {
        ytPlayerRef.current = new window.YT.Player(slot, {
          height: '100%',
          width: '100%',
          videoId: track.id,
          playerVars: {
            autoplay: isPlayingRef.current ? 1 : 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            ...(safeOrigin ? { origin: safeOrigin } : {}),
          },
          events: {
            onReady: (event: any) => {
              isYtReadyRef.current = true;
              try {
                if (isMutedRef.current) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                  event.target.setVolume(volumeRef.current);
                }

                const targetId = pendingTrackIdRef.current || trackIdRef.current;
                pendingTrackIdRef.current = null;

                if (isPlayingRef.current || pendingPlayRef.current) {
                  pendingPlayRef.current = false;
                  if (typeof event.target.loadVideoById === 'function') {
                    event.target.loadVideoById(targetId);
                  }
                  if (typeof event.target.playVideo === 'function') {
                    event.target.playVideo();
                  }
                } else {
                  if (typeof event.target.cueVideoById === 'function') {
                    event.target.cueVideoById(targetId);
                  }
                }
              } catch (err) {
                console.warn('onReady setup notice:', err);
              }
            },
            onStateChange: (event: any) => {
              // 1 = playing, 2 = paused, 0 = ended
              if (event.data === 1) {
                onPlayRef.current(trackRef.current);
                if (typeof event.target?.getDuration === 'function') {
                  const d = event.target.getDuration();
                  const c = event.target.getCurrentTime ? event.target.getCurrentTime() : 0;
                  if (d && d > 0) {
                    onTimeUpdateRef.current?.(c, d);
                  }
                }
              } else if (event.data === 2) {
                onPauseRef.current();
              } else if (event.data === 0) {
                onEndedRef.current?.();
              }
            },
            onError: (err: any) => {
              console.warn('YouTube player showcase event notice:', err);
            },
          },
        });
      } catch (e) {
        console.warn('Error setting up YouTube showcase player:', e);
      }
    };

    if (window.YT && window.YT.Player) {
      setupYT();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        setupYT();
      };
      setupYT();
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
      }
      ytPlayerRef.current = null;
      isYtReadyRef.current = false;
    };
  }, [isSuno]);

  // Load new YouTube video when track.id changes
  useEffect(() => {
    if (isSuno) return;

    if (isPlaying) {
      playCurrentYouTubeTrack(track.id);
    } else {
      if (ytPlayerRef.current && isYtReadyRef.current && typeof ytPlayerRef.current.cueVideoById === 'function') {
        try {
          ytPlayerRef.current.cueVideoById(track.id);
        } catch (err) {}
      } else {
        pendingTrackIdRef.current = track.id;
      }
    }
  }, [track.id, isSuno]);

  // Play / Pause sync for YouTube
  useEffect(() => {
    if (isSuno) return;

    if (isPlaying) {
      playCurrentYouTubeTrack(track.id);
    } else {
      pauseCurrentYouTubeTrack();
    }
  }, [isPlaying, isSuno]);

  // Volume & Mute sync for YouTube
  useEffect(() => {
    if (isSuno) return;

    if (ytPlayerRef.current && isYtReadyRef.current) {
      try {
        if (isMuted && typeof ytPlayerRef.current.mute === 'function') {
          ytPlayerRef.current.mute();
        } else if (!isMuted && typeof ytPlayerRef.current.unMute === 'function') {
          ytPlayerRef.current.unMute();
          if (typeof ytPlayerRef.current.setVolume === 'function') {
            ytPlayerRef.current.setVolume(volume);
          }
        }
      } catch (err) {}
    }
  }, [volume, isMuted, isSuno]);

  // Periodic polling for YouTube playback progress to sync bottom scrubber
  useEffect(() => {
    if (isSuno) return;

    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (
          ytPlayerRef.current &&
          isYtReadyRef.current &&
          typeof ytPlayerRef.current.getCurrentTime === 'function'
        ) {
          try {
            const curr = ytPlayerRef.current.getCurrentTime();
            const dur = typeof ytPlayerRef.current.getDuration === 'function' ? ytPlayerRef.current.getDuration() : 0;
            if (curr !== undefined && !isNaN(curr)) {
              onTimeUpdateRef.current?.(curr, dur || 0);
            }
          } catch (e) {}
        }
      }, 250);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSuno, isPlaying]);

  // Suno video play/pause sync
  useEffect(() => {
    if (isSuno && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.warn('Suno video autoplay notice:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isSuno, track.id]);

  // Suno video volume & mute sync
  useEffect(() => {
    if (isSuno && videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, isSuno]);

  // Handle Seek Target from Bottom Player Scrubber
  useEffect(() => {
    if (seekTarget === null || seekTarget === undefined) return;

    if (isSuno) {
      if (videoRef.current) {
        videoRef.current.currentTime = seekTarget;
        onSeekHandled?.();
      }
    } else {
      if (
        ytPlayerRef.current &&
        isYtReadyRef.current &&
        typeof ytPlayerRef.current.seekTo === 'function'
      ) {
        try {
          ytPlayerRef.current.seekTo(seekTarget, true);
          onSeekHandled?.();
        } catch (e) {}
      }
    }
  }, [seekTarget, isSuno, onSeekHandled]);

  const thumbnail = 'thumbnail' in track ? track.thumbnail : track.image;
  const sunoVideoSrc =
    'videoUrl' in track && track.videoUrl
      ? track.videoUrl
      : 'audioUrl' in track && track.audioUrl
      ? track.audioUrl
      : `https://cdn1.suno.ai/${track.id}.mp4`;

  const sunoMaxWidth =
    size === 'sm'
      ? 'max-w-[270px]'
      : size === 'md'
      ? 'max-w-[320px]'
      : 'max-w-[370px]';

  return (
    <div
      className={`relative w-full ${
        isSuno ? `aspect-[9/16] ${sunoMaxWidth} mx-auto` : 'aspect-video'
      } rounded-2xl overflow-hidden border border-white/20 bg-black shadow-2xl group transition-all duration-300`}
    >
      {isSuno ? (
        /* Suno AI Video Player (9:16 aspect ratio) */
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            key={`suno-video-${track.id}`}
            src={sunoVideoSrc}
            poster={thumbnail}
            controls
            autoPlay={isPlaying}
            playsInline
            preload="auto"
            className="w-full h-full object-cover bg-black"
            onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime;
              const d = e.currentTarget.duration;
              if (!isNaN(t)) {
                onTimeUpdateRef.current?.(t, isNaN(d) ? 0 : d);
              }
            }}
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              if (d && !isNaN(d)) {
                onTimeUpdateRef.current?.(0, d);
              }
            }}
            onPlay={() => {
              if (!isPlaying) onPlay(track);
            }}
            onPause={() => {
              if (isPlaying) onPause();
            }}
            onEnded={() => {
              if (onEnded) onEnded();
            }}
            onError={(e) => {
              console.warn('Suno video playback error:', e);
            }}
          />

          {/* Top subtle badge indicating Suno 9:16 Player */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 font-bold pointer-events-none flex items-center gap-1 z-10">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Suno 9:16 Player</span>
          </div>
        </div>
      ) : (
        /* YouTube Music Video Player powered by YouTube IFrame API */
        <div className="relative w-full h-full bg-black">
          <div
            ref={ytContainerRef}
            className="w-full h-full absolute inset-0 bg-black"
          />

          {/* Top Video Indicator Badge */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 font-bold pointer-events-none flex items-center gap-1 z-10">
            <Tv className="w-3 h-3 text-cyan-400" />
            <span>HD Music Video</span>
          </div>
        </div>
      )}
    </div>
  );
};
