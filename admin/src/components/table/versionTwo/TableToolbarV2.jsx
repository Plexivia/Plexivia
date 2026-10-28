import React from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Search on the left; filters (or bulk actions while rows are selected) on the right.
 *
 * @param {Object} props
 * @param {string} props.search - Search input value
 * @param {(value: string) => void} props.onSearchChange
 * @param {string} [props.searchPlaceholder]
 * @param {React.ReactNode} [props.filters] - Filter controls shown on the right
 * @param {boolean} [props.hasActiveFilters] - Shows the Reset button
 * @param {() => void} [props.onResetFilters]
 * @param {number} [props.selectedCount] - When > 0, `bulkActions` replace the filters
 * @param {() => void} [props.onClearSelection]
 * @param {React.ReactNode} [props.bulkActions]
 */
export function TableToolbarV2({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = null,
  hasActiveFilters = false,
  onResetFilters,
  selectedCount = 0,
  onClearSelection,
  bulkActions = null,
  className = '',
}) {
  const showBulk = selectedCount > 0 && bulkActions;

  return (
    <div className={cn('flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between', className)}>
      <div className="relative xl:w-96">
        <Search className="pointer-events-none absolute top-2.5 left-2.5 z-10 size-4 text-muted-foreground dark:text-zinc-500" />
        <Input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 pr-8 pl-8 text-sm dark:border-white dark:bg-white dark:text-zinc-900 dark:placeholder:text-zinc-500"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground dark:text-zinc-500 dark:hover:text-zinc-900 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {showBulk ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="text-sm whitespace-nowrap text-muted-foreground">
            <span className="font-semibold text-primary">{selectedCount}</span> selected
          </span>
          {bulkActions}
          {onClearSelection && (
            <Button variant="outline" onClick={onClearSelection} className="h-9 gap-1.5 px-3 text-sm">
              <X className="size-4" />
              Clear
            </Button>
          )}
        </div>
      ) : (
        (filters || hasActiveFilters) && (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
            {hasActiveFilters && onResetFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={onResetFilters}
                className="col-span-2 h-9 gap-1.5 px-3 text-sm text-muted-foreground hover:text-foreground sm:col-span-1"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            )}
            {filters}
          </div>
        )
      )}
    </div>
  );
}

export default TableToolbarV2;
