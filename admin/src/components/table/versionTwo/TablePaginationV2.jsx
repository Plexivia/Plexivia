import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FILTER_CONTROL_CLASS, PAGE_BUTTON_ACTIVE_CLASS, PAGE_BUTTON_CLASS, PAGE_SIZE_OPTIONS } from './constants';
import { useIsWide } from './useMediaQuery';

// Sliding window of page numbers with the current page in the middle
const pageWindow = (current, total, size) => {
  const count = Math.min(total, size);
  const start = Math.max(1, Math.min(current - Math.floor(count / 2), total - count + 1));
  return Array.from({ length: count }, (_, i) => start + i);
};

/**
 * Top row: "Showing x–y of z" (left) + rows per page (right). Bottom row: centered page buttons.
 *
 * @param {Object} props
 * @param {number} props.page - Current page (1-based)
 * @param {number} props.totalPages
 * @param {number} props.total - Total record count
 * @param {number} props.pageSize
 * @param {(page: number) => void} props.setPage
 * @param {(size: number) => void} props.setPageSize
 * @param {number} props.shownCount - Rows on the current page
 * @param {number[]} [props.pageSizeOptions]
 * @param {string} [props.className] - e.g. 'rounded-none border-0 border-t' when placed inside a card
 */
export function TablePaginationV2({
  page,
  totalPages,
  total,
  pageSize,
  setPage,
  setPageSize,
  shownCount,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className = '',
}) {
  const isWide = useIsWide();

  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = total ? Math.min((page - 1) * pageSize + shownCount, total) : 0;
  const pages = pageWindow(page, Math.max(totalPages, 1), isWide ? 5 : 3);

  return (
    <div className={cn('space-y-3 rounded-lg border bg-card px-3 py-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm whitespace-nowrap text-muted-foreground">
          {total ? (
            <>
              Showing <span className="font-semibold text-foreground">{start}–{end}</span> of{' '}
              <span className="font-semibold text-foreground">{total}</span>
            </>
          ) : (
            'No results'
          )}
        </p>

        <div className="flex items-center gap-2 text-sm">
          <span className="whitespace-nowrap text-muted-foreground">
            <span className="hidden sm:inline">Rows per page</span>
            <span className="sm:hidden">Per page</span>
          </span>
          <Select value={pageSize} onValueChange={(v) => v && setPageSize(Number(v))}>
            <SelectTrigger
              aria-label="Rows per page"
              className={cn(FILTER_CONTROL_CLASS, 'h-8 w-20 data-[size=default]:h-8 sm:min-w-0')}
            >
              <span className="font-medium tabular-nums">{pageSize}</span>
            </SelectTrigger>
            <SelectContent side="top" className="min-w-24">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size} className="tabular-nums">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          className={cn(PAGE_BUTTON_CLASS, 'w-8 px-0')}
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPage(p)}
            className={cn(PAGE_BUTTON_CLASS, 'w-8', p === page && PAGE_BUTTON_ACTIVE_CLASS)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className={cn(PAGE_BUTTON_CLASS, 'w-8 px-0')}
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}

export default TablePaginationV2;
