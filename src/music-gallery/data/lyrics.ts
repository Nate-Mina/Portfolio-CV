import { SUNO_TRACKS } from './sunoData';
import { Track, SunoTrack } from '../types';

const findSunoLyrics = (searchKey: string): string => {
  const match = SUNO_TRACKS.find((st) => {
    if (st.id === searchKey) return true;
    const cleanSearch = searchKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTitle = st.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanTitle.includes(cleanSearch) || cleanSearch.includes(cleanTitle);
  });
  return match?.lyrics || '';
};

/**
 * Precise mapping of YouTube Video IDs to the authentic, full multi-verse song lyrics
 * curated in the DomInNATEly Suno AI track collection.
 */
export const YOUTUBE_TO_SUNO_LYRICS: Record<string, string> = {
  // 1. Poison Shot By Shot
  'MPLgPPy9Sjs': findSunoLyrics('Poison Shot By Shot'),

  // 2. I Begged You Don't Betray Me
  'BCY7C34diZk': findSunoLyrics("Don't Betray me") || findSunoLyrics('I Never Bled Someone the Way You Do'),

  // 3. You Questioned My Motives
  '9qx6tz-NyKY': findSunoLyrics('You questioned my motives') || findSunoLyrics("You'd Rather!"),

  // 4. Super Pessimistic (Guitar Riffs Remix)
  'fBBwdLTJMVE': findSunoLyrics('Super Pessimistic! (Experimental remix)'),

  // 5. I Practiced Being Hurt
  'r6BibuJXzEw': findSunoLyrics('I Practiced being Hurt') || findSunoLyrics('HURT ME'),

  // 6. Cluster B Storm
  'PZtOJku0f_g': findSunoLyrics('Cluster B Storm'),

  // 7. I Want You Back, But I Hate that I Do
  'Szoqqqy0KkU': findSunoLyrics('I Want You Back, But I hate That I Do!'),

  // 8. You Played the Wounded Bird
  'vohyDAV8PpI': findSunoLyrics('You Played The Wounded Bird'),

  // 9. You'd Rather
  'BcCaAPSLgVg': findSunoLyrics("You'd Rather!"),

  // 10. Pessimistic Girl
  'XpnTmJ6WCmw': findSunoLyrics('pessimistic girl') || findSunoLyrics('Pessimistic Bias'),

  // 11. We MUSK go to MARS!
  'HV2GfTi2-mI': findSunoLyrics('We MUSK go to MARS!'),

  // 12. Take the Chance
  'osGORpTfs0I': findSunoLyrics("DON'T MISS IT"),

  // 13. Bittersweet Echos
  'Dgvk00dBQ1Y': findSunoLyrics('The Doubts Between the Seams'),

  // 14. Crazy Can be So much Fun
  '9lmCALdX0f8': findSunoLyrics('Bad Brina knows how to Win'),

  // 15. Her Leather Facade
  'sx_f6KVmWmQ': findSunoLyrics('Saints and Schemes'),

  // 16. You Jinxed Us
  't8zv9_NNdps': findSunoLyrics("cages that I couldn't even see(RAP}") || findSunoLyrics('Poison Shot By Shot'),
};

/**
 * Universal lyrics resolver for both YouTube and Suno tracks.
 * Prioritizes direct lyrics property, then YouTube ID lookup, then smart keyword/title search,
 * and finally featuredLyrics fallback.
 */
export function getTrackLyrics(track: Track | SunoTrack | null | undefined): string {
  if (!track) return '';

  // 1. If track has direct lyrics defined and it's substantial
  if ('lyrics' in track && track.lyrics && track.lyrics.trim().length > 30) {
    return track.lyrics;
  }

  // 2. If it's a YouTube track ID in our explicit dictionary
  if (track.id && YOUTUBE_TO_SUNO_LYRICS[track.id]) {
    return YOUTUBE_TO_SUNO_LYRICS[track.id];
  }

  // 3. Smart Keyword / Title matching in Suno catalogue
  const cleanTitle = (track.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanTitle) {
    const sunoMatch = SUNO_TRACKS.find((st) => {
      const cleanSt = st.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanSt.includes(cleanTitle) || cleanTitle.includes(cleanSt);
    });
    if (sunoMatch && sunoMatch.lyrics) {
      return sunoMatch.lyrics;
    }
  }

  // 4. Fallback to featuredLyrics if available
  if ('featuredLyrics' in track && track.featuredLyrics) {
    return track.featuredLyrics;
  }

  return '';
}
