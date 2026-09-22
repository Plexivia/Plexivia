import React from 'react';
import { UserRole, TaskPriority, TaskStatus, ClientType, ClientStatus, NodeStatus, ServiceStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  const dotStyles = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    indigo: 'bg-indigo-400',
    purple: 'bg-purple-400',
    slate: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide uppercase font-mono ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
};

export const RoleBadge: React.FC<{ role?: UserRole | string }> = ({ role = 'DEV' }) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return <Badge variant="rose" dot>Super Admin</Badge>;
    case 'PM':
      return <Badge variant="purple" dot>Project Mgr</Badge>;
    case 'DEV':
      return <Badge variant="cyan" dot>Developer</Badge>;
    case 'DESIGNER':
      return <Badge variant="amber" dot>UI/UX Designer</Badge>;
    case 'SRE':
      return <Badge variant="emerald" dot>SRE / DevOps</Badge>;
    default:
      return <Badge variant="slate">{role}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority?: TaskPriority }> = ({ priority = 'MEDIUM' }) => {
  switch (priority) {
    case 'CRITICAL':
      return <Badge variant="rose" dot>Critical</Badge>;
    case 'HIGH':
      return <Badge variant="amber" dot>High</Badge>;
    case 'MEDIUM':
      return <Badge variant="cyan">Medium</Badge>;
    case 'LOW':
      return <Badge variant="slate">Low</Badge>;
    default:
      return <Badge variant="slate">Medium</Badge>;
  }
};

export const StatusBadge: React.FC<{ status?: TaskStatus | ClientStatus | NodeStatus | ServiceStatus | string }> = ({ status = 'ACTIVE' }) => {
  switch (status) {
    case 'ACTIVE':
    case 'ONLINE':
    case 'HEALTHY':
    case 'DONE':
      return <Badge variant="emerald" dot>{String(status).replace('_', ' ')}</Badge>;
    case 'IN_PROGRESS':
    case 'DEPLOYING':
    case 'ONBOARDING':
      return <Badge variant="cyan" dot>{String(status).replace('_', ' ')}</Badge>;
    case 'IN_REVIEW':
    case 'WARNING':
    case 'DEGRADED':
    case 'PLANNING':
    case 'TODO':
      return <Badge variant="amber" dot>{String(status).replace('_', ' ')}</Badge>;
    case 'BACKLOG':
    case 'PAUSED':
    case 'MAINTENANCE':
    case 'ARCHIVED':
    case 'INACTIVE':
      return <Badge variant="slate">{String(status).replace('_', ' ')}</Badge>;
    case 'DOWN':
    case 'OFFLINE':
      return <Badge variant="rose" dot>{String(status)}</Badge>;
    default:
      return <Badge variant="slate">{String(status)}</Badge>;
  }
};

export const TenantTypeBadge: React.FC<{ type?: ClientType; sharedDb?: boolean }> = ({ type = 'SINGLE_TENANT', sharedDb }) => {
  if (type === 'MULTI_TENANT_ECOMMERCE') {
    return (
      <Badge variant="purple" dot>
        Multi-Tenant {sharedDb ? '(Shared DB)' : ''}
      </Badge>
    );
  }
  return <Badge variant="indigo">Single-Tenant</Badge>;
};

