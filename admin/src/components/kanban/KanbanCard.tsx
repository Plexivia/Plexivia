import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { useData } from '../../context/DataContext';
import {
  Clock,
  CheckSquare,
  Play,
  Square,
  Calendar,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onOpenDetail,
  onStatusChange,
}) => {
  const { startTimer, stopTimer, activeTimer } = useData();
  const [isDragging, setIsDragging] = useState(false);

  const isCurrentTimerActive = activeTimer?.taskId === task.id;

  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const completedChecklist = checklist.filter(c => c.completed).length;
  const totalChecklist = checklist.length;
  const checklistPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const isOverdue =
    task.status !== 'DONE' &&
    Boolean(task.due_date) &&
    new Date(task.due_date || '').getTime() < new Date().setHours(0, 0, 0, 0);

  const isDueToday =
    task.status !== 'DONE' &&
    Boolean(task.due_date) &&
    new Date(task.due_date || '').toDateString() === new Date().toDateString();

  const statuses: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
  const currentIndex = statuses.indexOf(task.status);
  const assigneeName = task.assignee_name || 'Unassigned';

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onOpenDetail(task)}
      className={`group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850 border rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer text-left space-y-2.5 select-none ${
        isDragging
          ? 'opacity-40 border-dashed border-cyan-500 scale-95'
          : isCurrentTimerActive
          ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-slate-900 ring-1 ring-emerald-500/30'
          : 'border-slate-200 dark:border-slate-800/90 hover:border-cyan-500/50'
      }`}
    >
      {/* Top Meta: Project Identifier Badge, Estimate Points & Priority */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold font-mono tracking-wider text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-950/50 border border-cyan-400/30 dark:border-cyan-500/30 px-2 py-0.5 rounded-md truncate">
            {task.project_code || 'PX-01'}
          </span>
          {task.estimate_points !== undefined && (
            <span
              title={`${task.estimate_points} Story Points`}
              className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-400/30 dark:border-indigo-500/30 px-1.5 py-0.5 rounded"
            >
              <Sparkles className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
              {task.estimate_points}pt
            </span>
          )}
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition-colors line-clamp-2 leading-snug">
        {task.title}
      </h4>

      {/* Description Snippet if available */}
      {task.description && (
        <p className="text-[11px] text-slate-600 dark:text-slate-400/90 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {Array.isArray(task.tags) && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800/50 text-slate-500">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Checklist Progress Bar & Items */}
      {totalChecklist > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>
                {completedChecklist}/{totalChecklist} Subtasks
              </span>
            </span>
            <span className={completedChecklist === totalChecklist ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
              {checklistPercent}%
            </span>
          </div>
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                completedChecklist === totalChecklist ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: `${checklistPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Footer: Due Date, Assignee Avatar, Timer, and Quick Status Controls */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        {/* Left Side: Assignee Avatar + Due Date */}
        <div className="flex items-center gap-2 min-w-0">
          {task.assignee_avatar ? (
            <img
              src={task.assignee_avatar}
              alt={assigneeName}
              title={`Assigned to ${assigneeName}`}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700 shrink-0"
            />
          ) : (
            <div
              title={`Assigned to ${assigneeName}`}
              className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-300 dark:ring-slate-700 shrink-0"
            >
              {assigneeName.charAt(0)}
            </div>
          )}

          {task.due_date && (
            <div
              className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isOverdue
                  ? 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 font-semibold'
                  : isDueToday
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40'
              }`}
              title={isOverdue ? 'Overdue' : `Due: ${task.due_date}`}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0" />
              ) : (
                <Calendar className="w-3 h-3 shrink-0" />
              )}
              <span>{task.due_date.slice(5)}</span>
            </div>
          )}

          <div
            className="flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400"
            title={`Time Logged: ${task.logged_hours || 0}h of ${task.estimated_hours || 0}h estimate`}
          >
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>{task.logged_hours || 0}h</span>
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          {/* Quick Play/Stop Timer */}
          <button
            onClick={() => {
              if (isCurrentTimerActive) {
                stopTimer('Kanban card stop');
              } else {
                startTimer(task);
              }
            }}
            title={isCurrentTimerActive ? 'Stop Active Timer' : 'Start Timer on Task'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
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

          {/* Shift Left Lane */}
          {currentIndex > 0 && (
            <button
              onClick={() => onStatusChange(task.id, statuses[currentIndex - 1])}
              title={`Move to ${statuses[currentIndex - 1].replace('_', ' ')}`}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}

          {/* Shift Right Lane */}
          {currentIndex < statuses.length - 1 && (
            <button
              onClick={() => onStatusChange(task.id, statuses[currentIndex + 1])}
              title={`Move to ${statuses[currentIndex + 1].replace('_', ' ')}`}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
