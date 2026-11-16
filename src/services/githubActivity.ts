export interface GitHubCommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  headline: string;
  authorName: string;
  authorAvatar: string | null;
  date: string;
  url: string;
  repoName?: string;
  repoFullName?: string;
  repoUrl?: string;
}

export interface GitHubRepoStats {
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  homepage: string | null;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  defaultBranch: string;
  pushedAt: string;
  updatedAt: string;
  topics: string[];
  featured: boolean;
  latestCommit: GitHubCommitInfo | null;
  recentCommits: GitHubCommitInfo[];
}

export interface GitHubProfileSummary {
  login: string;
  name: string;
  avatarUrl: string | null;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  bio: string;
}

export interface GitHubActivityResponse {
  username: string;
  profile: GitHubProfileSummary;
  featuredRepositories: GitHubRepoStats[];
  otherActiveRepositories: GitHubRepoStats[];
  recentCommits: GitHubCommitInfo[];
  fetchedAt: string;
  cached?: boolean;
  stale?: boolean;
}

const GITHUB_USERNAME = 'Nate-Mina';
const FEATURED_REPOS = ['Polymath', 'DomInNATEly', 'Portfolio-CV'];
const LOCAL_CACHE_KEY = 'nate_mina_github_activity_v1';
const LOCAL_CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchDirectFromGitHub(): Promise<GitHubActivityResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };

  const [profileRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=10`, { headers }),
  ]);

  if (!profileRes.ok || !reposRes.ok) {
    throw new Error(`GitHub API returned status ${profileRes.status}/${reposRes.status}`);
  }

  const profile = await profileRes.json();
  const recentReposRaw = await reposRes.json();
  const recentRepos = Array.isArray(recentReposRaw) ? recentReposRaw : [];

  const featuredRepoData = await Promise.all(
    FEATURED_REPOS.map(async (repoName) => {
      let repoInfo = recentRepos.find(
        (r: any) => r.name?.toLowerCase() === repoName.toLowerCase()
      );
      if (!repoInfo) {
        const singleRes = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
          { headers }
        );
        if (!singleRes.ok) return null;
        repoInfo = await singleRes.json();
      }

      let commits: GitHubCommitInfo[] = [];
      try {
        const commitsRes = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoInfo.name}/commits?per_page=3`,
          { headers }
        );
        if (commitsRes.ok) {
          const commitsRaw = await commitsRes.json();
          if (Array.isArray(commitsRaw)) {
            commits = commitsRaw.map((c: any) => ({
              sha: c.sha,
              shortSha: (c.sha || '').slice(0, 7),
              message: c.commit?.message || '',
              headline: (c.commit?.message || '').split('\n')[0],
              authorName: c.commit?.author?.name || c.author?.login || GITHUB_USERNAME,
              authorAvatar: c.author?.avatar_url || profile.avatar_url || null,
              date: c.commit?.author?.date || repoInfo.pushed_at,
              url: c.html_url,
            }));
          }
        }
      } catch {
        commits = [];
      }

      return {
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        description: repoInfo.description || 'Featured open-source engineering project.',
        htmlUrl: repoInfo.html_url,
        homepage: repoInfo.homepage || null,
        language: repoInfo.language || 'TypeScript',
        stars: repoInfo.stargazers_count ?? 0,
        forks: repoInfo.forks_count ?? 0,
        watchers: repoInfo.watchers_count ?? 0,
        openIssues: repoInfo.open_issues_count ?? 0,
        defaultBranch: repoInfo.default_branch || 'main',
        pushedAt: repoInfo.pushed_at,
        updatedAt: repoInfo.updated_at,
        topics: Array.isArray(repoInfo.topics) ? repoInfo.topics : [],
        featured: true,
        latestCommit: commits[0] || null,
        recentCommits: commits,
      } satisfies GitHubRepoStats;
    })
  );

  const featuredFiltered = featuredRepoData.filter(Boolean) as GitHubRepoStats[];

  const otherActiveRepos: GitHubRepoStats[] = recentRepos
    .filter(
      (r: any) =>
        !r.fork &&
        !FEATURED_REPOS.some((f) => f.toLowerCase() === (r.name || '').toLowerCase()) &&
        r.name?.toLowerCase() !== GITHUB_USERNAME.toLowerCase()
    )
    .slice(0, 4)
    .map((r: any) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description || 'Active repository',
      htmlUrl: r.html_url,
      homepage: r.homepage || null,
      language: r.language || 'TypeScript',
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      watchers: r.watchers_count ?? 0,
      openIssues: r.open_issues_count ?? 0,
      defaultBranch: r.default_branch || 'main',
      pushedAt: r.pushed_at,
      updatedAt: r.updated_at,
      topics: Array.isArray(r.topics) ? r.topics : [],
      featured: false,
      latestCommit: null,
      recentCommits: [],
    }));

  const recentCommitsTimeline = featuredFiltered
    .flatMap((repo) =>
      repo.recentCommits.map((c) => ({
        ...c,
        repoName: repo.name,
        repoFullName: repo.fullName,
        repoUrl: repo.htmlUrl,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return {
    username: GITHUB_USERNAME,
    profile: {
      login: profile.login || GITHUB_USERNAME,
      name: profile.name || 'Nathaniel Mina',
      avatarUrl: profile.avatar_url || null,
      htmlUrl: profile.html_url || `https://github.com/${GITHUB_USERNAME}`,
      publicRepos: profile.public_repos ?? recentRepos.length,
      followers: profile.followers ?? 0,
      following: profile.following ?? 0,
      bio: profile.bio || '',
    },
    featuredRepositories: featuredFiltered,
    otherActiveRepositories: otherActiveRepos,
    recentCommits: recentCommitsTimeline,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchGitHubActivity(forceRefresh = false): Promise<GitHubActivityResponse> {
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.timestamp && Date.now() - parsed.timestamp < LOCAL_CACHE_TTL_MS && parsed.data) {
          return { ...parsed.data, cached: true };
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  let data: GitHubActivityResponse | null = null;

  try {
    const endpoint = forceRefresh ? '/api/github/activity?force=true' : '/api/github/activity';
    const res = await fetch(endpoint);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      }
    }
  } catch {
    // Fall back to direct GitHub REST API
  }

  if (!data) {
    data = await fetchDirectFromGitHub();
  }

  if (typeof window !== 'undefined' && data) {
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
    } catch {
      // Ignore storage errors
    }
  }

  return data;
}

export function formatRelativeTime(isoDate: string): string {
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return 'Recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - target) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GitHubContributionsResponse {
  username: string;
  year: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  activeRate: number;
  days: GitHubContributionDay[];
  fetchedAt: string;
  cached?: boolean;
}

function computeContributionStats(
  days: GitHubContributionDay[],
  year: string,
  parsedTotal?: number
): GitHubContributionsResponse {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const todayIso = new Date().toISOString().split('T')[0];
  const effectiveDays = year === '2026' ? sorted.filter((d) => d.date <= todayIso) : sorted;

  let longestStreak = 0;
  let runningStreak = 0;
  let activeDays = 0;
  let sum = 0;

  for (const d of effectiveDays) {
    sum += d.count;
    if (d.count > 0) {
      activeDays += 1;
      runningStreak += 1;
      if (runningStreak > longestStreak) longestStreak = runningStreak;
    } else {
      runningStreak = 0;
    }
  }

  let currentStreak = 0;
  if (effectiveDays.length > 0) {
    let idx = effectiveDays.length - 1;
    if (effectiveDays[idx].count === 0 && idx > 0 && effectiveDays[idx - 1].count > 0) {
      idx -= 1;
    }
    while (idx >= 0 && effectiveDays[idx].count > 0) {
      currentStreak += 1;
      idx -= 1;
    }
  }

  const activeRate =
    effectiveDays.length > 0 ? Math.round((activeDays / effectiveDays.length) * 1000) / 10 : 0;

  return {
    username: GITHUB_USERNAME,
    year,
    totalContributions: Math.max(parsedTotal ?? 0, sum),
    currentStreak,
    longestStreak,
    activeDays,
    activeRate,
    days: sorted,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchGitHubContributions(
  year: '2026' | '2025',
  forceRefresh = false
): Promise<GitHubContributionsResponse> {
  const cacheKey = `nate_mina_github_contributions_${year}_v1`;
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.timestamp && Date.now() - parsed.timestamp < LOCAL_CACHE_TTL_MS && parsed.data) {
          return { ...parsed.data, cached: true };
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  let result: GitHubContributionsResponse | null = null;

  try {
    const endpoint = `/api/github/contributions?year=${year}${forceRefresh ? '&force=true' : ''}`;
    const res = await fetch(endpoint);
    if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
      result = await res.json();
    }
  } catch {
    // Fall back to public contributions JSON endpoint
  }

  if (!result) {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${year}`);
    if (!res.ok) {
      throw new Error(`Contributions API returned ${res.status}`);
    }
    const json = await res.json();
    const days: GitHubContributionDay[] = Array.isArray(json?.contributions) ? json.contributions : [];
    const total = typeof json?.total?.[year] === 'number' ? json.total[year] : undefined;
    result = computeContributionStats(days, year, total);
  }

  if (typeof window !== 'undefined' && result) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
    } catch {
      // Ignore storage errors
    }
  }

  return result;
}
