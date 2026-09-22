import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  "group/button focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        outline:
          'border-border bg-background text-foreground hover:bg-muted hover:text-foreground shadow-xs',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-muted text-foreground hover:text-foreground',
        destructive:
          'bg-destructive hover:bg-destructive/90 text-white shadow-xs',
        danger:
          'bg-destructive hover:bg-destructive/90 text-white shadow-xs',
        error:
          'bg-destructive hover:bg-destructive/90 text-white shadow-xs',
        delete:
          'bg-destructive hover:bg-destructive/90 text-white shadow-xs',
        cancel:
          'bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 shadow-xs cursor-pointer',
        close:
          'bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 shadow-xs cursor-pointer',
        previous:
          'bg-muted text-foreground hover:bg-muted/80 border border-border shadow-xs cursor-pointer font-semibold',
        back:
          'bg-muted text-foreground hover:bg-muted/80 border border-border shadow-xs cursor-pointer font-semibold',
        warning:
          'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
        reset:
          'bg-muted hover:bg-muted/80 text-foreground shadow-xs',
        success:
          'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
        info:
          'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
        link: 'text-primary underline-offset-4 hover:underline cursor-pointer',
      },
      size: {
        default: 'h-9 gap-1.5 px-4 text-xs font-semibold rounded-xl',
        xs: 'h-6 gap-1 rounded-md px-2 text-[11px]',
        sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs font-medium',
        lg: 'h-10 gap-2 rounded-xl px-5 text-sm font-bold',
        icon: 'size-9 rounded-xl',
        'icon-xs': 'size-6 rounded-md',
        'icon-sm': 'size-8 rounded-lg',
        'icon-lg': 'size-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ElementType | null;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      icon: Icon = null,
      iconPosition = 'left',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon />}
        {children}
        {Icon && iconPosition === 'right' && <Icon />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
