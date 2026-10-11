import React, { useState } from 'react';
import { X, Check, Copy, Share2, Youtube, Send } from 'lucide-react';
import { Track } from '../types';

interface ShareModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  track,
  isOpen,
  onClose,
  isDarkMode
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !track) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const trackUrl = track.youtubeUrl || currentUrl;
  const shareText = `Check out "${track.title}" by DomInNATEly! 🎸🔥`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(trackUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = trackUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${track.title} - DomInNATEly`,
          text: shareText,
          url: trackUrl,
        });
      } catch {
        // User canceled or failed
      }
    }
  };

  const encodedUrl = encodeURIComponent(trackUrl);
  const encodedText = encodeURIComponent(`${shareText} ${trackUrl}`);
  const encodedTitle = encodeURIComponent(`${track.title} - DomInNATEly`);

  const shareLinks = [
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
      color: 'bg-black text-white hover:bg-neutral-800 border-neutral-700',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2] text-white hover:bg-[#166fe5] border-transparent',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
      color: 'bg-[#25D366] text-white hover:bg-[#20ba59] border-transparent',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
        </svg>
      )
    },
    {
      name: 'Reddit',
      url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      color: 'bg-[#FF4500] text-white hover:bg-[#e03d00] border-transparent',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      )
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-[#229ED9] text-white hover:bg-[#1f8ec4] border-transparent',
      icon: <Send className="w-4 h-4 fill-current" />
    }
  ];

  return (
    <div
      id="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        id="share-modal-container"
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 relative transition-all ${
          isDarkMode
            ? 'bg-[#0a0a0a] border-white/10 text-white'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-share-modal"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
            isDarkMode
              ? 'text-white/40 hover:text-white hover:bg-white/10'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black shadow-md">
            <img
              src={track.thumbnail}
              alt={track.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-0.5">
              <Share2 className="w-3.5 h-3.5" />
              Share Track
            </div>
            <h3 className="font-bold text-base leading-snug truncate">{track.title}</h3>
            <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-neutral-500'}`}>
              by <span className="font-medium text-cyan-400">{track.artist}</span> • {track.duration}
            </p>
          </div>
        </div>

        {/* Copy Link Input Box */}
        <div className="mb-5">
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-white/50' : 'text-neutral-600'}`}>
            Track Link
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-link-input"
              type="text"
              readOnly
              value={trackUrl}
              className={`flex-1 text-xs px-3 py-2.5 rounded-xl border font-mono truncate focus:outline-hidden ${
                isDarkMode
                  ? 'bg-black/60 border-white/10 text-cyan-300'
                  : 'bg-neutral-50 border-neutral-300 text-neutral-800'
              }`}
            />
            <button
              id="copy-track-link-btn"
              onClick={handleCopy}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-black'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Grid */}
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-white/50' : 'text-neutral-600'}`}>
            Share on Social Networks
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border shadow-xs transition-transform active:scale-95 ${link.color}`}
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}

            {/* Direct YouTube button */}
            <a
              href={track.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FF0000] text-white hover:bg-[#d90000] shadow-xs active:scale-95 transition-transform"
            >
              <Youtube className="w-4 h-4 fill-current" />
              <span>YouTube</span>
            </a>
          </div>
        </div>

        {/* Native Mobile Share if available */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              id="native-device-share-btn"
              onClick={handleNativeShare}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-cyan-400'
                  : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open Device Share Sheet</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
