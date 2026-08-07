import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, ExternalLink, Globe, Compass, Share2 } from 'lucide-react';
import { generateQrMatrix } from '../utils/qrGenerator';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  url: initialUrl,
  title: initialTitle,
}) => {
  const defaultPresets = [
    {
      id: 'beacons',
      title: 'Beacons Profile Hub',
      url: 'https://beacons.ai/p_c/aboutme',
      icon: Compass,
      badge: 'Profile Hub',
    },
    {
      id: 'purecomp',
      title: 'Pure Computers Official',
      url: 'https://www.PureComp.Net',
      icon: Globe,
      badge: 'Official Site',
    },
    {
      id: 'app',
      title: 'Current Site Page',
      url: typeof window !== 'undefined' ? window.location.href : 'https://www.PureComp.Net',
      icon: Share2,
      badge: 'Live App',
    },
  ];

  const [activeUrl, setActiveUrl] = useState<string>(initialUrl || defaultPresets[0].url);
  const [activeTitle, setActiveTitle] = useState<string>(initialTitle || defaultPresets[0].title);
  const [copied, setCopied] = useState(false);

  // Sync when initialUrl/initialTitle props change
  useEffect(() => {
    if (initialUrl) {
      setActiveUrl(initialUrl);
      setActiveTitle(initialTitle || 'Shared Link');
    } else {
      setActiveUrl(defaultPresets[0].url);
      setActiveTitle(defaultPresets[0].title);
    }
  }, [initialUrl, initialTitle, isOpen]);

  // Keyboard trap for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const matrix = generateQrMatrix(activeUrl, 25);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          title="Close QR Modal (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md">
            <QrCode className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-mono font-bold text-slate-100">{activeTitle}</h3>
            <p className="text-xs font-sans text-slate-400">
              Scan with your mobile camera to open link
            </p>
          </div>
        </div>

        {/* Quick Share Presets */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
          {defaultPresets.map((preset) => {
            const Icon = preset.icon;
            const isSelected = activeUrl === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setActiveUrl(preset.url);
                  setActiveTitle(preset.title);
                }}
                className={`py-1.5 px-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate w-full text-center">{preset.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic QR Matrix Canvas SVG */}
        <div className="mx-auto w-52 h-52 bg-white p-3.5 rounded-2xl shadow-inner flex items-center justify-center border-2 border-slate-300 relative group">
          <svg viewBox="0 0 25 25" className="w-full h-full">
            {matrix.map((row, r) =>
              row.map((cell, c) => {
                if (!cell) return null;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={c}
                    y={r}
                    width={1}
                    height={1}
                    fill="#0f172a"
                    rx={0.15}
                  />
                );
              })
            )}

            {/* Central Pure Computers Emblem Badge */}
            <rect x="10" y="10" width="5" height="5" fill="#10b981" rx="0.8" />
            <text
              x="12.5"
              y="13.2"
              fontSize="2"
              fill="#ffffff"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              PC
            </text>
          </svg>
        </div>

        {/* Active URL Display Box */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 truncate text-center shadow-inner">
          {activeUrl}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors border border-slate-700/80"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-colors shadow-md gap-1.5"
            title="Open URL in new tab"
          >
            <span>Open Link</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
