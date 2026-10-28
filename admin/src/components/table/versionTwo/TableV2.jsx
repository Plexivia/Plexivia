import React from 'react';
import { AlertCircle, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Stops a click inside a cell from also triggering the row click
const stop = (e) => e.stopPropagation();

const ALIGN_CLASS = { left: '', center: 'text-center', right: 'text-right' };

// Row "..." menu built from a list of { label, icon, onClick, destructive, separatorBefore } items
function RowActions({ items }) {
  const visible = items.filter((item) => item && !item.hidden);
  if (visible.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
        aria-label="Actions"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {visible.map((item, idx) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.label + idx}>
              {item.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={item.destructive ? 'destructive' : undefined}
                onClick={item.onClick}
                className="cursor-pointer"
              >
                {Icon && <Icon className={item.destructive ? undefined : 'text-muted-foreground'} />} {item.label}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Version two data table: fixed column widths, primary-tinted header, skeleton loading,
 * empty/error states, optional row selection, row click and a "..." actions menu.
 *
 * @param {Object} props
 * @param {Array<{key: string, header: React.ReactNode, className?: string, align?: 'left'|'center'|'right',
 *   cellClassName?: string, render?: (row) => React.ReactNode, skeleton?: React.ReactNode, stopClick?: boolean}>} props.columns
 *   Column definitions. `className` sets the <col> width (e.g. 'w-[140px]'); leave it empty for the flexible column.
 * @param {Array<Object>} props.rows - Rows for the current page
 * @param {(row) => string} [props.getRowId] - Unique id per row (defaults to row.id || row._id)
 * @param {boolean} [props.isLoading]
 * @param {Error|string|null} [props.error] - Shows an error alert instead of the table
 * @param {string} [props.emptyText]
 * @param {(row) => void} [props.onRowClick]
 * @param {{ids: string[], toggle: (id, checked) => void, setMany: (ids, checked) => void}} [props.selection]
 * @param {(row) => Array<Object>} [props.rowActions] - Items for the row "..." menu
 * @param {string} [props.minWidth] - Table min width class, e.g. 'min-w-[960px]'
 * @param {number} [props.skeletonRows]
 */
export function TableV2({
  columns,
  rows,
  getRowId = (row) => row.id || row._id,
  isLoading = false,
  error = null,
  emptyText = 'No records found.',
  onRowClick,
  selection = null,
  rowActions,
  minWidth = 'min-w-[960px]',
  skeletonRows = 6,
  className = '',
}) {
  if (error) {
    return (
      <Alert variant="destructive" className="m-4 w-auto">
        <AlertCircle className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error instanceof Error ? error.message : String(error)}</AlertDescription>
      </Alert>
    );
  }

  const allColumns = [
    ...(selection ? [{ key: '__select', className: 'w-12' }] : []),
    ...columns,
    ...(rowActions ? [{ key: '__actions', className: 'w-20' }] : []),
  ];

  const pageIds = rows.map(getRowId);
  const selectedOnPage = selection ? pageIds.filter((id) => selection.ids.includes(id)).length : 0;
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  return (
    <Table className={cn(minWidth, 'table-fixed [&_td]:py-2.5 [&_th]:text-primary dark:[&_th]:text-foreground/90', className)}>
      <colgroup>
        {allColumns.map((col) => (
          <col key={col.key} className={col.className} />
        ))}
      </colgroup>

      <TableHeader className="bg-primary/10 dark:bg-primary/15 [&_tr]:border-primary/20">
        <TableRow className="hover:bg-transparent">
          {selection && (
            <TableHead className="pr-0 pl-4">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={pageIds.length === 0}
                onCheckedChange={(checked) => selection.setMany(pageIds, Boolean(checked))}
                aria-label="Select all rows on this page"
              />
            </TableHead>
          )}
          {columns.map((col, idx) => (
            <TableHead
              key={col.key}
              className={cn(
                'text-sm font-semibold normal-case tracking-normal',
                ALIGN_CLASS[col.align || 'left'],
                !selection && idx === 0 && 'pl-4'
              )}
            >
              {col.header}
            </TableHead>
          ))}
          {rowActions && <TableHead className="pr-4 text-right text-sm font-semibold normal-case tracking-normal">Actions</TableHead>}
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          Array.from({ length: skeletonRows }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              {selection && (
                <TableCell className="pl-4">
                  <Skeleton className="size-4 rounded" />
                </TableCell>
              )}
              {columns.map((col, idx) => (
                <TableCell key={col.key} className={cn(!selection && idx === 0 && 'pl-4')}>
                  {col.skeleton || <Skeleton className={cn('h-4 w-3/4', col.align === 'right' && 'ml-auto', col.align === 'center' && 'mx-auto')} />}
                </TableCell>
              ))}
              {rowActions && (
                <TableCell className="pr-4">
                  <Skeleton className="ml-auto size-8 rounded-md" />
                </TableCell>
              )}
            </TableRow>
          ))
        ) : rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={allColumns.length} className="h-28 text-center text-muted-foreground">
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => {
            const id = getRowId(row);
            const isSelected = selection ? selection.ids.includes(id) : false;

            return (
              <TableRow
                key={id}
                data-state={isSelected ? 'selected' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && 'cursor-pointer', isSelected && 'bg-primary/5 hover:bg-primary/10')}
              >
                {selection && (
                  <TableCell className="pr-0 pl-4" onClick={stop}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => selection.toggle(id, Boolean(checked))}
                      aria-label="Select row"
                    />
                  </TableCell>
                )}
                {columns.map((col, idx) => (
                  <TableCell
                    key={col.key}
                    onClick={col.stopClick ? stop : undefined}
                    className={cn(
                      'overflow-hidden',
                      ALIGN_CLASS[col.align || 'left'],
                      !selection && idx === 0 && 'pl-4',
                      col.cellClassName
                    )}
                  >
                    {col.render ? col.render(row) : (
                      <span className="block truncate text-foreground" title={String(row[col.key] ?? '')}>
                        {row[col.key] ?? '—'}
                      </span>
                    )}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell className="pr-4 text-right" onClick={stop}>
                    <RowActions items={rowActions(row)} />
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

export default TableV2;
