import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  subtitle,
  icon: Icon,
  badgeColor = 'blue',
  progress,
  className = '',
}) => {
  const iconBgClasses = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  };

  return (
    <Card className={cn('p-5 border border-border/80 shadow-xs hover:border-border transition-all group', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-bold text-foreground tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div
            className={cn(
              'size-9 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-2xs',
              iconBgClasses[badgeColor] || iconBgClasses.blue
            )}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-y-2 gap-x-2 text-xs">
        {trend && (
          <div className="flex items-center gap-1 font-medium">
            {trendType === 'up' && (
              <span className="inline-flex items-center text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/20">
                <TrendingUp className="w-3 h-3 mr-1" />
                {trend}
              </span>
            )}
            {trendType === 'down' && (
              <span className="inline-flex items-center text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full text-[11px] font-medium border border-rose-500/20">
                <TrendingDown className="w-3 h-3 mr-1" />
                {trend}
              </span>
            )}
            {trendType === 'neutral' && (
              <span className="inline-flex items-center text-muted-foreground bg-muted px-2 py-0.5 rounded-full text-[11px] font-medium border border-border">
                {trend}
              </span>
            )}
          </div>
        )}
        {subtitle && <span className="text-muted-foreground text-[11px] truncate max-w-[180px]">{subtitle}</span>}
      </div>

      {typeof progress === 'number' && (
        <div className="mt-3 w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              progress > 80 ? 'bg-emerald-500' : progress > 50 ? 'bg-primary' : 'bg-amber-500'
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </Card>
  );
};

export default StatCard;
