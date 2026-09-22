import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { useData } from '../../context/DataContext';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
  CheckSquare,
  Clock,
  Calendar,
  Play,
  Square,
  AlertCircle,
  Sparkles,
  ChevronDown,
  X,
  Plus,
  ArrowRight,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onOpenTaskDetail: (task: Task) => void;
  onOpenCreateTask: (status?: TaskStatus) => void;
  onOpenCreateProject?: () => void;
  defaultView?: 'board' | 'list';
  searchQuery?: string;
  selectedProject?: string;
  selectedPriority?: string;
  selectedAssignee?: string;
  selectedStatus?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onOpenTaskDetail,
  onOpenCreateTask,
  defaultView = 'board',
  searchQuery: externalSearch = '',
  selectedProject: externalProject = 'ALL',
  selectedPriority: externalPriority = 'ALL',
  selectedAssignee: externalAssignee = 'ALL',
  selectedStatus: externalStatus = 'ALL',
}) => {
  const { updateTaskStatus, deleteTask, startTimer, stopTimer, activeTimer, projects, users } = useData();
  const [viewMode, setViewMode] = useState<'board' | 'list'>(defaultView);
  const [internalSearch, setInternalSearch] = useState('');
  const [internalPriority, setInternalPriority] = useState('ALL');
  const [internalAssignee, setInternalAssignee] = useState('ALL');
  const [internalStatus, setInternalStatus] = useState('ALL');
  const [internalProject, setInternalProject] = useState('ALL');
  const [groupByStatus, setGroupByStatus] = useState(true);

  // Sync or merge search/filter props if provided
  const search = externalSearch || internalSearch;
  const projectFilter = externalProject !== 'ALL' ? externalProject : internalProject;
  const priorityFilter = externalPriority !== 'ALL' ? externalPriority : internalPriority;
  const assigneeFilter = externalAssignee !== 'ALL' ? externalAssignee : internalAssignee;
  const statusFilter = externalStatus !== 'ALL' ? externalStatus : internalStatus;

  const columns: {
    status: TaskStatus;
    label: string;
    accentColor: string;
    badgeColor: string;
  }[] = [
    {
      status: 'BACKLOG',
      label: 'Backlog',
      accentColor: 'bg-slate-500',
      badgeColor: 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400',
    },
    {
      status: 'TODO',
      label: 'To Do',
      accentColor: 'bg-amber-500',
      badgeColor: 'bg-amber-500/15 dark:bg-amber-950/40 border-amber-400/30 dark:border-amber-500/30 text-amber-700 dark:text-amber-300',
    },
    {
      status: 'IN_PROGRESS',
      label: 'In Progress',
      accentColor: 'bg-cyan-500',
      badgeColor: 'bg-cyan-500/15 dark:bg-cyan-950/40 border-cyan-400/30 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300',
    },
    {
      status: 'IN_REVIEW',
      label: 'In Review',
      accentColor: 'bg-purple-500',
      badgeColor: 'bg-purple-500/15 dark:bg-purple-950/40 border-purple-400/30 dark:border-purple-500/30 text-purple-700 dark:text-purple-300',
    },
    {
      status: 'DONE',
      label: 'Done',
      accentColor: 'bg-emerald-500',
      badgeColor: 'bg-emerald-500/15 dark:bg-emerald-950/40 border-emerald-400/30 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    },
  ];

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return safeTasks.filter(task => {
      // Keyword search
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchDesc = (task.description || '').toLowerCase().includes(q);
        const matchCode = (task.project_code || '').toLowerCase().includes(q);
        const matchProj = (task.project_name || '').toLowerCase().includes(q);
        const matchAssignee = (task.assignee_name || '').toLowerCase().includes(q);
        const matchTags = Array.isArray(task.tags) && task.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCode && !matchProj && !matchAssignee && !matchTags) {
          return false;
        }
      }

      // Project filter
      if (projectFilter !== 'ALL' && task.project_id !== projectFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== 'ALL' && task.assignee_id !== assigneeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [safeTasks, search, projectFilter, priorityFilter, assigneeFilter, statusFilter]);

  const hasActiveFilters =
    internalSearch !== '' ||
    internalPriority !== 'ALL' ||
    internalAssignee !== 'ALL' ||
    internalStatus !== 'ALL' ||
    internalProject !== 'ALL';

  const resetFilters = () => {
    setInternalSearch('');
    setInternalPriority('ALL');
    setInternalAssignee('ALL');
    setInternalStatus('ALL');
    setInternalProject('ALL');
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar + View Switcher */}
      <div className="p-3 bg-white dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Keyword Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={internalSearch}
              onChange={e => setInternalSearch(e.target.value)}
              placeholder="Search tasks, codes, tags..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition"
            />
            {internalSearch && (
              <button
                onClick={() => setInternalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project Filter */}
          <select
            value={internalProject}
            onChange={e => setInternalProject(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:border-cyan-500/80 shadow-2xs"
          >
            <option value="ALL">All Projects</option>
            {safeProjects.map(p => (
              <option key={p.id} value={p.id}>
                {p.project_code} • {p.project_name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={internalPriority}
            onChange={e => setInternalPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:border-cyan-500/80 shadow-2xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">🚨 Critical</option>
            <option value="HIGH">🔥 High</option>
            <option value="MEDIUM">⚡ Medium</option>
            <option value="LOW">☕ Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={internalAssignee}
            onChange={e => setInternalAssignee(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none focus:border-cyan-500/80 shadow-2xs"
          >
            <option value="ALL">All Assignees</option>
            {safeUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.full_name} ({u.role})
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 rounded-xl text-xs font-mono transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Controls: View Switcher (Board vs List) */}
        <div className="flex items-center gap-2">
          {viewMode === 'list' && (
            <button
              onClick={() => setGroupByStatus(prev => !prev)}
              className="text-[11px] font-mono px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              {groupByStatus ? 'Ungroup' : 'Group by Lane'}
            </button>
          )}

          <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('board')}
              title="Board View"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Board View */}
      {viewMode === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {columns.map(col => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              accentColor={col.accentColor}
              badgeColor={col.badgeColor}
              tasks={filteredTasks.filter(t => t.status === col.status)}
              onOpenDetail={onOpenTaskDetail}
              onStatusChange={updateTaskStatus}
              onAddTask={onOpenCreateTask}
            />
          ))}
        </div>
      )}

      {/* Modern High-Density List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {groupByStatus ? (
            columns.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.status);
              return (
                <div
                  key={col.status}
                  className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs"
                >
                  {/* Status Group Header */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.accentColor}`} />
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {col.label}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${col.badgeColor}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenCreateTask(col.status)}
                      className="flex items-center gap-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition cursor-pointer font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Task List Table */}
                  {colTasks.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800/50">
                      {colTasks.map(task => (
                        <TaskListItem
                          key={task.id}
                          task={task}
                          onOpenDetail={onOpenTaskDetail}
                          onStatusChange={updateTaskStatus}
                          onDelete={deleteTask}
                          activeTimer={activeTimer}
                          startTimer={startTimer}
                          stopTimer={stopTimer}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 font-mono">
                      No tasks in this lane
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs divide-y divide-slate-200 dark:divide-slate-800/50">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onOpenDetail={onOpenTaskDetail}
                    onStatusChange={updateTaskStatus}
                    onDelete={deleteTask}
                    activeTimer={activeTimer}
                    startTimer={startTimer}
                    stopTimer={stopTimer}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No tasks matching the selected filters
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TaskListItemProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  activeTimer: any;
  startTimer: (task: Task) => void;
  stopTimer: (notes?: string) => Promise<void>;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  onOpenDetail,
  onStatusChange,
  onDelete,
  activeTimer,
  startTimer,
  stopTimer,
}) => {
  const isCurrentTimerActive = activeTimer?.taskId === task.id;
  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const completedChecklist = checklist.filter(c => c.completed).length;
  const totalChecklist = checklist.length;
  const checklistPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const isOverdue =
    task.status !== 'DONE' &&
    Boolean(task.due_date) &&
    new Date(task.due_date || '').getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <div
      onClick={() => onOpenDetail(task)}
      className="group px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/80 transition-colors cursor-pointer text-left"
    >
      {/* Left: Code, Priority, Title, Checklist */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Project Code */}
        <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-400/30 dark:border-cyan-500/30 px-2 py-0.5 rounded-md shrink-0">
          {task.project_code || 'PX-01'}
        </span>

        {/* Priority */}
        <div className="shrink-0" onClick={e => e.stopPropagation()}>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Title & Tags */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors truncate">
              {task.title}
            </h4>
            {task.estimate_points !== undefined && (
              <span className="text-[9px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-400/30 dark:border-indigo-500/20 px-1.5 py-0.2 rounded shrink-0">
                {task.estimate_points}pt
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400/80 truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Meta & Actions */}
      <div className="flex items-center gap-4 shrink-0" onClick={e => e.stopPropagation()}>
        {/* Checklist */}
        {totalChecklist > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <CheckSquare className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>
              {completedChecklist}/{totalChecklist} ({checklistPercent}%)
            </span>
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <div
            className={`hidden md:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded ${
              isOverdue
                ? 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 font-semibold'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50'
            }`}
          >
            {isOverdue ? <AlertCircle className="w-3 h-3 text-rose-500 dark:text-rose-400" /> : <Calendar className="w-3 h-3" />}
            <span>{task.due_date}</span>
          </div>
        )}

        {/* Status Dropdown */}
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 shadow-2xs"
        >
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        {/* Assignee Avatar */}
        {task.assignee_avatar ? (
          <img
            src={task.assignee_avatar}
            alt={task.assignee_name || 'Assignee'}
            title={`Assigned to ${task.assignee_name}`}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
          />
        ) : (
          <div
            title={`Assigned to ${task.assignee_name || 'Unassigned'}`}
            className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-300 dark:ring-slate-700"
          >
            {(task.assignee_name || 'U').charAt(0)}
          </div>
        )}

        {/* Quick Timer Button */}
        <button
          onClick={() => {
            if (isCurrentTimerActive) {
              stopTimer('List view stop');
            } else {
              startTimer(task);
            }
          }}
          title={isCurrentTimerActive ? 'Stop Active Timer' : 'Start Timer'}
          className={`p-1.5 rounded-lg border transition cursor-pointer ${
            isCurrentTimerActive
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-400 dark:border-emerald-500/40 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
          }`}
        >
          {isCurrentTimerActive ? (
            <Square className="w-3 h-3 fill-emerald-500 dark:fill-emerald-400" />
          ) : (
            <Play className="w-3 h-3" />
          )}
        </button>

        {/* Delete button */}
        <button
          onClick={() => {
            if (window.confirm(`Delete task "${task.title}"?`)) {
              onDelete(task.id);
            }
          }}
          title="Delete task"
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
