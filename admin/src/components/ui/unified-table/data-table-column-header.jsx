import React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Reusable Column Header with Sort toggles and Column control
 * @param {{ column: import('@tanstack/react-table').Column, title: string, className?: string, hideable?: boolean, pinnable?: boolean }} props
 */
export function DataTableColumnHeader({
  column,
  title,
  className,
  hideable = true,
  pinnable = false,
}) {
  if (!column.getCanSort() && !hideable && !pinnable) {
    return <div className={cn('text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();
  const isPinned = column.getIsPinned();

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                '-ml-3 h-8 data-[state=open]:bg-accent text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground',
                isSorted && 'text-primary font-bold'
              )}
            >
              <span>{title}</span>
              {isSorted === 'desc' ? (
                <ArrowDown className="ml-1.5 size-3.5 text-primary" />
              ) : isSorted === 'asc' ? (
                <ArrowUp className="ml-1.5 size-3.5 text-primary" />
              ) : (
                <ChevronsUpDown className="ml-1.5 size-3.5 opacity-50 hover:opacity-100" />
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-44 bg-popover">
          {column.getCanSort() && (
            <>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(false)}
                className="cursor-pointer text-xs"
              >
                <ArrowUp className="mr-2 size-3.5 text-muted-foreground/70" />
                Ascending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(true)}
                className="cursor-pointer text-xs"
              >
                <ArrowDown className="mr-2 size-3.5 text-muted-foreground/70" />
                Descending
              </DropdownMenuItem>
              {isSorted && (
                <DropdownMenuItem
                  onClick={() => column.clearSorting()}
                  className="cursor-pointer text-xs text-muted-foreground"
                >
                  <ChevronsUpDown className="mr-2 size-3.5 text-muted-foreground/70" />
                  Clear Sort
                </DropdownMenuItem>
              )}
            </>
          )}

          {pinnable && (
            <>
              <DropdownMenuSeparator />
              {isPinned !== 'left' && (
                <DropdownMenuItem
                  onClick={() => column.pin('left')}
                  className="cursor-pointer text-xs"
                >
                  <Pin className="mr-2 size-3.5 text-muted-foreground/70 rotate-45" />
                  Pin to Left
                </DropdownMenuItem>
              )}
              {isPinned !== 'right' && (
                <DropdownMenuItem
                  onClick={() => column.pin('right')}
                  className="cursor-pointer text-xs"
                >
                  <Pin className="mr-2 size-3.5 text-muted-foreground/70 -rotate-45" />
                  Pin to Right
                </DropdownMenuItem>
              )}
              {isPinned && (
                <DropdownMenuItem
                  onClick={() => column.pin(false)}
                  className="cursor-pointer text-xs text-muted-foreground"
                >
                  <PinOff className="mr-2 size-3.5 text-muted-foreground/70" />
                  Unpin
                </DropdownMenuItem>
              )}
            </>
          )}

          {hideable && column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => column.toggleVisibility(false)}
                className="cursor-pointer text-xs text-muted-foreground hover:text-destructive"
              >
                <EyeOff className="mr-2 size-3.5 text-muted-foreground/70" />
                Hide Column
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
