import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button } from './button';
import { UnifiedDataTable } from './unified-table';

function Table({ className, ...props }) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-b border-border', className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return <tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

function TableFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn('p-3 align-middle whitespace-nowrap text-xs sm:text-sm [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }) {
  return <caption data-slot="table-caption" className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />;
}

function SimpleDataTable({
  columns = [],
  data = [],
  pagination = true,
  itemsPerPage = 10,
  className = '',
  ...props
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = pagination ? (data || []).slice(startIndex, startIndex + itemsPerPage) : data || [];

  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={cn('px-4 py-3', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground">
              {currentData.length > 0 ? (
                currentData.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-muted/30 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={cn('px-4 py-3 text-xs sm:text-sm', col.className)}>
                        {col.cell ? col.cell(row) : row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length || 1} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-muted-foreground/40" />
                      <span className="text-sm font-medium">No records found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-foreground">
                {Math.min(startIndex + itemsPerPage, (data || []).length)}
              </span>{' '}
              of <span className="font-semibold text-foreground">{(data || []).length}</span> entries
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>Prev</span>
              </Button>
              <span className="px-2 text-xs font-medium text-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 px-2 text-xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const DataTable = ({
  columns = [],
  data = [],
  pagination = true,
  itemsPerPage = 10,
  className = '',
  ...props
}) => {
  const isTanStackDef = columns.some((c) => c.accessorKey || c.accessorFn || typeof c.header === 'function');
  if (isTanStackDef) {
    return (
      <UnifiedDataTable
        columns={columns}
        data={data}
        enablePagination={pagination}
        pageSize={itemsPerPage}
        className={className}
        {...props}
      />
    );
  }
  return (
    <SimpleDataTable
      columns={columns}
      data={data}
      pagination={pagination}
      itemsPerPage={itemsPerPage}
      className={className}
      {...props}
    />
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  UnifiedDataTable,
};

export * from './unified-table';
export default Table;
