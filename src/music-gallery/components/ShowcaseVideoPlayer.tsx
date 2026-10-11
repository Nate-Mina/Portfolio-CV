import React, { useRef, useEffect } from 'react';
import { Track, SunoTrack } from '../types';
import { Play, Tv, Sparkles, ExternalLink } from 'lucide-react';

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
}

export const ShowcaseVideoPlayer: React.FC<ShowcaseVideoPlayerProps> = ({
  track,
  isPlaying,
  onPlay,
  onPause,
  onEnded,
  isDarkMode,
  volume = 80,
  isMuted = false,
  size = 'sm',
}) => {
  const isSuno = Boolean('isSuno' in track ? track.isSuno : track.audioUrl || track.videoUrl);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Sync Suno video play/pause with parent isPlaying state
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

  // Sync Suno video volume and mute
  useEffect(() => {
    if (isSuno && videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, isSuno]);

  // Sync YouTube iframe volume and mute
  useEffect(() => {
    if (!isSuno && iframeRef.current && iframeRef.current.contentWindow && isPlaying) {
      try {
        if (isMuted) {
          iframeRef.current.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
        } else {
          iframeRef.current.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }),
            '*'
          );
        }
      } catch (e) {
        // ignore cross-origin postMessage notice
      }
    }
  }, [volume, isMuted, isSuno, isPlaying]);

  const thumbnail = 'thumbnail' in track ? track.thumbnail : track.image;
  const sunoVideoSrc = 'videoUrl' in track && track.videoUrl
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
        /* YouTube Music Video Player */
        <div className="relative w-full h-full bg-black">
          {!isPlaying ? (
            /* Paused State with High-Res Thumbnail & Play Button */
            <div className="relative w-full h-full">
              <img
                src={thumbnail}
                alt={track.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                <button
                  id="showcase-play-video-btn"
                  onClick={() => onPlay(track)}
                  className="w-16 h-16 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ring-4 ring-cyan-400/40 mb-2"
                  aria-label="Play music video"
                  title="Play video"
                >
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                </button>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] font-mono font-bold text-white tracking-wider">
                  <Tv className="w-3 h-3 text-cyan-400" />
                  <span>WATCH MUSIC VIDEO</span>
                </div>
              </div>
            </div>
          ) : (
            /* Live YouTube Video Player Embed */
            <div className="w-full h-full relative">
              <iframe
                ref={iframeRef}
                key={`yt-iframe-${track.id}`}
                src={`https://www.youtube-nocookie.com/embed/${track.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                title={`Music Video - ${track.title}`}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

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
