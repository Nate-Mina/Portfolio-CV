import React from 'react';
import DomInNATElyApp from '../music-gallery/App';
import { JekyllTheme } from '../types';

interface MusicPageProps {
  currentTheme?: JekyllTheme;
  onOpenTerminal?: () => void;
  onOpenCustomQr?: (url: string, title: string) => void;
}

export const MusicPage: React.FC<MusicPageProps> = () => {
  return (
    <div className="w-full music-gallery-wrapper">
      <DomInNATElyApp />
    </div>
  );
};
