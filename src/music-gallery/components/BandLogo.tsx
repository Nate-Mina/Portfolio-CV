import React from 'react';

interface BandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDarkMode?: boolean;
  className?: string;
  showSubtitle?: boolean;
}

export const BandLogo: React.FC<BandLogoProps> = ({
  size = 'lg',
  isDarkMode = true,
  className = '',
  showSubtitle = true
}) => {
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl tracking-tight',
    md: 'text-3xl sm:text-4xl md:text-5xl tracking-tight',
    lg: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter',
    xl: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter',
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      {/* Top Accent Bar */}
      <div className="flex items-center gap-3 mb-1.5 opacity-90">
        <span className={`h-px w-6 sm:w-14 ${isDarkMode ? 'bg-gradient-to-r from-transparent to-cyan-400' : 'bg-gradient-to-r from-transparent to-cyan-600'}`} />
        <p className={`text-[10px] uppercase tracking-[0.3em] font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
          OFFICIAL GALLERY
        </p>
        <span className={`h-px w-6 sm:w-14 ${isDarkMode ? 'bg-gradient-to-l from-transparent to-cyan-400' : 'bg-gradient-to-l from-transparent to-cyan-600'}`} />
      </div>

      {/* Main Stylized Band Name with Immersive UI Dynamic Typographic Weights */}
      <div className="relative group">
        <h1
          id="band-logo-heading"
          className={`${sizeClasses[size]} leading-none transition-all duration-300 transform group-hover:scale-[1.01] cursor-default`}
        >
          <span className={isDarkMode ? 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]' : 'text-neutral-900'}>
            <span className="font-black">D</span>
            <span className="font-light opacity-80">o</span>
            <span className="font-medium opacity-90">m</span>
            <span className="font-black text-cyan-400">I</span>
            <span className="font-light opacity-80">n</span>
            <span className="font-black bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">NATE</span>
            <span className="font-light opacity-80">l</span>
            <span className="font-medium opacity-90">y</span>
          </span>
        </h1>

        {/* Ambient Cyan Pulse Halo in Dark Mode */}
        {isDarkMode && (
          <div
            className="absolute -inset-x-10 -inset-y-4 bg-cyan-500/15 blur-[50px] rounded-full -z-10 pointer-events-none animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>

      {showSubtitle && (
        <p
          className={`mt-2 font-mono tracking-[0.25em] text-[11px] sm:text-xs uppercase ${
            isDarkMode ? 'text-white/50' : 'text-neutral-500'
          }`}
        >
          Rock • Remixes • Acoustic • High Fidelity
        </p>
      )}
    </div>
  );
};

