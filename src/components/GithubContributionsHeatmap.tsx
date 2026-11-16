import React, { useState, useEffect, useCallback } from 'react';
import {
  GitCommit,
  Flame,
  Calendar,
  Award,
  ExternalLink,
  Info,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { JekyllTheme } from '../types';
import {
  fetchGitHubContributions,
  GitHubContributionDay,
  GitHubContributionsResponse,
} from '../services/githubActivity';

interface GithubContributionsHeatmapProps {
  currentTheme: JekyllTheme;
}

export const GithubContributionsHeatmap: React.FC<GithubContributionsHeatmapProps> = ({ currentTheme }) => {
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);
  const [data, setData] = useState<GitHubContributionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadContributions = useCallback(async (year: '2026' | '2025', force = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchGitHubContributions(year, force);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Unable to sync GitHub contribution graph.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContributions(selectedYear, false);
  }, [selectedYear, loadContributions]);

  const daysData: GitHubContributionDay[] = data?.days || [];
  const totalContributions = data?.totalContributions ?? 0;

  // Group into Sunday-Saturday weeks aligned by day of week
  const weeks: (GitHubContributionDay | null)[][] = [];
  if (daysData.length > 0) {
    let currentWeek: (GitHubContributionDay | null)[] = [];
    const firstDayOfWeek = new Date(`${daysData[0].date}T00:00:00Z`).getUTCDay();
    for (let pad = 0; pad < firstDayOfWeek; pad++) {
      currentWeek.push(null);
    }
    for (const day of daysData) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
  }

  const getLevelClass = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-slate-900 border-slate-800/80';
      case 1:
        return 'bg-emerald-950 border-emerald-900/50 text-emerald-400';
      case 2:
        return 'bg-emerald-800/80 border-emerald-700/60';
      case 3:
        return 'bg-emerald-600 border-emerald-500';
      case 4:
        return 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      default:
        return 'bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-6 shadow-2xl relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-mono font-bold text-slate-100">
                GitHub Development Activity &amp; Contributions
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Live GitHub Graph
              </span>
            </div>
            <p className="text-xs font-sans text-slate-400 mt-0.5">
              Verified daily open-source contributions for @Nate-Mina ({selectedYear})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => setSelectedYear('2026')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedYear === '2026'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2026
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear('2025')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedYear === '2025'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2025
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadContributions(selectedYear, true)}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono transition-colors disabled:opacity-50"
            title="Refresh contributions graph"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href="https://github.com/Nate-Mina"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="View Nate-Mina GitHub Profile"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Profile</span>
          </a>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Total Contributions</div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {loading && !data ? '...' : totalContributions.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Current Streak</div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {loading && !data ? '...' : `${data?.currentStreak ?? 0} Days`}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Longest Streak</div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {loading && !data ? '...' : `${data?.longestStreak ?? 0} Days`}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Active Days</div>
            <div className="text-sm font-mono font-bold text-emerald-400">
              {loading && !data ? '...' : `${data?.activeDays ?? 0} (${data?.activeRate ?? 0}%)`}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Container */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            {loading && !data
              ? `Loading ${selectedYear} contributions...`
              : `${totalContributions.toLocaleString()} contributions in ${selectedYear}`}
          </span>
          {hoveredCell ? (
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {hoveredCell.count} {hoveredCell.count === 1 ? 'contribution' : 'contributions'} on {hoveredCell.date}
            </span>
          ) : (
            <span className="text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Hover boxes for details
            </span>
          )}
        </div>

        {error && !data ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <p className="text-xs font-mono text-slate-400">{error}</p>
            <button
              type="button"
              onClick={() => loadContributions(selectedYear, true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400"
            >
              Retry Sync
            </button>
          </div>
        ) : loading && weeks.length === 0 ? (
          <div className="h-28 w-full rounded-lg bg-slate-900/60 animate-pulse" />
        ) : (
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="inline-flex gap-1 min-w-full">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) =>
                    day ? (
                      <div
                        key={day.date}
                        onMouseEnter={() => setHoveredCell({ date: day.date, count: day.count })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-3.5 h-3.5 rounded-sm border transition-all duration-150 cursor-pointer hover:scale-125 hover:z-10 ${getLevelClass(
                          day.level
                        )}`}
                        title={`${day.count} contributions on ${day.date}`}
                      />
                    ) : (
                      <div key={`pad-${wIdx}-${dIdx}`} className="w-3.5 h-3.5" />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend & Month labels footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span>Jan</span>
            <span className="text-slate-600">•</span>
            <span>Mar</span>
            <span className="text-slate-600">•</span>
            <span>May</span>
            <span className="text-slate-600">•</span>
            <span>Jul</span>
            <span className="text-slate-600">•</span>
            <span>Sep</span>
            <span className="text-slate-600">•</span>
            <span>Nov</span>
            <span className="text-slate-600">•</span>
            <span>Dec</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-slate-900 border border-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-900" />
            <div className="w-3 h-3 rounded-sm bg-emerald-800 border border-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-500" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
