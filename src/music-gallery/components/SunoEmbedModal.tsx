import React, { useState } from 'react';
import { SunoTrack } from '../types';
import { X, ExternalLink, Video, Disc3, Sparkles } from 'lucide-react';

interface SunoEmbedModalProps {
  track: SunoTrack | null;
  onClose: () => void;
  isDarkMode: boolean;
}

export const SunoEmbedModal: React.FC<SunoEmbedModalProps> = ({
  track,
  onClose,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'embed' | 'video'>('embed');

  if (!track) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-[390px] flex flex-col rounded-2xl shadow-2xl border overflow-hidden max-h-[95vh] ${
          isDarkMode ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          className={`p-4 border-b flex items-center justify-between gap-3 ${
            isDarkMode ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
              <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate tracking-tight">{track.title}</h3>
              <p className="text-[11px] text-cyan-400 font-mono truncate">{track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div
              className={`flex items-center p-1 rounded-lg border text-xs font-semibold ${
                isDarkMode ? 'bg-black/50 border-white/10' : 'bg-neutral-100 border-neutral-300'
              }`}
            >
              <button
                onClick={() => setActiveTab('embed')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'embed'
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : isDarkMode
                    ? 'text-white/70 hover:text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Disc3 className="w-3.5 h-3.5" />
                <span>Suno Embed</span>
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'video'
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : isDarkMode
                    ? 'text-white/70 hover:text-white'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video MP4</span>
              </button>
            </div>

            <a
              href={track.sunoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 hover:text-cyan-400 hover:border-cyan-400/40 text-white/80'
                  : 'bg-white border-neutral-300 hover:text-cyan-600 text-neutral-700'
              }`}
              title="Open song on Suno"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-neutral-200 text-neutral-600'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area (9:16 Ratio) */}
        <div className="relative w-full aspect-[9/16] max-h-[72vh] bg-black flex items-center justify-center overflow-hidden">
          {activeTab === 'embed' ? (
            <iframe
              src={encodeURI(track.embedUrl || '')}
              title={`Suno Embed - ${track.title}`}
              className="w-full h-full border-0"
              allow="autoplay"
              loading="lazy"
            />
          ) : (
            <video
              src={encodeURI(track.videoUrl || '')}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-black"
              poster={track.image}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-3.5 border-t flex items-center justify-between text-xs ${
            isDarkMode ? 'border-white/10 bg-white/5 text-white/60' : 'border-neutral-200 bg-neutral-50 text-neutral-600'
          }`}
        >
          <div className="flex items-center gap-2 text-[11px]">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Interactive player hosted by Suno.ai</span>
          </div>

          <a
            href={`https://suno.com/playlist/26af3597-73d4-491c-a9b3-aac9a0d55c82`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 underline underline-offset-2 flex items-center gap-1 font-mono text-[11px]"
          >
            <span>DomInNATEly Top Hits Playlist</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
