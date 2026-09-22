import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Polished DataTable Pagination Component
 * @param {{
 *   table: import('@tanstack/react-table').Table,
 *   pageSizeOptions?: number[],
 *   showSelectedCount?: boolean,
 *   showQuickJump?: boolean,
 *   className?: string
 * }} props
 */
export function DataTablePagination({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showSelectedCount = true,
  showQuickJump = true,
  className,
}) {
  const [jumpPage, setJumpPage] = useState('');

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount() || 1;
  const totalRows = table.getFilteredRowModel ? table.getFilteredRowModel().rows.length : table.getCoreRowModel().rows.length;
  const selectedRowsCount = table.getFilteredSelectedRowModel ? table.getFilteredSelectedRowModel().rows.length : 0;

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(jumpPage, 10);
    if (!isNaN(target) && target >= 1 && target <= pageCount) {
      table.setPageIndex(target - 1);
      setJumpPage('');
    }
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 px-3 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground', className)}>
      {/* Left side: Selection & Row Range counts */}
      <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-start">
        {showSelectedCount && selectedRowsCount > 0 ? (
          <div className="font-medium text-foreground bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg">
            {selectedRowsCount} of {totalRows} row(s) selected
          </div>
        ) : (
          <div>
            Showing <span className="font-semibold text-foreground">{startRow}</span> to{' '}
            <span className="font-semibold text-foreground">{endRow}</span> of{' '}
            <span className="font-semibold text-foreground">{totalRows}</span> entries
          </div>
        )}
      </div>

      {/* Right side: Page size, Pagination Buttons, Quick Jump */}
      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-end">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium whitespace-nowrap">Rows per page</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(val) => {
              table.setPageSize(Number(val));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs bg-background">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-popover">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current page index indicator */}
        <div className="flex items-center justify-center text-xs font-medium min-w-[90px]">
          Page {pageIndex + 1} of {pageCount}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex h-8 w-8 p-0 cursor-pointer"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="First page"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Previous page"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Next page"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex h-8 w-8 p-0 cursor-pointer"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            title="Last page"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>

        {/* Optional quick jump */}
        {showQuickJump && pageCount > 3 && (
          <form onSubmit={handleJumpSubmit} className="hidden md:flex items-center gap-1.5 pl-2 border-l border-border/80">
            <span className="text-[11px] text-muted-foreground">Go to:</span>
            <input
              type="number"
              min={1}
              max={pageCount}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder="#"
              className="h-7 w-11 rounded-md border border-input bg-background px-1.5 text-center text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>
        )}
      </div>
    </div>
  );
}
