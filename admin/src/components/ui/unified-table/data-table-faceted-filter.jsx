import React from 'react';
import { PlusCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Faceted Filter component for column multi-selection
 * @param {{
 *   column?: import('@tanstack/react-table').Column,
 *   title: string,
 *   options: { label: string, value: string, icon?: React.ComponentType<{ className?: string }> }[],
 *   className?: string
 * }} props
 */
export function DataTableFacetedFilter({ column, title, options = [], className }) {
  if (!column) return null;

  const facets = column.getFacetedUniqueValues ? column.getFacetedUniqueValues() : null;
  const selectedValues = new Set(column.getFilterValue() || []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn('h-9 border-dashed text-xs font-semibold cursor-pointer bg-card hover:bg-muted/50', className)}
          >
            <PlusCircle className="mr-1.5 size-3.5 text-muted-foreground" />
            <span>{title}</span>
            {selectedValues.size > 0 && (
              <>
                <div className="mx-1 h-3.5 w-px bg-border" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1.5 font-bold lg:hidden text-[10px]"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1.5 font-bold text-[10px]"
                    >
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="rounded-sm px-1.5 font-medium text-[10px]"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-52 bg-popover">
        <DropdownMenuLabel className="text-xs font-bold text-foreground">
          {title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-60 overflow-y-auto space-y-0.5">
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value);
            const count = facets?.get(option.value);

            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    selectedValues.add(option.value);
                  } else {
                    selectedValues.delete(option.value);
                  }
                  const filterValues = Array.from(selectedValues);
                  column.setFilterValue(
                    filterValues.length ? filterValues : undefined
                  );
                }}
                className="cursor-pointer text-xs"
              >
                {option.icon && (
                  <option.icon className="mr-2 size-3.5 text-muted-foreground" />
                )}
                <span className="flex-1 truncate">{option.label}</span>
                {count !== undefined && (
                  <span className="ml-auto flex size-4 items-center justify-center font-mono text-[10px] text-muted-foreground">
                    {count}
                  </span>
                )}
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => column.setFilterValue(undefined)}
              className="justify-center text-center text-xs font-medium text-destructive cursor-pointer"
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
