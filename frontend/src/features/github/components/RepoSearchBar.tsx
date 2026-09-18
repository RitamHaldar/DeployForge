import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

export type FilterVisibility = 'all' | 'public' | 'private';
export type SortOption = 'name' | 'default';

interface RepoSearchBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  visibilityFilter: FilterVisibility;
  onVisibilityChange: (val: FilterVisibility) => void;
  sortBy: SortOption;
  onSortChange: (val: SortOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (val: 'grid' | 'list') => void;
  filteredCount: number;
  totalCount: number;
}

export function RepoSearchBar({
  searchQuery,
  onSearchChange,
  visibilityFilter,
  onVisibilityChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
}: RepoSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const filterTabs: { id: FilterVisibility; label: string }[] = [
    { id: 'all', label: 'All Repositories' },
    { id: 'public', label: 'Public' },
    { id: 'private', label: 'Private' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 mb-6">
      
      {/* Search Bar Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter repositories by name or branch..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090B0E]/90 border border-white/[0.09] text-xs sm:text-sm text-white placeholder:text-neutral-500 font-mono focus:outline-none focus:border-accent-cyan/60 focus:ring-1 focus:ring-accent-cyan/40 transition-all duration-200 shadow-inner"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-neutral-500 bg-white/[0.04] border border-white/[0.08] rounded-md">
              /
            </kbd>
          </div>
        )}
      </div>

      {/* Filter Tabs & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {/* Match Counter Badge */}
        <div className="hidden xl:flex items-center px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-neutral-400 shrink-0">
          <span>{filteredCount} of {totalCount} repos</span>
        </div>

        {/* Visibility Filter Tabs with Animated Sliding Indicator */}
        <div className="flex p-1 rounded-xl bg-[#090B0E]/90 border border-white/[0.08] font-mono text-xs select-none">
          {filterTabs.map((tab) => {
            const isActive = visibilityFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onVisibilityChange(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan ${
                  isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="repo-filter-indicator"
                    className="absolute inset-0 rounded-lg bg-white/[0.1] border border-white/15 shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <button
          type="button"
          onClick={() => onSortChange(sortBy === 'name' ? 'default' : 'name')}
          className={`px-3 py-2 rounded-xl text-xs font-mono border transition-colors flex items-center gap-1.5 ${
            sortBy === 'name'
              ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan'
              : 'bg-[#090B0E]/90 border-white/[0.08] text-neutral-400 hover:text-white'
          }`}
          title="Toggle A-Z alphabetical sort"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{sortBy === 'name' ? 'A-Z' : 'Default'}</span>
        </button>

        {/* Grid / List View Toggle */}
        <div className="flex p-1 rounded-xl bg-[#090B0E]/90 border border-white/[0.08] text-neutral-400">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white/10 text-white' : 'hover:text-white'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-white/10 text-white' : 'hover:text-white'
            }`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
