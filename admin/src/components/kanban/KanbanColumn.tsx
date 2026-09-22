import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { KanbanCard } from './KanbanCard';
import { Plus, X, Sparkles, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  accentColor: string;
  badgeColor: string;
  onOpenDetail: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  label,
  tasks,
  accentColor,
  badgeColor,
  onOpenDetail,
  onStatusChange,
  onAddTask,
}) => {
  const { createTask, projects, users } = useData();
  const [isInlineAdding, setIsInlineAdding] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlinePriority, setInlinePriority] = useState<TaskPriority>('MEDIUM');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only leave if exiting the main column
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const defaultProj = safeProjects[0];
      const defaultUser = safeUsers[0];

      await createTask({
        project_id: defaultProj?.id || 'p-1',
        project_name: defaultProj?.project_name || 'Multi-Tenant Storefront',
        project_code: defaultProj?.project_code || 'PX-01',
        assignee_id: defaultUser?.id || 'u-1',
        assignee_name: defaultUser?.full_name || 'Admin',
        assignee_avatar: defaultUser?.avatar,
        title: inlineTitle.trim(),
        description: '',
        status,
        priority: inlinePriority,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        estimated_hours: 4,
        estimate_points: 3,
        logged_hours: 0,
        tags: ['Feature'],
        checklist: [],
      });

      setInlineTitle('');
      setIsInlineAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col min-w-[300px] w-full max-w-[360px] bg-slate-100/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border transition-all duration-200 p-3 shadow-xs ${
        isDragOver
          ? 'border-cyan-500 dark:border-cyan-400/80 bg-cyan-50 dark:bg-cyan-950/20 ring-2 ring-cyan-500/30'
          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accentColor} shadow-sm`} />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {label}
          </h3>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${badgeColor}`}
          >
            {safeTasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsInlineAdding(prev => !prev)}
            title={`Quick add to ${label}`}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Quick Add Task Composer */}
      {isInlineAdding && (
        <form
          onSubmit={handleInlineSubmit}
          className="mb-3 p-3 bg-white dark:bg-slate-950 border border-cyan-500/40 rounded-xl space-y-2.5 shadow-md animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              + Quick Inline Task
            </span>
            <button
              type="button"
              onClick={() => setIsInlineAdding(false)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            autoFocus
            required
            value={inlineTitle}
            onChange={e => setInlineTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setIsInlineAdding(false);
            }}
            placeholder="Task title (Press Enter to submit)..."
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <select
              value={inlinePriority}
              onChange={e => setInlinePriority(e.target.value as TaskPriority)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-mono text-cyan-700 dark:text-cyan-300 focus:outline-none"
            >
              <option value="CRITICAL">🚨 Critical</option>
              <option value="HIGH">🔥 High</option>
              <option value="MEDIUM">⚡ Medium</option>
              <option value="LOW">☕ Low</option>
            </select>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsInlineAdding(false);
                  onAddTask(status);
                }}
                className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                More Fields
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !inlineTitle.trim()}
                className="flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-[11px] font-bold font-mono transition disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Add
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Cards Scrollable Container */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[380px] max-h-[calc(100vh-270px)] pr-1 scrollbar-thin">
        {safeTasks.map(task => (
          <KanbanCard
            key={task.id}
            task={task}
            onOpenDetail={onOpenDetail}
            onStatusChange={onStatusChange}
          />
        ))}

        {safeTasks.length === 0 && (
          <div className="h-44 border border-dashed border-slate-300 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-center p-4 bg-white/50 dark:bg-slate-950/20">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 font-mono">No tasks in this lane</p>
            <button
              onClick={() => setIsInlineAdding(true)}
              className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold cursor-pointer"
            >
              + Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Column Footer: Quick Add Button */}
      <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800/60">
        <button
          onClick={() => setIsInlineAdding(true)}
          className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-white dark:hover:bg-slate-850 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] font-semibold">Add Task</span>
        </button>
      </div>
    </div>
  );
};
