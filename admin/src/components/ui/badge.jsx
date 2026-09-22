import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all select-none [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-rose-500/15 text-rose-600 border-rose-500/25',
        danger: 'bg-rose-500/15 text-rose-600 border-rose-500/25',
        error: 'bg-rose-500/15 text-rose-600 border-rose-500/25',
        warning: 'bg-rose-500/15 text-rose-600 border-rose-500/25',
        cancel: 'bg-rose-500/15 text-rose-600 border-rose-500/25',
        delete: 'bg-rose-500/15 text-rose-600 border-rose-500/25',
        outline: 'border-border text-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground',
        success: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
        info: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant = 'default', ...props }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
export default Badge;
