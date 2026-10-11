export interface Track {
  id: string; // YouTube Video ID or Suno UUID
  title: string;
  artist: string;
  duration: string; // e.g. "6:28"
  durationSeconds: number;
  index: number;
  thumbnail: string;
  youtubeUrl: string;
  category: 'rock' | 'remix' | 'acoustic' | 'anthem' | 'duet' | 'alt';
  tags: string[];
  description?: string;
  featuredLyrics?: string;
  lyrics?: string; // Full multi-verse song lyrics from Suno catalogue
  // Suno integration fields
  audioUrl?: string;
  videoUrl?: string;
  embedUrl?: string;
  sunoUrl?: string;
  isSuno?: boolean;
}

export interface SunoTrack {
  id: string; // Suno UUID
  title: string;
  artist: string;
  handle: string;
  index: number;
  image: string;
  audioUrl: string; // CloudFront m4a
  videoUrl: string; // Suno mp4
  embedUrl: string; // Suno embed widget
  sunoUrl: string; // Suno song link
  duration: number; // in seconds
  durationFormatted: string; // e.g. "6:27"
  tags: string[];
  lyrics: string;
}

export const sunoToTrack = (st: SunoTrack): Track => ({
  id: st.id,
  title: st.title,
  artist: st.artist,
  duration: st.durationFormatted,
  durationSeconds: st.duration,
  index: st.index,
  thumbnail: st.image,
  youtubeUrl: st.sunoUrl,
  category: 'alt',
  tags: st.tags,
  description: `Suno AI Track • @${st.handle}`,
  featuredLyrics: st.lyrics,
  lyrics: st.lyrics,
  audioUrl: st.videoUrl || st.audioUrl,
  videoUrl: st.videoUrl,
  embedUrl: st.embedUrl,
  sunoUrl: st.sunoUrl,
  isSuno: true,
});

export interface SunoPlaylistInfo {
  id: string;
  name: string;
  description: string;
  cover: string;
  user_display_name: string;
  user_handle: string;
  tiktok_handle: string;
  url: string;
  totalTracks: number;
  totalDurationSeconds: number;
}

export interface YouTubePlaylistInfo {
  id: string;
  name: string;
  description: string;
  channel: string;
  channelUrl: string;
  playlistUrl: string;
  totalTracks: number;
  totalDurationFormatted: string;
  cover: string;
}

export type ActivePage = 'youtube' | 'suno';

export type SortField = 'playlist' | 'duration-desc' | 'duration-asc' | 'title-asc' | 'title-desc' | 'newest';

export type CategoryFilter = 'all' | 'rock' | 'remix' | 'acoustic' | 'duet' | 'alt';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 100
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  showVideo: boolean;
}
