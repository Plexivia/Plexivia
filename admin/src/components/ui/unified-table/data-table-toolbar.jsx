import React from 'react';
import {
  Search,
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  Maximize2,
  Minimize2,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableViewOptions } from './data-table-view-options';
import { exportTableToCSV, exportTableToJSON } from './export-utils';

/**
 * Top Toolbar with Search, Filters, Column Visibility, Density, and Export
 * @param {{
 *   table: import('@tanstack/react-table').Table,
 *   searchPlaceholder?: string,
 *   searchKey?: string,
 *   globalFilter?: string,
 *   setGlobalFilter?: (val: string) => void,
 *   facetedFilters?: Array<{
 *     columnId: string,
 *     title: string,
 *     options: Array<{ label: string, value: string, icon?: any }>
 *   }>,
 *   enableExport?: boolean,
 *   exportFilename?: string,
 *   enableDensity?: boolean,
 *   density?: 'compact' | 'normal' | 'relaxed',
 *   setDensity?: (val: 'compact' | 'normal' | 'relaxed') => void,
 *   bulkActions?: Array<{
 *     label: string,
 *     icon?: any,
 *     variant?: string,
 *     onClick: (selectedRows: any[]) => void
 *   }>,
 *   customActions?: React.ReactNode,
 *   className?: string
 * }} props
 */
export function DataTableToolbar({
  table,
  searchPlaceholder = 'Search records...',
  searchKey,
  globalFilter,
  setGlobalFilter,
  facetedFilters = [],
  enableExport = true,
  exportFilename = 'records-export',
  enableDensity = true,
  density = 'normal',
  setDensity,
  bulkActions = [],
  customActions,
  className,
}) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    Boolean(globalFilter) ||
    Boolean(searchKey && table.getColumn(searchKey)?.getFilterValue());

  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleSearchChange = (value) => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value);
    } else if (setGlobalFilter) {
      setGlobalFilter(value);
    } else {
      table.setGlobalFilter(value);
    }
  };

  const currentSearchValue =
    (searchKey
      ? table.getColumn(searchKey)?.getFilterValue()
      : globalFilter ?? table.getState().globalFilter) ?? '';

  const handleResetFilters = () => {
    table.resetColumnFilters();
    if (setGlobalFilter) {
      setGlobalFilter('');
    } else {
      table.setGlobalFilter('');
    }
  };

  return (
    <div className="space-y-2">
      {/* Primary Toolbar Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={currentSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs bg-card border-border/80 rounded-xl"
            />
            {currentSearchValue && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Faceted Filters will be rendered from outside or via props */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="h-9 px-2.5 lg:px-3 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
            >
              Reset
              <X className="ml-1.5 size-3.5" />
            </Button>
          )}
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2">
          {/* Custom Action Slot */}
          {customActions}

          {/* Density Toggle */}
          {enableDensity && setDensity && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 hidden md:flex items-center gap-1 text-xs font-semibold cursor-pointer border-border/80 bg-card hover:bg-muted/50"
                  >
                    {density === 'compact' ? (
                      <Minimize2 className="size-3.5 text-muted-foreground" />
                    ) : (
                      <Maximize2 className="size-3.5 text-muted-foreground" />
                    )}
                    <span className="capitalize">{density}</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-32 bg-popover">
                <DropdownMenuItem
                  onClick={() => setDensity('compact')}
                  className="text-xs cursor-pointer"
                >
                  Compact
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDensity('normal')}
                  className="text-xs cursor-pointer"
                >
                  Normal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDensity('relaxed')}
                  className="text-xs cursor-pointer"
                >
                  Relaxed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export Dropdown */}
          {enableExport && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-semibold cursor-pointer border-border/80 bg-card hover:bg-muted/50"
                  >
                    <Download className="size-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem
                  onClick={() =>
                    exportTableToCSV(table, `${exportFilename}.csv`, {
                      onlySelected: false,
                    })
                  }
                  className="text-xs cursor-pointer"
                >
                  <FileSpreadsheet className="mr-2 size-3.5 text-emerald-600" />
                  Export All (CSV)
                </DropdownMenuItem>
                {hasSelection && (
                  <DropdownMenuItem
                    onClick={() =>
                      exportTableToCSV(table, `${exportFilename}-selected.csv`, {
                        onlySelected: true,
                      })
                    }
                    className="text-xs cursor-pointer font-semibold text-primary"
                  >
                    <FileSpreadsheet className="mr-2 size-3.5 text-primary" />
                    Export Selected ({selectedRows.length})
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    exportTableToJSON(table, `${exportFilename}.json`, {
                      onlySelected: false,
                    })
                  }
                  className="text-xs cursor-pointer"
                >
                  <FileCode className="mr-2 size-3.5 text-sky-600" />
                  Export All (JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Column Visibility Options */}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Selected Rows Bulk Action Floating Bar */}
      {hasSelection && (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs transition-all animate-in fade-in">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CheckSquare className="size-4 text-primary" />
            <span>{selectedRows.length} item(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => action.onClick(selectedRows.map((r) => r.original))}
                className="h-7 text-xs font-semibold cursor-pointer gap-1.5"
              >
                {action.icon && <action.icon className="size-3.5" />}
                {action.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetRowSelection()}
              className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
