import React, { useEffect, useState, useCallback } from 'react';
import {
  Github,
  GitCommit,
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
  RefreshCw,
  Clock,
  FolderGit2,
  AlertCircle,
  Globe,
  Code2,
  Users,
} from 'lucide-react';
import { JekyllTheme } from '../types';
import {
  fetchGitHubActivity,
  formatRelativeTime,
  GitHubActivityResponse,
} from '../services/githubActivity';

interface GitHubActivityWidgetProps {
  currentTheme: JekyllTheme;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: 'bg-sky-400',
  JavaScript: 'bg-amber-400',
  Python: 'bg-emerald-400',
  HTML: 'bg-orange-400',
  CSS: 'bg-purple-400',
};

export const GitHubActivityWidget: React.FC<GitHubActivityWidgetProps> = ({ currentTheme }) => {
  const [data, setData] = useState<GitHubActivityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'repos' | 'commits'>('repos');

  const loadActivity = useCallback(async (force = false) => {
    try {
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const result = await fetchGitHubActivity(force);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Unable to load GitHub repository activity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadActivity(false);
  }, [loadActivity]);

  const totalFeaturedStars =
    data?.featuredRepositories.reduce((sum, repo) => sum + (repo.stars || 0), 0) ?? 0;

  return (
    <section
      aria-label="GitHub Activity"
      className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-6 shadow-2xl relative overflow-hidden`}
    >
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-mono font-bold text-slate-100">
                GitHub Activity
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                @Nate-Mina
              </span>
              {data?.fetchedAt && (
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Synced {formatRelativeTime(data.fetchedAt)}
                </span>
              )}
            </div>
            <p className="text-xs font-sans text-slate-400 mt-0.5">
              Live repository stats, branch metadata, and latest commits for featured open-source projects
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => setActiveView('repos')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                activeView === 'repos'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Featured Repos
            </button>
            <button
              type="button"
              onClick={() => setActiveView('commits')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                activeView === 'commits'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commit Feed ({data?.recentCommits.length ?? 0})
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadActivity(true)}
            disabled={refreshing || loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh live GitHub stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <a
            href={data?.profile.htmlUrl || 'https://github.com/Nate-Mina'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Account Summary Strip */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Public Repos</div>
              <div className="text-sm font-mono font-bold text-slate-100">
                {data.profile.publicRepos}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Featured Stars</div>
              <div className="text-sm font-mono font-bold text-slate-100">{totalFeaturedStars}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Last Push</div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                {data.recentCommits[0]?.date
                  ? formatRelativeTime(data.recentCommits[0].date)
                  : 'Active'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Followers</div>
              <div className="text-sm font-mono font-bold text-slate-100">
                {data.profile.followers}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-pulse"
            >
              <div className="h-4 w-1/2 bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-900 rounded" />
              <div className="h-3 w-3/4 bg-slate-900 rounded" />
              <div className="h-14 w-full bg-slate-900 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !data && (
        <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono font-bold text-rose-300">
                GitHub Activity Sync Interrupted
              </div>
              <p className="text-xs font-sans text-slate-300 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadActivity(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-colors shrink-0"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Featured Repositories View */}
      {data && activeView === 'repos' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {data.featuredRepositories.map((repo) => {
              const langDotClass = LANGUAGE_COLORS[repo.language] || 'bg-slate-400';
              return (
                <div
                  key={repo.fullName}
                  className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Repo Title Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono font-bold text-slate-100 hover:text-emerald-400 transition-colors flex items-center gap-1.5 truncate"
                        >
                          <FolderGit2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">{repo.name}</span>
                        </a>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <GitBranch className="w-3 h-3" />
                          <span>{repo.defaultBranch}</span>
                          <span>•</span>
                          <span>Pushed {formatRelativeTime(repo.pushedAt)}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        Featured
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs font-sans text-slate-300 leading-relaxed line-clamp-2">
                      {repo.description}
                    </p>

                    {/* Latest Commit Callout */}
                    {repo.latestCommit ? (
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/90 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                            <GitCommit className="w-3 h-3 text-emerald-400" />
                            Latest Commit
                          </span>
                          <a
                            href={repo.latestCommit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-400 hover:border-sky-400 transition-colors"
                            title="Inspect commit on GitHub"
                          >
                            {repo.latestCommit.shortSha}
                          </a>
                        </div>
                        <p className="text-[11px] font-mono text-slate-200 line-clamp-2 leading-snug">
                          {repo.latestCommit.headline}
                        </p>
                        <div className="text-[10px] font-sans text-slate-400 flex items-center justify-between gap-2 pt-0.5">
                          <span className="truncate">{repo.latestCommit.authorName}</span>
                          <span className="shrink-0 font-mono text-slate-500">
                            {formatRelativeTime(repo.latestCommit.date)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 text-[11px] font-mono text-slate-400">
                        Last repository update: {formatRelativeTime(repo.pushedAt)}
                      </div>
                    )}
                  </div>

                  {/* Stats & Quick Links Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] font-mono">
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="flex items-center gap-1.5" title="Primary Language">
                        <span className={`w-2 h-2 rounded-full ${langDotClass}`} />
                        <span>{repo.language}</span>
                      </span>
                      <span className="flex items-center gap-1 text-amber-300" title="Stars">
                        <Star className="w-3.5 h-3.5" />
                        <span>{repo.stars}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400" title="Forks">
                        <GitFork className="w-3.5 h-3.5" />
                        <span>{repo.forks}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 transition-colors"
                          title="Open Live Deployment"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                        title="Open GitHub Repository"
                      >
                        <Code2 className="w-3 h-3 text-sky-400" />
                        <span>Code</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary Active Repos Bar */}
          {data.otherActiveRepositories.length > 0 && (
            <div className="pt-2 space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                <span>Other Recently Active Repositories</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.otherActiveRepositories.map((repo) => (
                  <a
                    key={repo.fullName}
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/50 transition-all flex flex-col justify-between gap-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-sky-400 truncate">
                        {repo.name}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sky-400 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            LANGUAGE_COLORS[repo.language] || 'bg-slate-400'
                          }`}
                        />
                        {repo.language}
                      </span>
                      <span>{formatRelativeTime(repo.pushedAt)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chronological Commit Feed View */}
      {data && activeView === 'commits' && (
        <div className="space-y-2.5">
          {data.recentCommits.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs font-mono text-slate-400">
              No recent commits found across featured repositories.
            </div>
          ) : (
            data.recentCommits.map((commit) => (
              <a
                key={`${commit.repoName}-${commit.sha}`}
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                        {commit.repoName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {commit.shortSha}
                      </span>
                      <span className="text-[11px] font-sans text-slate-400">
                        by {commit.authorName}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                      {commit.headline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0 pl-11 sm:pl-0">
                  <span>{formatRelativeTime(commit.date)}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </section>
  );
};
