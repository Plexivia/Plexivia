import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'purple' | 'amber' | 'rose';
  progress?: number;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  variant = 'cyan',
  progress,
  onClick,
}) => {
  const variantMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(56,189,248,0.15)]',
      progress: 'bg-cyan-500',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(52,211,153,0.15)]',
      progress: 'bg-emerald-500',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      progress: 'bg-purple-500',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(251,191,36,0.15)]',
      progress: 'bg-amber-500',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      progress: 'bg-rose-500',
    },
  };

  const style = variantMap[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-slate-900/60 dark:bg-slate-900/80 border ${
        style.border
      } p-5 backdrop-blur-md transition-all duration-300 ${style.glow} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border border-white/5 ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold font-mono ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtext && <p className="mt-1 text-xs text-slate-400 font-mono">{subtext}</p>}

      {typeof progress === 'number' && (
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${style.progress} transition-all duration-500`}
              style={{ width: Math.min(100, Math.max(0, progress)) + '%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
