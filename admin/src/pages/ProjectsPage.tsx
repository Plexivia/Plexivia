import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Project, ProjectStatus } from '../types';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  RefreshCw,
  Building,
  User,
  Activity
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects, clients, refreshAll, loading } = useData();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeClients = Array.isArray(clients) ? clients : [];

  const filteredProjects = useMemo(() => {
    return safeProjects.filter((p) => {
      const matchSearch =
        (p.project_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.project_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.client_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [safeProjects, searchQuery, statusFilter]);

  const totalProjects = safeProjects.length;
  const activeProjects = safeProjects.filter((p) => p.status === 'ACTIVE').length;
  const planningProjects = safeProjects.filter((p) => p.status === 'PLANNING').length;
  const completedProjects = safeProjects.filter((p) => p.status === 'COMPLETED').length;

  const getStatusBadge = (status?: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'PLANNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            PLANNING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            COMPLETED
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            MAINTENANCE
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            ARCHIVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            {status || 'UNKNOWN'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              Projects Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Client projects, deployment targets, sprint velocity, and deliverables tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => refreshAll()}
            title="Refresh Projects"
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Total Projects</span>
            <FolderKanban className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalProjects}
          </div>
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium">
            <span>Active Projects</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
            {activeProjects}
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-mono font-medium">
            <span>Planning</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-800 dark:text-purple-300">
            {planningProjects}
          </div>
        </div>

        <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-cyan-700 dark:text-cyan-400 text-xs font-mono font-medium">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-800 dark:text-cyan-300">
            {completedProjects}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name, code, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'ACTIVE', 'PLANNING', 'COMPLETED', 'MAINTENANCE', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              {st} {st !== 'ALL' && `(${safeProjects.filter((p) => p.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => {
          const client = safeClients.find((c) => c.id === p.client_id);
          const progress = p.progress_percent || 0;

          return (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header: Project Code & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {p.project_code || 'PRJ'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors mt-0.5">
                      {p.project_name}
                    </h3>
                  </div>
                  {getStatusBadge(p.status)}
                </div>

                {/* Client info */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{p.client_name || client?.business_name || 'Direct Client'}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Meta details: Lead, Due Date */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {p.lead_name && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lead:</span>
                      </span>
                      <strong className="text-slate-900 dark:text-slate-200">{p.lead_name}</strong>
                    </div>
                  )}

                  {p.due_date && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due Date:</span>
                      </span>
                      <strong className="text-slate-900 dark:text-slate-200">
                        {(() => {
                          try {
                            const d = new Date(p.due_date);
                            return isNaN(d.getTime()) ? p.due_date : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                          } catch {
                            return p.due_date;
                          }
                        })()}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom links */}
              {(p.production_url || p.git_repo_url) && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
                  {p.git_repo_url ? (
                    <a
                      href={p.git_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-500 hover:text-cyan-500 transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Repository</span>
                    </a>
                  ) : <div />}

                  {p.production_url && (
                    <a
                      href={p.production_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
                    >
                      <span>Live App</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
            No projects match your filter or search query.
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
};

export default ProjectsPage;
