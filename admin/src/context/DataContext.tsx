import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Client,
  Project,
  Task,
  TaskStatus,
  User,
  Team,
  VPSNode,
  ServiceHealth,
  CloudflareBackup,
  GitRepo,
  MailLog,
  TimeLog,
  ActivityLog,
  SystemStats
} from '../types';
import { apiClient } from '../services/api';
import { useToast } from './ToastContext';

interface DataContextType {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  users: User[];
  teams: Team[];
  fleet: VPSNode[];
  services: ServiceHealth[];
  backups: CloudflareBackup[];
  repos: GitRepo[];
  mailLogs: MailLog[];
  timeLogs: TimeLog[];
  activities: ActivityLog[];
  stats: SystemStats | null;
  loading: boolean;
  activeTimer: {
    taskId: string;
    taskTitle: string;
    projectId: string;
    seconds: number;
    isRunning: boolean;
  } | null;
  startTimer: (task: Task) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (notes?: string) => Promise<void>;
  
  // Actions
  createClient: (data: Omit<Client, 'id' | 'created_at' | 'projects_count'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;

  createProject: (data: Omit<Project, 'id' | 'created_at'>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;

  createTask: (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  createTeam: (data: Partial<Team>) => Promise<Team>;
  updateTeam: (id: string, data: Partial<Team>) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;

  createUser: (data: Omit<User, 'id' | 'created_at' | 'active_tasks_count'>) => Promise<User>;
  inviteUser: (emailOrId: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>, successMessage?: string) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  bulkDeleteUsers: (ids: string[]) => Promise<void>;
  resetUserPassword: (id: string, password: string) => Promise<void>;
  sendUser2fa: (id: string) => Promise<void>;
  createTimeLog: (data: Omit<TimeLog, 'id' | 'created_at'>) => Promise<TimeLog>;
  triggerBackup: () => Promise<CloudflareBackup>;
  sendTestEmail: (recipient: string, subject: string) => Promise<MailLog>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [fleet, setFleet] = useState<VPSNode[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [backups, setBackups] = useState<CloudflareBackup[]>([]);
  const [repos, setRepos] = useState<GitRepo[]>([]);
  const [mailLogs, setMailLogs] = useState<MailLog[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Live Timer state
  const [activeTimer, setActiveTimer] = useState<{
    taskId: string;
    taskTitle: string;
    projectId: string;
    seconds: number;
    isRunning: boolean;
  } | null>(() => {
    const saved = localStorage.getItem('plexi_active_timer');
    return saved ? JSON.parse(saved) : null;
  });

  const refreshAll = useCallback(async () => {
    try {
      const [c, p, t, u, tm, f, s, b, r, m, tl, a, st] = await Promise.all([
        apiClient.getClients(),
        apiClient.getProjects(),
        apiClient.getTasks(),
        apiClient.getUsers(),
        apiClient.getTeams(),
        apiClient.getFleet(),
        apiClient.getServices(),
        apiClient.getBackups(),
        apiClient.getGitRepos(),
        apiClient.getMailLogs(),
        apiClient.getTimeLogs(),
        apiClient.getActivities(),
        apiClient.getStats()
      ]);

      setClients(Array.isArray(c) ? c : []);
      setProjects(Array.isArray(p) ? p : []);
      setTasks(Array.isArray(t) ? t : []);
      setUsers(Array.isArray(u) ? u : []);
      setTeams(Array.isArray(tm) ? tm : []);
      setFleet(Array.isArray(f) ? f : []);
      setServices(Array.isArray(s) ? s : []);
      setBackups(Array.isArray(b) ? b : []);
      setRepos(Array.isArray(r) ? r : []);
      setMailLogs(Array.isArray(m) ? m : []);
      setTimeLogs(Array.isArray(tl) ? tl : []);
      setActivities(Array.isArray(a) ? a : []);
      setStats(st && typeof st === 'object' ? st : null);
    } catch (err) {
      console.error('Failed to load live data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data only once signed in, and reload whenever the signed-in user changes
  const authUser = useAuthStore((state) => state.user);
  useEffect(() => {
    if (!authUser || !localStorage.getItem('accessToken')) {
      setLoading(false);
      return;
    }
    refreshAll();
  }, [authUser, refreshAll]);

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (activeTimer && activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev) return null;
          const next = { ...prev, seconds: prev.seconds + 1 };
          localStorage.setItem('plexi_active_timer', JSON.stringify(next));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  const startTimer = (task: Task) => {
    const newTimer = {
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.project_id || '',
      seconds: 0,
      isRunning: true,
    };
    setActiveTimer(newTimer);
    localStorage.setItem('plexi_active_timer', JSON.stringify(newTimer));
    showToast('info', 'Timer Started', `Tracking time on: ${task.title}`);
  };

  const pauseTimer = () => {
    if (!activeTimer) return;
    const updated = { ...activeTimer, isRunning: false };
    setActiveTimer(updated);
    localStorage.setItem('plexi_active_timer', JSON.stringify(updated));
  };

  const resumeTimer = () => {
    if (!activeTimer) return;
    const updated = { ...activeTimer, isRunning: true };
    setActiveTimer(updated);
    localStorage.setItem('plexi_active_timer', JSON.stringify(updated));
  };

  const stopTimer = async (notes: string = 'Tracked session') => {
    if (!activeTimer) return;
    const durationMinutes = Math.max(1, Math.round(activeTimer.seconds / 60));
    const project = projects.find(p => p.id === activeTimer.projectId);
    const user = apiClient.getActiveUser();

    try {
      await apiClient.createTimeLog({
        task_id: activeTimer.taskId,
        task_title: activeTimer.taskTitle,
        project_id: activeTimer.projectId,
        project_name: project?.project_name || 'General Project',
        user_id: user.id,
        user_name: user.full_name,
        duration_minutes: durationMinutes,
        date: new Date().toISOString().split('T')[0],
        billable: true,
        notes,
      });

      showToast('success', 'Time Logged', `Logged ${durationMinutes} mins to ${activeTimer.taskTitle}`);
    } catch (err: any) {
      showToast('error', 'Time Log Error', err.message);
    } finally {
      setActiveTimer(null);
      localStorage.removeItem('plexi_active_timer');
      await refreshAll();
    }
  };

  // Client actions
  const createClient = async (data: Omit<Client, 'id' | 'created_at' | 'projects_count'>) => {
    try {
      const created = await apiClient.createClient(data);
      showToast('success', 'Client Created', `${created.business_name} has been enrolled.`);
      await refreshAll();
      return created;
    } catch (err: any) {
      showToast('error', 'Failed to Create Client', err.message);
      throw err;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      const updated = await apiClient.updateClient(id, data);
      showToast('success', 'Client Updated', `${updated.business_name} saved.`);
      await refreshAll();
      return updated;
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await apiClient.deleteClient(id);
      showToast('info', 'Client Removed', 'Client archived successfully.');
      await refreshAll();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
      throw err;
    }
  };

  // Project actions
  const createProject = async (data: Omit<Project, 'id' | 'created_at'>) => {
    try {
      const created = await apiClient.createProject(data);
      showToast('success', 'Project Initialized', `${created.project_name} (${created.project_code}) created.`);
      await refreshAll();
      return created;
    } catch (err: any) {
      showToast('error', 'Project Creation Failed', err.message);
      throw err;
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    try {
      const updated = await apiClient.updateProject(id, data);
      showToast('success', 'Project Updated', `${updated.project_name} saved.`);
      await refreshAll();
      return updated;
    } catch (err: any) {
      showToast('error', 'Project Update Failed', err.message);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await apiClient.deleteProject(id);
      showToast('info', 'Project Deleted', 'Project removed from system.');
      await refreshAll();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
      throw err;
    }
  };

  // Task actions
  const createTask = async (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await apiClient.createTask(data);
      showToast('success', 'Task Created', created.title);
      await refreshAll();
      return created;
    } catch (err: any) {
      showToast('error', 'Task Creation Failed', err.message);
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      const updated = await apiClient.updateTask(id, data);
      await refreshAll();
      return updated;
    } catch (err: any) {
      showToast('error', 'Task Update Failed', err.message);
      throw err;
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const updated = await apiClient.updateTaskStatus(id, status);
      await refreshAll();
      return updated;
    } catch (err: any) {
      showToast('error', 'Status Change Failed', err.message);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await apiClient.deleteTask(id);
      showToast('info', 'Task Deleted', 'Work item removed.');
      await refreshAll();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
      throw err;
    }
  };

  // Team actions
  const createTeam = async (data: Partial<Team>) => {
    try {
      const created = await apiClient.createTeam(data);
      showToast('success', 'Team Created', `${created.name} formed successfully.`);
      await refreshAll();
      return created;
    } catch (err: any) {
      showToast('error', 'Team Creation Failed', err.message);
      throw err;
    }
  };

  const updateTeam = async (id: string, data: Partial<Team>) => {
    try {
      const updated = await apiClient.updateTeam(id, data);
      showToast('success', 'Team Updated', `${updated.name} saved.`);
      await refreshAll();
      return updated;
    } catch (err: any) {
      showToast('error', 'Team Update Failed', err.message);
      throw err;
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await apiClient.deleteTeam(id);
      showToast('info', 'Team Deleted', 'Team removed successfully.');
      await refreshAll();
    } catch (err: any) {
      showToast('error', 'Delete Team Failed', err.message);
      throw err;
    }
  };

  // User actions
  const createUser = async (data: Omit<User, 'id' | 'created_at' | 'active_tasks_count'>) => {
    try {
      const created = await apiClient.createUser(data);
      showToast('success', 'Member Invited', `${created.full_name} added & invitation email sent to ${created.email}.`);
      await refreshAll();
      return created;
    } catch (err: any) {
      showToast('error', 'Team Addition Failed', err.message);
      throw err;
    }
  };

  // Dispatch or resend invitation email to a team member
  const inviteUser = async (emailOrId: string) => {
    try {
      const res = await apiClient.inviteUser(emailOrId);
      showToast('success', 'Invitation Sent', res?.message || `Invitation email sent to ${emailOrId}.`);
    } catch (err: any) {
      showToast('error', 'Invite Failed', err.message);
      throw err;
    }
  };

  // Update a team member and merge the saved record into local state
  const updateUser = async (id: string, updates: Partial<User>, successMessage?: string) => {
    try {
      const updated = await apiClient.updateUser(id, updates);
      setUsers((prev) => prev.map((u) => (u.dId === updated.dId || u.email === updated.email ? { ...u, ...updated } : u)));
      showToast('success', 'User Updated', successMessage || `${updated.full_name || 'User'} saved.`);
      return updated;
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  // Revoke a team member's dashboard access
  const deleteUser = async (id: string) => {
    try {
      const res = await apiClient.deleteUser(id);
      showToast('info', 'Access Revoked', res?.message || 'User removed.');
      await refreshAll();
    } catch (err: any) {
      showToast('error', 'Revoke Failed', err.message);
      throw err;
    }
  };

  // Revoke access for several team members at once
  const bulkDeleteUsers = async (ids: string[]) => {
    try {
      const res = await apiClient.bulkDeleteUsers(ids);
      showToast(res?.skipped ? 'warning' : 'info', 'Access Revoked', res?.message || `${ids.length} users removed.`);
      await refreshAll();
    } catch (err: any) {
      showToast('error', 'Bulk Revoke Failed', err.message);
      throw err;
    }
  };

  // Set a new password for a team member
  const resetUserPassword = async (id: string, password: string) => {
    try {
      const res = await apiClient.resetUserPassword(id, password);
      showToast('success', 'Password Reset', res?.message || 'Password updated.');
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message);
      throw err;
    }
  };

  const sendUser2fa = async (id: string) => {
    try {
      const res = await apiClient.sendUser2fa(id);
      showToast('success', '2FA Setup Sent', res?.message || 'Authenticator setup email sent.');
    } catch (err: any) {
      showToast('error', '2FA Failed', err.message);
      throw err;
    }
  };

  // Time log actions
  const createTimeLog = async (data: Omit<TimeLog, 'id' | 'created_at'>) => {
    try {
      const created = await apiClient.createTimeLog(data);
      showToast('success', 'Time Logged', `${data.duration_minutes}m recorded.`);
      await refreshAll();
      return created;
    } catch (err: any) {
      showToast('error', 'Log Time Failed', err.message);
      throw err;
    }
  };

  // Backup trigger
  const triggerBackup = async () => {
    try {
      const created = await apiClient.triggerBackup();
      showToast('success', 'Cloudflare R2 Backup Completed', `Snapshot ${created.filename} generated and uploaded.`);
      await refreshAll();
      return created;
    } catch (err: any) {
      showToast('error', 'Backup Failed', err.message);
      throw err;
    }
  };

  // Send Test Email
  const sendTestEmail = async (recipient: string, subject: string) => {
    try {
      const mail = await apiClient.sendTestEmail(recipient, subject);
      showToast('success', 'Spacemail Sent', `Dispatched to ${recipient} (Latency: ${mail.latency_ms || 1200}ms)`);
      await refreshAll();
      return mail;
    } catch (err: any) {
      showToast('error', 'Spacemail Error', err.message);
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        projects,
        tasks,
        users,
        teams,
        fleet,
        services,
        backups,
        repos,
        mailLogs,
        timeLogs,
        activities,
        stats,
        loading,
        activeTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        createClient,
        updateClient,
        deleteClient,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        createTeam,
        updateTeam,
        deleteTeam,
        createUser,
        inviteUser,
        updateUser,
        deleteUser,
        bulkDeleteUsers,
        resetUserPassword,
        sendUser2fa,
        createTimeLog,
        triggerBackup,
        sendTestEmail,
        refreshAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
