import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', label, error, helperText, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          'flex h-9 w-full min-w-0 rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground shadow-2xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm',
          error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
          className
        )}
        {...props}
      />
    );

    if (label || error || helperText) {
      return (
        <div className="w-full space-y-1.5">
          {label && (
            <label className="text-xs font-semibold text-foreground/80 tracking-wide">
              {label}
            </label>
          )}
          {inputElement}
          {error && <p className="text-xs text-destructive">{error}</p>}
          {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className = '', label, error, children, ...props }, ref) => {
    const selectElement = (
      <select
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );

    if (label || error) {
      return (
        <div className="w-full space-y-1.5">
          {label && (
            <label className="text-xs font-semibold text-foreground/80 tracking-wide">
              {label}
            </label>
          )}
          {selectElement}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );
    }

    return selectElement;
  }
);

NativeSelect.displayName = 'NativeSelect';

export const Select = NativeSelect;

export default Input;
