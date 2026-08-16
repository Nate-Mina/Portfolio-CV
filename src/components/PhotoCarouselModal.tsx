import React, { useState, useEffect } from 'react';
import { handleImageError } from '../utils/imageUtils';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Play,
  Pause,
  Copy,
  Check,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { GalleryPhoto } from '../types';

interface PhotoCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: GalleryPhoto[];
  initialPhotoId?: string;
}

export const PhotoCarouselModal: React.FC<PhotoCarouselModalProps> = ({
  isOpen,
  onClose,
  photos,
  initialPhotoId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync initial photo if provided
  useEffect(() => {
    if (initialPhotoId) {
      const foundIdx = photos.findIndex((p) => p.id === initialPhotoId);
      if (foundIdx !== -1) {
        setCurrentIndex(foundIdx);
      }
    } else {
      setCurrentIndex(0);
    }
  }, [initialPhotoId, photos]);

  // Slideshow timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && isOpen && photos.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isOpen, photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + currentPhoto.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 overflow-hidden animate-fadeIn">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-mono font-bold text-slate-100 flex items-center gap-2">
              <span>Nate Mina &mdash; Profile Gallery</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                {currentIndex + 1} / {photos.length}
              </span>
            </h3>
            <p className="text-xs font-sans text-slate-400 hidden sm:block">
              Interactive Photo Carousel &bull; Use Left/Right Arrow Keys or Thumbnails
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-play slideshow button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all border ${
              isPlaying
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto Play</span>
              </>
            )}
          </button>

          {/* Share / Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy Image Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Close modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Close Gallery (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Carousel Viewer Area */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden group">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 shadow-2xl transition-all backdrop-blur-sm"
          title="Previous Photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center Display Image */}
        <div className="relative max-w-4xl max-h-[65vh] md:max-h-[70vh] flex flex-col items-center justify-center p-2">
          <img
            key={currentPhoto.id}
            src={currentPhoto.url}
            alt={currentPhoto.title}
            data-filename={currentPhoto.filename}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[58vh] md:max-h-[62vh] object-contain rounded-2xl shadow-2xl border border-slate-800 transition-all duration-300 transform scale-100"
            onError={(e) => handleImageError(e, currentPhoto.filename || 'MAIN.jpg')}
          />

          {/* Caption Box */}
          <div className="mt-3 max-w-2xl text-center space-y-1 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {currentPhoto.category}
              </span>
              <h4 className="text-sm font-mono font-bold text-slate-100">
                {currentPhoto.title}
              </h4>
            </div>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              {currentPhoto.description}
            </p>
          </div>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 shadow-2xl transition-all backdrop-blur-sm"
          title="Next Photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="border-t border-slate-800 pt-3 flex items-center justify-center gap-2 md:gap-3 overflow-x-auto py-1">
        {photos.map((photo, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                isActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                  : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.title}
                data-filename={photo.filename}
                referrerPolicy="no-referrer"
                className="w-14 h-14 md:w-16 md:h-16 object-cover"
                onError={(e) => handleImageError(e, photo.filename || 'MAIN.jpg')}
              />
              {isActive && (
                <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-400 rounded-xl pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
