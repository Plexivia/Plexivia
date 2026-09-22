import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = '',
  onClick,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 border-border/80 hover:border-primary/50 hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </span>
          {icon && (
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </span>
        </div>

        {(trend || subtitle) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded',
                  trend.isPositive === true && 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-400',
                  trend.isPositive === false && 'text-red-700 bg-red-500/10 dark:text-red-400',
                  trend.isPositive === undefined && 'text-muted-foreground bg-muted'
                )}
              >
                {trend.isPositive === true && <ArrowUpRight className="w-3.5 h-3.5" />}
                {trend.isPositive === false && <ArrowDownRight className="w-3.5 h-3.5" />}
                {trend.isPositive === undefined && <Minus className="w-3.5 h-3.5" />}
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-muted-foreground truncate">{subtitle}</span>
            )}
            {trend?.label && !subtitle && (
              <span className="text-muted-foreground truncate">{trend.label}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
