import { HeaderTitle } from '@/components/common/HeaderTitle';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
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
  Activity,
  Trash2
} from 'lucide-react';

// Render agency projects management directory and status dashboard
export const ProjectsPage: React.FC = () => {
  const { projects, clients, deleteProject, refreshAll, loading } = useData();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeClients = Array.isArray(clients) ? clients : [];

  const totalProjects = safeProjects.length;
  const activeProjects = safeProjects.filter((p) => p.status === 'ACTIVE').length;
  const planningProjects = safeProjects.filter((p) => p.status === 'PLANNING').length;
  const completedProjects = safeProjects.filter((p) => p.status === 'COMPLETED').length;

  // Render status badge element for project status
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

  const clientName = (p: any) =>
    p.client_name || safeClients.find((c: any) => c.id === (p.client_id || p.client_dId))?.business_name || 'Direct Client';

  const formatDue = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      id: 'project',
      accessorFn: (p: any) => `${p.project_name || p.name || ''} ${p.project_code || p.dId || ''}`,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Project" />,
      cell: ({ row }: any) => {
        const p = row.original;
        return (
          <div className="min-w-0">
            <div className="font-bold text-foreground truncate">{p.project_name || p.name}</div>
            <div className="text-[11px] font-mono font-bold text-primary">{p.project_code || p.dId || 'PRJ'}</div>
          </div>
        );
      },
    },
    {
      id: 'client',
      accessorFn: (p: any) => clientName(p),
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Client" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ row }: any) => (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Building className="size-3.5 shrink-0" />
          <span className="truncate">{clientName(row.original)}</span>
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ row }: any) => getStatusBadge(row.original.status),
    },
    {
      id: 'progress',
      accessorFn: (p: any) => p.progress_percent ?? p.progress ?? 0,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Progress" />,
      cell: ({ getValue }: any) => (
        <div className="flex min-w-[120px] items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-sky-500" style={{ width: `${getValue()}%` }} />
          </div>
          <span className="w-9 text-right font-mono text-xs font-bold text-foreground">{getValue()}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'lead_name',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Lead" />,
      cell: ({ getValue }: any) => <span className="text-muted-foreground">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'due_date',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Due Date" />,
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{formatDue(getValue())}</span>,
    },
    {
      id: 'links',
      header: 'Links',
      enableSorting: false,
      cell: ({ row }: any) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3 text-xs">
            {p.git_repo_url && (
              <a href={p.git_repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <GitBranch className="size-3.5" /> Repo
              </a>
            )}
            {p.production_url && (
              <a href={p.production_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-bold text-primary hover:underline">
                Live <ExternalLink className="size-3" />
              </a>
            )}
            {!p.git_repo_url && !p.production_url && <span className="text-muted-foreground">—</span>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }: any) => (
        <button
          onClick={() => deleteProject(row.original.id || row.original.dId)}
          title="Delete Project"
          className="rounded-lg bg-rose-600 p-1.5 text-white transition hover:bg-rose-500 cursor-pointer"
        >
          <Trash2 className="size-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <HeaderTitle
        icon={FolderKanban}
        title="Projects Management"
        onRefresh={refreshAll}
        actions={
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold font-mono shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        }
      />

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

      <UnifiedDataTable
        columns={columns}
        data={safeProjects}
        isLoading={loading && safeProjects.length === 0}
        searchPlaceholder="Search projects by name, code, or client..."
        facetedFilters={[
          {
            columnId: 'status',
            title: 'Status',
            options: ['ACTIVE', 'PLANNING', 'COMPLETED', 'MAINTENANCE', 'ARCHIVED'].map((v) => ({ label: v, value: v })),
          },
          {
            columnId: 'client',
            title: 'Client',
            options: Array.from(new Set(safeProjects.map(clientName).filter(Boolean))).map((v) => ({ label: v, value: v })),
          },
        ]}
        exportFilename="projects"
        emptyTitle="No projects found"
        emptyDescription="No projects match your filter or search query."
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
};

export default ProjectsPage;
