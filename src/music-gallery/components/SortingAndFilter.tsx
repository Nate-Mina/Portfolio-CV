import React from 'react';
import { Search, ArrowUpDown, SlidersHorizontal, X, Music } from 'lucide-react';
import { SortField, CategoryFilter } from '../types';

interface SortingAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  onSortChange: (sort: SortField) => void;
  selectedCategory: CategoryFilter;
  onCategoryChange: (cat: CategoryFilter) => void;
  totalResults: number;
  totalTracks?: number;
  isDarkMode: boolean;
}

export const SortingAndFilter: React.FC<SortingAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  sortField,
  onSortChange,
  selectedCategory,
  onCategoryChange,
  totalResults,
  totalTracks = 16,
  isDarkMode,
}) => {
  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All Tracks' },
    { id: 'rock', label: 'Rock & Riffs' },
    { id: 'remix', label: 'Remixes' },
    { id: 'acoustic', label: 'Acoustic / Live' },
    { id: 'duet', label: 'Duets' },
    { id: 'alt', label: 'Alt / Concept' },
  ];

  const maxTrackNumber = totalTracks.toString().padStart(2, '0');

  const sortOptions: { id: SortField; label: string }[] = [
    { id: 'playlist', label: `Playlist Order (#01 - #${maxTrackNumber})` },
    { id: 'newest', label: `Reverse Order (#${maxTrackNumber} - #01)` },
    { id: 'duration-desc', label: 'Duration (Longest First)' },
    { id: 'duration-asc', label: 'Duration (Shortest First)' },
    { id: 'title-asc', label: 'Title (A → Z)' },
    { id: 'title-desc', label: 'Title (Z → A)' },
  ];

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || sortField !== 'playlist';

  return (
    <div
      id="sorting-filter-panel"
      className={`rounded-2xl border p-4 sm:p-5 mb-6 backdrop-blur-md transition-all ${
        isDarkMode
          ? 'bg-white/5 border-white/10 shadow-xl shadow-black/40'
          : 'bg-white/90 border-neutral-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-white/40' : 'text-neutral-400'
            }`}
          />
          <input
            id="track-search-input"
            type="text"
            placeholder="Search tracks, lyrics, or styles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm border focus:outline-hidden transition-all ${
              isDarkMode
                ? 'bg-black/50 border-white/10 text-white placeholder-white/40 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/40'
                : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md ${
                isDarkMode ? 'text-white/40 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown matching Immersive UI pill style */}
        <div
          className={`flex items-center px-3 py-1.5 rounded-full border transition-all ${
            isDarkMode
              ? 'bg-white/5 border-white/10 text-white'
              : 'bg-neutral-100 border-neutral-300 text-neutral-800'
          }`}
        >
          <span
            className={`text-[10px] sm:text-xs font-bold mr-2 uppercase tracking-wider ${
              isDarkMode ? 'text-white/50' : 'text-neutral-500'
            }`}
          >
            SORT BY:
          </span>
          <select
            id="track-sort-select"
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as SortField)}
            className={`bg-transparent text-xs outline-hidden cursor-pointer font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
            }`}
          >
            {sortOptions.map((opt) => (
              <option
                key={opt.id}
                value={opt.id}
                className={isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-neutral-900'}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills & Filter Indicator */}
      <div
        className={`mt-4 pt-3.5 border-t flex flex-wrap items-center justify-between gap-2.5 ${
          isDarkMode ? 'border-white/10' : 'border-neutral-200'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-pill-${cat.id}`}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : isDarkMode
                    ? 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                    : 'bg-neutral-100 border border-neutral-300 text-neutral-700 hover:text-black hover:border-neutral-400'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={isDarkMode ? 'text-cyan-400 font-bold' : 'text-cyan-700 font-bold'}>
            {totalResults} {totalResults === 1 ? 'TRACK' : 'TRACKS'}
          </span>
          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={() => {
                onSearchChange('');
                onCategoryChange('all');
                onSortChange('playlist');
              }}
              className={`underline text-[11px] uppercase tracking-wider ml-2 transition-colors ${
                isDarkMode ? 'text-white/50 hover:text-white' : 'text-neutral-500 hover:text-black'
              }`}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

