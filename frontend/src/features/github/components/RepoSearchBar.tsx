import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X, LayoutGrid, List } from 'lucide-react';

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
}: RepoSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const filterTabs: { id: FilterVisibility; label: string }[] = [
    { id: 'all', label: 'All' },
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
          placeholder="Search repositories..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0D11]/90 border border-white/[0.08] text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/15 transition-all duration-200"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-neutral-500 bg-white/[0.04] border border-white/[0.08] rounded-md">
              /
            </kbd>
          </div>
        )}
      </div>

      {/* Filter Tabs & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        
        {/* Segmented Filter Pills with Sliding Indicator */}
        <div className="p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center select-none">
          {filterTabs.map((tab) => {
            const isActive = visibilityFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onVisibilityChange(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
                  isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-repo-filter-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl bg-[#0B0D11]/90 border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-neutral-300 focus:outline-none focus:border-cyan-400/50 cursor-pointer transition-colors"
          >
            <option value="default" className="bg-[#101216] text-white">Sort by: Default</option>
            <option value="name" className="bg-[#101216] text-white">Sort by: Name (A-Z)</option>
          </select>
        </div>

        {/* Grid / List View Toggle */}
        <div className="p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-white/[0.08] text-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-white/[0.08] text-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
