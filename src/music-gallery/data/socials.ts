export interface SocialLinkItem {
  id: string;
  name: string;
  label: string;
  url: string;
  handle: string;
  icon: string;
  color: string;
  actionText: string;
}

export const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    label: 'Follow on TikTok',
    url: 'https://www.tiktok.com/@dominnately',
    handle: '@dominnately',
    icon: '🎵',
    color: 'from-pink-500/20 to-cyan-500/20 text-pink-400 border-pink-500/30 hover:border-pink-400',
    actionText: 'Follow & Like'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    label: 'Subscribe on YouTube',
    url: 'https://www.youtube.com/@DomInNATEly',
    handle: '@DomInNATEly',
    icon: '▶️',
    color: 'from-red-600/20 to-red-500/10 text-red-400 border-red-500/30 hover:border-red-400',
    actionText: 'Subscribe & Like'
  },
  {
    id: 'github',
    name: 'GitHub',
    label: 'Check on GitHub',
    url: 'https://github.com/Nate-Mina',
    handle: 'Nate-Mina',
    icon: '🐙',
    color: 'from-purple-500/20 to-neutral-700/20 text-purple-300 border-purple-500/30 hover:border-purple-400',
    actionText: 'Star & Follow'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    label: 'Connect on Facebook',
    url: 'https://facebook.com/NateMina',
    handle: 'NateMina',
    icon: '👍',
    color: 'from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30 hover:border-blue-400',
    actionText: 'Connect'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    label: 'Connect on LinkedIn',
    url: 'https://www.linkedin.com/in/dominnately/',
    handle: 'dominnately',
    icon: '💼',
    color: 'from-sky-600/20 to-cyan-600/20 text-sky-400 border-sky-500/30 hover:border-sky-400',
    actionText: 'Connect'
  },
  {
    id: 'portfolio',
    name: 'About Me',
    label: 'Visit Portfolio & CV',
    url: 'https://nate-mina.github.io/Portfolio-CV/',
    handle: 'nate-mina.github.io',
    icon: '👤',
    color: 'from-cyan-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/30 hover:border-cyan-400',
    actionText: 'View CV'
  }
];

export const ABOUT_ME_URL = 'https://nate-mina.github.io/Portfolio-CV/';
