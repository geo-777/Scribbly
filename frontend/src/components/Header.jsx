import React, { useRef, useEffect } from 'react';
import { Search, LayoutGrid, List, SlidersHorizontal, Menu, X } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  noteCount = 0,
  onOpenMobileMenu,
}) {
  const searchInputRef = useRef(null);

  // Global Cmd+K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full bg-[#090b0e]/85 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/5"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-syne text-xl sm:text-2xl font-bold tracking-tight text-white m-0">
              {title}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono-code text-slate-400">
              {noteCount} {noteCount === 1 ? 'note' : 'notes'}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 font-mono-code mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="flex items-center gap-3 flex-1 md:max-w-md justify-end">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes... (⌘K)"
            className="w-full pl-9 pr-7 py-2 rounded-xl bg-[#12151b] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-500/20 text-xs font-sans transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Toggle (Grid / List) */}
        <div className="hidden sm:flex items-center bg-[#12151b] border border-white/10 p-0.5 rounded-xl">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-white/10 text-amber-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-white/10 text-amber-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sort selector */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="px-2.5 py-2 rounded-xl bg-[#12151b] border border-white/10 text-slate-300 text-xs font-mono-code focus:outline-none focus:border-amber-400/60 cursor-pointer"
        >
          <option value="updated">Updated</option>
          <option value="created">Created</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>
    </header>
  );
}
