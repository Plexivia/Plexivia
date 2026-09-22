import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg';
}

export function Card({ className = '', size = 'default', ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        'group/card bg-card text-card-foreground border border-border/80 flex flex-col gap-4 overflow-hidden rounded-xl p-5 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-colors',
        className
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className = '', ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex items-center justify-between gap-2 pb-1',
        className
      )}
      {...props}
    />
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  icon?: React.ElementType | null;
}

export function CardTitle({ className = '', icon: Icon = null, children, ...props }: CardTitleProps) {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-base font-semibold text-foreground flex items-center gap-2', className)}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-primary shrink-0 inline-flex" />}
      {children}
    </h3>
  );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className = '', ...props }: CardDescriptionProps) {
  return <p data-slot="card-description" className={cn('text-muted-foreground text-xs', className)} {...props} />;
}

export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardAction({ className = '', ...props }: CardActionProps) {
  return <div data-slot="card-action" className={cn('flex items-center gap-2', className)} {...props} />;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className = '', ...props }: CardContentProps) {
  return <div data-slot="card-content" className={cn('', className)} {...props} />;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className = '', ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center pt-3 border-t border-border', className)}
      {...props}
    />
  );
}

export default Card;
