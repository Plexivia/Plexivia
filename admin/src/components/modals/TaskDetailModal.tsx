import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Task, TaskStatus, TaskPriority, TaskChecklistItem, TaskComment } from '../../types';
import { useData } from '../../context/DataContext';
import { apiClient } from '../../services/api';
import {
  Play,
  Square,
  CheckSquare,
  Clock,
  Trash2,
  Save,
  Plus,
  Calendar,
  Sparkles,
  MessageSquare,
  Activity,
  User,
  Tag,
  FolderKanban,
  Check,
  AlertCircle,
  X,
  Send,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const {
    users,
    projects,
    updateTask,
    deleteTask,
    startTimer,
    stopTimer,
    activeTimer,
    createTimeLog,
    timeLogs,
  } = useData();

  const safeUsers = Array.isArray(users) ? users : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const activeUser = apiClient.getActiveUser();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'TODO');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'MEDIUM');
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || '');
  const [projectId, setProjectId] = useState(task?.project_id || '');
  const [estimatePoints, setEstimatePoints] = useState<number>(task?.estimate_points || 3);
  const [estimatedHours, setEstimatedHours] = useState<number>(task?.estimated_hours || 8);
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [tags, setTags] = useState<string[]>(Array.isArray(task?.tags) ? task.tags : []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Subtasks Checklist
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>(
    Array.isArray(task?.checklist) ? task.checklist : []
  );
  const [newChecklistText, setNewChecklistText] = useState('');

  // Comments & Activity
  const [activeTab, setActiveTab] = useState<'comments' | 'activity' | 'timelogs'>('comments');
  const [comments, setComments] = useState<TaskComment[]>(
    Array.isArray(task?.comments) ? task.comments : []
  );
  const [newCommentText, setNewCommentText] = useState('');

  // Manual Time Log Form
  const [showTimeLogForm, setShowTimeLogForm] = useState(false);
  const [manualTimeMinutes, setManualTimeMinutes] = useState(60);
  const [manualTimeNotes, setManualTimeNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state whenever task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'TODO');
      setPriority(task.priority || 'MEDIUM');
      setAssigneeId(task.assignee_id || '');
      setProjectId(task.project_id || '');
      setEstimatePoints(task.estimate_points ?? 3);
      setEstimatedHours(task.estimated_hours ?? 8);
      setDueDate(task.due_date || '');
      setTags(Array.isArray(task.tags) ? task.tags : []);
      setChecklist(Array.isArray(task.checklist) ? task.checklist : []);
      setComments(Array.isArray(task.comments) ? task.comments : []);
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setShowTimeLogForm(false);
      setNewChecklistText('');
      setNewCommentText('');
    }
  }, [task]);

  if (!task) return null;

  const isTimerActive = activeTimer?.taskId === task.id;

  // Checklist calculations
  const safeChecklist = Array.isArray(checklist) ? checklist : [];
  const completedCount = safeChecklist.filter(c => c.completed).length;
  const progressPercent =
    safeChecklist.length > 0 ? Math.round((completedCount / safeChecklist.length) * 100) : 0;

  // Relevant Time Logs for this task
  const taskTimeLogs = (Array.isArray(timeLogs) ? timeLogs : []).filter(
    tl => tl.task_id === task.id
  );
  const totalLoggedHours = task.logged_hours || 0;

  const isOverdue =
    task.status !== 'DONE' &&
    Boolean(dueDate) &&
    new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  // Handlers for Checklist
  const toggleChecklistItem = async (chkId: string) => {
    const updated = safeChecklist.map(item =>
      item.id === chkId ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    await updateTask(task.id, { checklist: updated });
  };

  const addChecklistItem = async () => {
    if (!newChecklistText.trim()) return;
    const newItem: TaskChecklistItem = {
      id: 'chk-' + Date.now(),
      text: newChecklistText.trim(),
      completed: false,
    };
    const updated = [...safeChecklist, newItem];
    setChecklist(updated);
    setNewChecklistText('');
    await updateTask(task.id, { checklist: updated });
  };

  const deleteChecklistItem = async (chkId: string) => {
    const updated = safeChecklist.filter(item => item.id !== chkId);
    setChecklist(updated);
    await updateTask(task.id, { checklist: updated });
  };

  // Handlers for Comments
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: TaskComment = {
      id: 'cm-' + Date.now(),
      user_id: activeUser.id,
      user_name: activeUser.full_name || 'Admin Specialist',
      user_avatar: activeUser.avatar,
      content: newCommentText.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setNewCommentText('');
    await updateTask(task.id, { comments: updatedComments });
  };

  const handleDeleteComment = async (commentId: string) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    await updateTask(task.id, { comments: updatedComments });
  };

  // Handlers for Properties Update
  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    await updateTask(task.id, { status: newStatus });
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setPriority(newPriority);
    await updateTask(task.id, { priority: newPriority });
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    setAssigneeId(newAssigneeId);
    const selectedUser = safeUsers.find(u => u.id === newAssigneeId);
    await updateTask(task.id, {
      assignee_id: newAssigneeId,
      assignee_name: selectedUser?.full_name || 'Unassigned',
      assignee_avatar: selectedUser?.avatar,
    });
  };

  const handleProjectChange = async (newProjectId: string) => {
    setProjectId(newProjectId);
    const selectedProject = safeProjects.find(p => p.id === newProjectId);
    await updateTask(task.id, {
      project_id: newProjectId,
      project_name: selectedProject?.project_name || task.project_name,
      project_code: selectedProject?.project_code || task.project_code,
    });
  };

  const handlePointsChange = async (points: number) => {
    setEstimatePoints(points);
    await updateTask(task.id, { estimate_points: points });
  };

  const handleDueDateChange = async (date: string) => {
    setDueDate(date);
    await updateTask(task.id, { due_date: date });
  };

  const handleEstimatedHoursChange = async (hours: number) => {
    setEstimatedHours(hours);
    await updateTask(task.id, { estimated_hours: hours });
  };

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      const updatedTags = [...tags, cleanTag];
      setTags(updatedTags);
      await updateTask(task.id, { tags: updatedTags });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    setTags(updatedTags);
    await updateTask(task.id, { tags: updatedTags });
  };

  const handleSaveTitle = async () => {
    if (!title.trim()) return;
    setIsEditingTitle(false);
    await updateTask(task.id, { title: title.trim() });
  };

  const handleSaveDescription = async () => {
    setIsEditingDesc(false);
    await updateTask(task.id, { description });
  };

  const handleManualTimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTimeMinutes <= 0) return;

    await createTimeLog({
      task_id: task.id,
      task_title: task.title,
      project_id: projectId || task.project_id,
      project_name: task.project_name,
      user_id: activeUser.id,
      user_name: activeUser.full_name,
      duration_minutes: Number(manualTimeMinutes),
      date: new Date().toISOString().split('T')[0],
      billable: true,
      notes: manualTimeNotes || 'Manual engineering session',
    });

    setShowTimeLogForm(false);
    setManualTimeNotes('');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      await deleteTask(task.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.project_name || 'Plexivia Issue Hub'}
      subtitle={`${task.project_code || 'PX-01'} • Task ID: ${task.id}`}
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 -mt-2">
        {/* LEFT COLUMN: Main Issue Details, Subtasks, Activity / Comments (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Quick Actions & Title */}
          <div className="space-y-3">
            {/* Title Block */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-cyan-500 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none shadow-2xs"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
                className="text-lg font-bold text-slate-900 dark:text-white leading-snug hover:text-cyan-600 dark:hover:text-cyan-200 transition cursor-pointer flex items-center gap-2 group"
              >
                <span>{task.title}</span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition">
                  (edit)
                </span>
              </h2>
            )}

            {/* Project Code & Tags Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-950/60 border border-cyan-400/30 dark:border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                {task.project_code || 'PX-01'}
              </span>

              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 dark:hover:text-rose-400 text-slate-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}

              {isAddingTag ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="tag..."
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTag();
                      if (e.key === 'Escape') setIsAddingTag(false);
                    }}
                    className="w-20 px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-cyan-500 rounded text-[10px] text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-mono font-semibold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingTag(true)}
                  className="text-[10px] font-mono text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add tag</span>
                </button>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
                <span>Description</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  if (isEditingDesc) handleSaveDescription();
                  else setIsEditingDesc(true);
                }}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-mono cursor-pointer font-semibold"
              >
                {isEditingDesc ? 'Save Description' : 'Edit Text'}
              </button>
            </div>

            {isEditingDesc ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide technical specifications, edge cases, acceptance criteria..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-cyan-500/80 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none shadow-2xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingDesc(false)}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    className="px-4 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[70px]">
                {task.description || (
                  <span className="text-slate-400 italic">No description specified for this issue.</span>
                )}
              </div>
            )}
          </div>

          {/* Subtasks / Checklist Section */}
          <div className="space-y-3 p-4 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Subtasks / Acceptance Criteria</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                  ({completedCount}/{safeChecklist.length} completed • {progressPercent}%)
                </span>
              </h4>
            </div>

            {/* Animated Progress Bar */}
            {safeChecklist.length > 0 && (
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2">
              {safeChecklist.map(item => (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                    item.completed
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-400/30 dark:border-emerald-500/20 text-slate-500 dark:text-slate-400'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs'
                  }`}
                >
                  <div
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-center gap-2.5 flex-1 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                        item.completed
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'border-slate-400 dark:border-slate-600 hover:border-cyan-500'
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs ${
                        item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addChecklistItem()}
                placeholder="Add subtask requirement..."
                className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Activity / Comments Stream Tabs */}
          <div className="space-y-4 pt-2">
            {/* Tabs Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold transition cursor-pointer ${
                    activeTab === 'comments'
                      ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 pb-2 -mb-2'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({comments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('timelogs')}
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold transition cursor-pointer ${
                    activeTab === 'timelogs'
                      ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 pb-2 -mb-2'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time Logs ({taskTimeLogs.length})</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                Created: {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            {/* Comments Tab View */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* Comment Composer */}
                <form onSubmit={handleAddComment} className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    {activeUser.avatar ? (
                      <img
                        src={activeUser.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700 shrink-0 mt-1"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-300 dark:ring-slate-700 shrink-0 mt-1">
                        {activeUser.full_name?.charAt(0) || 'A'}
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <textarea
                        rows={2}
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleAddComment(e);
                          }
                        }}
                        placeholder="Write a comment or status update (Ctrl+Enter to post)..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none shadow-2xs"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          Supports multi-line feedback
                        </span>
                        <button
                          type="submit"
                          disabled={!newCommentText.trim()}
                          className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold font-mono transition disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Comment</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comment Feed Stream */}
                <div className="space-y-3 pt-2">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div
                        key={comment.id}
                        className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 shadow-2xs"
                      >
                        {comment.user_avatar ? (
                          <img
                            src={comment.user_avatar}
                            alt={comment.user_name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700 shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-300 dark:ring-slate-700 shrink-0 mt-0.5">
                            {comment.user_name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                                {comment.user_name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                {new Date(comment.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition text-[10px] cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-50/60 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      No comments posted yet. Start the conversation above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Time Logs Tab View */}
            {activeTab === 'timelogs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    Logged: <strong className="text-cyan-700 dark:text-cyan-400">{totalLoggedHours}h</strong> /{' '}
                    {estimatedHours}h
                  </span>
                  <button
                    onClick={() => setShowTimeLogForm(!showTimeLogForm)}
                    className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer font-semibold"
                  >
                    + Add Session
                  </button>
                </div>

                <div className="space-y-2">
                  {taskTimeLogs.length > 0 ? (
                    taskTimeLogs.map(log => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 text-xs shadow-2xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{log.notes || 'Engineering Work'}</div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {log.user_name} • {log.date}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">
                          {log.duration_minutes || log.minutes || 0} mins
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-50/60 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      No discrete time logs recorded yet for this task.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Property Inspector Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 h-fit shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono">
            Properties
          </h3>

          {/* Status Picker */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400">Status</label>
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-2xs"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Priority Picker */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400">Priority</label>
            <select
              value={priority}
              onChange={e => handlePriorityChange(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold font-mono text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-2xs"
            >
              <option value="CRITICAL">🚨 Critical</option>
              <option value="HIGH">🔥 High</option>
              <option value="MEDIUM">⚡ Medium</option>
              <option value="LOW">☕ Low</option>
            </select>
          </div>

          {/* Assignee Picker */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400">Assignee</label>
            <select
              value={assigneeId}
              onChange={e => handleAssigneeChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-2xs"
            >
              <option value="">Unassigned</option>
              {safeUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Project Target */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400">Target Project</label>
            <select
              value={projectId}
              onChange={e => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 shadow-2xs"
            >
              {safeProjects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.project_code} • {p.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* Story Points & Estimate */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1">
                Story Points
              </label>
              <select
                value={estimatePoints}
                onChange={e => handlePointsChange(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono text-indigo-700 dark:text-indigo-300 font-bold focus:outline-none shadow-2xs"
              >
                <option value={1}>1 pt</option>
                <option value={2}>2 pts</option>
                <option value={3}>3 pts</option>
                <option value={5}>5 pts</option>
                <option value={8}>8 pts</option>
                <option value={13}>13 pts</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={estimatedHours}
                onChange={e => handleEstimatedHoursChange(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* Target Due Date */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400">Target Due Date</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={dueDate}
                onChange={e => handleDueDateChange(e.target.value)}
                className={`w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none shadow-2xs ${
                  isOverdue ? 'border-rose-500/80 text-rose-600 dark:text-rose-300' : 'border-slate-200 dark:border-slate-700/80'
                }`}
              />
            </div>
            {isOverdue && (
              <span className="text-[10px] text-rose-500 dark:text-rose-400 font-mono block">
                ⚠️ Past due deadline
              </span>
            )}
          </div>

          {/* Time Tracking Widget */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5">
            <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Time Tracker
            </label>

            <button
              onClick={() => {
                if (isTimerActive) {
                  stopTimer('Tracked task session');
                } else {
                  startTimer(task);
                }
              }}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                isTimerActive
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 dark:border-amber-500/40 animate-pulse'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
            >
              {isTimerActive ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                  <span>Stop Active Timer ({activeTimer?.seconds || 0}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Start Live Timer</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowTimeLogForm(!showTimeLogForm)}
              className="w-full py-1.5 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition cursor-pointer shadow-2xs"
            >
              {showTimeLogForm ? 'Close Manual Log' : '+ Manual Log Entry'}
            </button>

            {/* Manual Form */}
            {showTimeLogForm && (
              <form
                onSubmit={handleManualTimeLog}
                className="p-3 bg-white dark:bg-slate-900 border border-cyan-500/40 rounded-xl space-y-2 animate-fade-in shadow-md"
              >
                <div>
                  <label className="block text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-0.5">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={720}
                    value={manualTimeMinutes}
                    onChange={e => setManualTimeMinutes(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-0.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={manualTimeNotes}
                    onChange={e => setManualTimeNotes(e.target.value)}
                    placeholder="e.g. Unit tests"
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold font-mono transition cursor-pointer"
                >
                  Save Log
                </button>
              </form>
            )}
          </div>

          {/* Delete Action */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Work Item</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
