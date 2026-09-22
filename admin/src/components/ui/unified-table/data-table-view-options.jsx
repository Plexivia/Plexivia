import React from 'react';
import { SlidersHorizontal, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * View Options dropdown to toggle column visibility
 * @param {{ table: import('@tanstack/react-table').Table }} props
 */
export function DataTableViewOptions({ table }) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== 'undefined' && column.getCanHide()
    );

  if (columns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-9 gap-1.5 lg:flex text-xs font-semibold cursor-pointer border-border/80 bg-card hover:bg-muted/50"
          >
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <span>Columns</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52 bg-popover">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-xs font-bold text-foreground">
            Toggle Columns
          </DropdownMenuLabel>
          <div className="flex gap-2">
            <button
              onClick={() => table.toggleAllColumnsVisible(true)}
              className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
            >
              Show All
            </button>
            <span className="text-muted-foreground text-[10px]">|</span>
            <button
              onClick={() => table.toggleAllColumnsVisible(false)}
              className="text-[10px] text-muted-foreground hover:text-destructive font-semibold cursor-pointer"
            >
              Hide All
            </button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-60 overflow-y-auto space-y-0.5">
          {columns.map((column) => {
            const headerTitle =
              typeof column.columnDef.header === 'string'
                ? column.columnDef.header
                : column.id;
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize text-xs cursor-pointer"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {headerTitle}
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
