import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { Task, TaskStatus } from '../types';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import {
  Plus,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  TrendingUp,
  Sparkles,
  Filter,
  RefreshCw
} from 'lucide-react';

export const ProjectsKanbanPage: React.FC = () => {
  const { tasks, projects, refreshAll, loading } = useData();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('TODO');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');

  const handleOpenCreate = (status?: TaskStatus) => {
    setCreateStatus(status || 'TODO');
    setIsCreateOpen(true);
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Filter by selected project chip
  const displayedTasks = useMemo(() => {
    if (selectedProjectFilter === 'ALL') return safeTasks;
    return safeTasks.filter(t => t.project_id === selectedProjectFilter);
  }, [safeTasks, selectedProjectFilter]);

  // Telemetry & Quick Counters Stats
  const totalTasks = displayedTasks.length;
  const inProgressTasks = displayedTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = displayedTasks.filter(t => t.status === 'IN_REVIEW').length;
  const doneTasks = displayedTasks.filter(t => t.status === 'DONE').length;
  const criticalTasks = displayedTasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length;
  
  const totalLoggedHours = displayedTasks.reduce((acc, t) => acc + (t.logged_hours || 0), 0);
  const totalEstHours = displayedTasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-sm shadow-cyan-500/50" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              Plexivia Issue Hub & Kanban
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Multi-Tenant Client Project Task Boards • Real-Time Sprint Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refreshAll()}
            title="Refresh Tasks"
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold font-mono transition cursor-pointer shadow-xs"
          >
            <FolderKanban className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => handleOpenCreate('TODO')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Tasks */}
        <div className="p-3 bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-mono">
            <span>Total Tasks</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{totalTasks}</div>
        </div>

        {/* In Progress */}
        <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 backdrop-blur-sm border border-cyan-200/80 dark:border-cyan-500/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-cyan-700 dark:text-cyan-400 text-[11px] font-mono font-medium">
            <span>In Progress</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-800 dark:text-cyan-300">{inProgressTasks}</div>
        </div>

        {/* In Review */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 backdrop-blur-sm border border-purple-200/80 dark:border-purple-500/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-[11px] font-mono font-medium">
            <span>In Review</span>
            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-800 dark:text-purple-300">{inReviewTasks}</div>
        </div>

        {/* Completed */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 backdrop-blur-sm border border-emerald-200/80 dark:border-emerald-500/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-[11px] font-mono font-medium">
            <span>Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
            {doneTasks} <span className="text-xs text-emerald-600 dark:text-emerald-500 font-normal">({completionRate}%)</span>
          </div>
        </div>

        {/* Critical Blockers */}
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 backdrop-blur-sm border border-rose-200/80 dark:border-rose-500/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-[11px] font-mono font-medium">
            <span>Critical / Blocker</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-800 dark:text-rose-300">{criticalTasks}</div>
        </div>

        {/* Logged Hours */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 backdrop-blur-sm border border-indigo-200/80 dark:border-indigo-500/20 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 text-[11px] font-mono font-medium">
            <span>Logged Hours</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-800 dark:text-indigo-300">
            {Math.round(totalLoggedHours)}h{' '}
            <span className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-normal">/ {totalEstHours}h</span>
          </div>
        </div>
      </div>

      {/* Project Switcher Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedProjectFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition shrink-0 cursor-pointer shadow-xs ${
            selectedProjectFilter === 'ALL'
              ? 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-400/60 dark:border-cyan-500/40'
              : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Projects ({safeTasks.length})
        </button>

        {safeProjects.map(proj => {
          const count = safeTasks.filter(t => t.project_id === proj.id).length;
          const isSelected = selectedProjectFilter === proj.id;
          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectFilter(proj.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition shrink-0 cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-400/60 dark:border-cyan-500/40'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="font-bold text-slate-900 dark:text-slate-300">{proj.project_code}</span>
              <span className="text-slate-600 dark:text-slate-400 max-w-[120px] truncate">{proj.project_name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modern Kanban Board & List Switcher */}
      <KanbanBoard
        tasks={displayedTasks}
        onOpenTaskDetail={setSelectedTask}
        onOpenCreateTask={handleOpenCreate}
      />

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultStatus={createStatus}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};
