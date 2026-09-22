import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TimeLog } from '../types';
import { Timer, Clock, Play, Pause, Square, Plus, Calendar, Trash2 } from 'lucide-react';

export const TimeTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, projects, timeLogs, activeTimer, startTimer, pauseTimer, resumeTimer, stopTimer, createTimeLog } = useData();
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeTimeLogs = Array.isArray(timeLogs) ? timeLogs : [];

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    const t = safeTasks.find(x => x.id === selectedTaskId);
    await createTimeLog({
      task_id: selectedTaskId,
      task_title: t?.title || 'General Task',
      project_id: t?.project_id || '',
      project_name: t?.project_name || 'Project',
      user_id: user?.id || '',
      user_name: user?.full_name || 'Team Member',
      minutes: Number(durationMinutes),
      duration_minutes: Number(durationMinutes),
      date: logDate,
      logged_at: new Date().toISOString(),
      notes: notes.trim()
    });
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-mono">Agency Time Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">Live task stopwatch and client project billing hours</p>
        </div>
      </div>

      {/* Active Stopwatch Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase font-bold font-mono text-cyan-400">Current Active Timer</span>
          <div className="text-4xl font-extrabold text-white font-mono mt-1">
            {formatTimer(activeTimer?.seconds || 0)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activeTimer ? `Tracking: ${activeTimer.taskTitle}` : 'No stopwatch currently running'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTimer?.isRunning ? (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold transition"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : activeTimer ? (
            <button
              onClick={resumeTimer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold transition"
            >
              <Play className="w-4 h-4" /> Resume
            </button>
          ) : null}

          {activeTimer && (
            <button
              onClick={() => stopTimer('Recorded from live stopwatch')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-xs font-bold transition"
            >
              <Square className="w-4 h-4" /> Save & Stop
            </button>
          )}
        </div>
      </div>

      {/* Manual Entry Form */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white font-mono mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> + Log Manual Hours
        </h3>
        <form onSubmit={handleManualLog} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            required
          >
            <option value="">Select Task...</option>
            {safeTasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

          <input
            type="number"
            value={durationMinutes}
            onChange={e => setDurationMinutes(e.target.value)}
            placeholder="Minutes"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            required
          />

          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Work notes / description"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition"
          >
            Log Entry
          </button>
        </form>
      </div>

      {/* Logs Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white font-mono mb-3">Recent Time Logs ({safeTimeLogs.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                <th className="pb-2">Task</th>
                <th className="pb-2">Project</th>
                <th className="pb-2">Member</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {safeTimeLogs.map(l => (
                <tr key={l.id}>
                  <td className="py-2.5 text-white font-semibold">{l.task_title}</td>
                  <td className="py-2.5 text-slate-400">{l.project_name}</td>
                  <td className="py-2.5 text-cyan-400">{l.user_name}</td>
                  <td className="py-2.5 text-emerald-400 font-bold">{l.duration_minutes || l.minutes} mins</td>
                  <td className="py-2.5 text-slate-500">{l.date || l.logged_at?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
