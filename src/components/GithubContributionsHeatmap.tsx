import React, { useState } from 'react';
import { GitCommit, Flame, Calendar, Award, ExternalLink, Info } from 'lucide-react';
import { JekyllTheme } from '../types';

interface GithubContributionsHeatmapProps {
  currentTheme: JekyllTheme;
}

export const GithubContributionsHeatmap: React.FC<GithubContributionsHeatmapProps> = ({ currentTheme }) => {
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);

  // Generate realistic GitHub contribution days for the past year (~52 columns x 7 rows)
  const generateDays = (year: string) => {
    const days = [];
    const startDate = new Date(year === '2026' ? '2026-01-01' : '2025-01-01');
    const endDate = new Date(year === '2026' ? '2026-10-17' : '2025-12-31');
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      let count = 0;
      const mod = hash % 100;
      if (mod > 40) {
        count = (hash % 5) + (isWeekend && (hash % 2 === 0) ? 1 : 2);
        if (mod > 90) count = 8 + (hash % 6);
      }

      days.push({
        date: dateStr,
        count,
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 8 ? 3 : 4,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const daysData = generateDays(selectedYear);
  const totalContributions = daysData.reduce((acc, d) => acc + d.count, 0);

  const weeks: typeof daysData[] = [];
  for (let i = 0; i < daysData.length; i += 7) {
    weeks.push(daysData.slice(i, i + 7));
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
                GitHub Development Activity & Contributions
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Live Feed
              </span>
            </div>
            <p className="text-xs font-sans text-slate-400 mt-0.5">
              Consistent open-source, systems architecture, and AI applet commit consistency ({selectedYear})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
            <button
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

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="View GitHub Profile"
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
            <div className="text-[10px] font-mono text-slate-400 uppercase">Total Commits</div>
            <div className="text-sm font-mono font-bold text-slate-100">{totalContributions.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Current Streak</div>
            <div className="text-sm font-mono font-bold text-slate-100">42 Days</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Longest Streak</div>
            <div className="text-sm font-mono font-bold text-slate-100">118 Days</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Contribution Rate</div>
            <div className="text-sm font-mono font-bold text-emerald-400">94.2% Active</div>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Container */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{totalContributions} contributions in {selectedYear}</span>
          {hoveredCell ? (
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {hoveredCell.count} contributions on {hoveredCell.date}
            </span>
          ) : (
            <span className="text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Hover boxes for details
            </span>
          )}
        </div>

        {/* Scrollable Heatmap Grid */}
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="inline-flex gap-1 min-w-full">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredCell({ date: day.date, count: day.count })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`w-3.5 h-3.5 rounded-sm border transition-all duration-150 cursor-pointer hover:scale-125 hover:z-10 ${getLevelClass(
                      day.level
                    )}`}
                    title={`${day.count} contributions on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

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
