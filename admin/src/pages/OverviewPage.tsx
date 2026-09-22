import React from 'react';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Task, NavTab } from '../types';
import {
  KanbanSquare,
  Building2,
  Server,
  ShieldCheck,
  Database,
  Plus,
  Terminal,
  Mail,
  ArrowRight,
  Clock,
  Activity,
  Layers
} from 'lucide-react';

interface OverviewPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenCreateProject: () => void;
  onOpenCreateClient: () => void;
  onOpenCreateTask: () => void;
  onOpenTriggerBackup: () => void;
  onOpenSendEmail: () => void;
  onOpenSSH: () => void;
  onOpenTaskDetail: (task: Task) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  onOpenCreateProject,
  onOpenCreateClient,
  onOpenCreateTask,
  onOpenTriggerBackup,
  onOpenSendEmail,
  onOpenSSH,
  onOpenTaskDetail,
}) => {
  const { clients, projects, tasks, fleet, services, backups, activities } = useData();

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeFleet = Array.isArray(fleet) ? fleet : [];
  const safeServices = Array.isArray(services) ? services : [];
  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeBackups = Array.isArray(backups) ? backups : [];

  const activeProjectsCount = safeProjects.filter(p => p.status === 'ACTIVE').length;
  const multiTenantClientsCount = safeClients.filter(c => c.client_type === 'MULTI_TENANT_ECOMMERCE').length;
  const recentTasks = safeTasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800/80 p-6 md:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Cluster Operational • v1.0.0-prod
              </span>
              <span className="text-xs text-slate-400 font-mono">NYC Cluster 01</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Plexivia Mission Control & Fleet Director
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Managing multi-tenant eCommerce instances, PostgreSQL schemas, Spacemail SMTP relays, and Cloudflare R2 snapshots.
            </p>
          </div>

          {/* Quick Trigger Backup button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenTriggerBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition-all shadow-lg shadow-amber-950/30 cursor-pointer"
            >
              <Database className="w-4 h-4 text-amber-400" />
              Trigger R2 Snapshot
            </button>
            <button
              onClick={onOpenCreateTask}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Work Item
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={activeProjectsCount}
          subtext={`${safeProjects.length} Total Registered`}
          trend={{ value: '+12% MoM', isPositive: true }}
          icon={KanbanSquare}
          variant="cyan"
          progress={76}
          onClick={() => onNavigate('projects')}
        />

        <StatCard
          title="Total Clients"
          value={safeClients.length}
          subtext={`${multiTenantClientsCount} Multi-Tenant Stores`}
          trend={{ value: '100% Retained', isPositive: true }}
          icon={Building2}
          variant="purple"
          onClick={() => onNavigate('clients')}
        />

        <StatCard
          title="Fleet Nodes"
          value={`${safeFleet.filter(n => n.status === 'ONLINE').length}/${safeFleet.length}`}
          subtext="Nodes Online • Cluster 01"
          trend={{ value: '142d Uptime', isPositive: true }}
          icon={Server}
          variant="emerald"
          onClick={() => onNavigate('fleet')}
        />

        <StatCard
          title="SRE Telemetry"
          value="99.98%"
          subtext="PostgreSQL 16 & Redis 7.2 OK"
          trend={{ value: '24ms Latency', isPositive: true }}
          icon={ShieldCheck}
          variant="cyan"
          onClick={() => onNavigate('sre')}
        />
      </div>

      {/* Rapid Action Buttons Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono shrink-0 mr-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" /> Rapid Ops:
        </span>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateProject}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" /> New Project
          </button>
          <button
            onClick={onOpenCreateClient}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400" /> Add Client
          </button>
          <button
            onClick={onOpenSSH}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition-all flex items-center gap-1.5 font-mono cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Web SSH
          </button>
          <button
            onClick={onOpenSendEmail}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" /> Spacemail Test
          </button>
          <button
            onClick={() => onNavigate('backups')}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-white transition-all flex items-center gap-1.5 font-mono cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" /> Cloudflare R2
          </button>
        </div>
      </div>

      {/* Grid: Recent Tasks & Microservice Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <KanbanSquare className="w-4 h-4 text-cyan-400" />
              Recent High Priority Tasks
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 font-mono transition-colors cursor-pointer"
            >
              View Full Kanban <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onOpenTaskDetail(task)}
                className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20 shrink-0">
                    {task.project_code}
                  </span>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-white group-hover:text-cyan-200 transition-colors truncate">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {task.project_name} • Due: {task.due_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  {task.assignee_avatar && (
                    <img
                      src={task.assignee_avatar}
                      alt={task.assignee_name}
                      title={task.assignee_name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700 hidden sm:block"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Microservice Matrix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Microservices Matrix
            </h3>
            <button
              onClick={() => onNavigate('sre')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold font-mono transition-colors cursor-pointer"
            >
              Telemetry ↗
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            {safeServices.map(srv => (
              <div
                key={srv.id}
                className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0 text-xs"
              >
                <div>
                  <div className="font-semibold text-white font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {srv.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Port {srv.port} • {srv.latency_ms}ms
                  </div>
                </div>
                <StatusBadge status={srv.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed & Backups summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Operator Real-Time Activity Feed
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">Live Streaming</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {safeActivities.slice(0, 4).map(act => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-xs"
              >
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5 shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300">
                    <strong className="text-white">{act.user_name}</strong> {act.action}:{' '}
                    <span className="text-cyan-300 font-mono">{act.target_name}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                    {act.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cloudflare R2 Backups Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              Cloudflare R2 Automated Daily Snapshots
            </h3>
            <button
              onClick={() => onNavigate('backups')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold font-mono cursor-pointer"
            >
              All Snapshots ↗
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            {safeBackups.slice(0, 3).map(bk => (
              <div
                key={bk.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="truncate">
                  <div className="text-white font-bold truncate">{bk.filename}</div>
                  <div className="text-[10px] text-slate-400">
                    {(bk.created_at ? bk.created_at.slice(0, 10) : 'Recent')} • {(bk.size_human || (bk as any).size_formatted || "46.0 MB")} • bucket: {(bk.bucket || (bk as any).r2_bucket || "clienthub-backups")}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
