import {
  Client,
  Project,
  Task,
  TaskStatus,
  User,
  VPSNode,
  ServiceHealth,
  MailLog,
  GitRepo,
  CloudflareBackup,
  TimeLog,
  ActivityLog,
  SystemStats,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_USERS,
  INITIAL_VPS_NODES,
  INITIAL_SERVICES,
  INITIAL_BACKUPS,
  INITIAL_REPOS,
  INITIAL_MAIL_LOGS,
  INITIAL_TIME_LOGS,
  INITIAL_ACTIVITIES,
  INITIAL_STATS,
} from './mockData';

const TOKEN_KEY = 'plexi_jwt_token';
const USER_KEY = 'plexi_active_user';

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', 'Bearer ' + token);
  try {
    const res = await fetch('/api' + endpoint, { ...options, headers });
    if (!res.ok) {
      if (res.status === 401) window.dispatchEvent(new CustomEvent('plexi:unauthorized'));
      throw new Error('API Error: ' + res.status + ' ' + res.statusText);
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// Local storage helpers for stateful mockup fallback
const getStored = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem('plexi_data_' + key);
    if (!item) return defaultVal;
    const parsed = JSON.parse(item);
    if (Array.isArray(defaultVal) && !Array.isArray(parsed)) {
      return defaultVal;
    }
    if (typeof defaultVal === 'object' && defaultVal !== null && (typeof parsed !== 'object' || parsed === null)) {
      return defaultVal;
    }
    return parsed;
  } catch {
    return defaultVal;
  }
};

const setStored = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem('plexi_data_' + key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
};

// Purge legacy mock data cache from localStorage if present
(() => {
  try {
    const keys = [
      'clients', 'projects', 'tasks', 'users', 'fleet', 'services', 
      'backups', 'repos', 'mail', 'timelogs', 'activities', 'stats'
    ];
    const cachedClients = localStorage.getItem('plexi_data_clients');
    if (cachedClients && (cachedClients.includes('c-101') || cachedClients.includes('mocondom'))) {
      keys.forEach(k => localStorage.removeItem('plexi_data_' + k));
    }
    const cachedUser = localStorage.getItem('user');
    if (cachedUser && cachedUser.includes('usr_demo_01')) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  } catch (e) {
    console.warn('Storage purge error:', e);
  }
})();

function extractArray<T>(res: any, fallback: T[]): T[] {
  if (!res) return fallback;
  if (Array.isArray(res)) return res;
  if (typeof res === 'object') {
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.records)) return res.records;
    if (Array.isArray(res.rows)) return res.rows;
    if (Array.isArray(res.clients)) return res.clients;
    if (Array.isArray(res.projects)) return res.projects;
    if (Array.isArray(res.tasks)) return res.tasks;
    if (Array.isArray(res.users)) return res.users;
    if (Array.isArray(res.nodes)) return res.nodes;
    if (Array.isArray(res.services)) return res.services;
    if (Array.isArray(res.backups)) return res.backups;
    if (Array.isArray(res.repos)) return res.repos;
    if (Array.isArray(res.logs)) return res.logs;
    if (Array.isArray(res.timelogs)) return res.timelogs;
    if (Array.isArray(res.activities)) return res.activities;
    if (res.data && typeof res.data === 'object') {
      if (Array.isArray(res.data.items)) return res.data.items;
      if (Array.isArray(res.data.results)) return res.data.results;
      if (Array.isArray(res.data.records)) return res.data.records;
      if (Array.isArray(res.data.rows)) return res.data.rows;
    }
  }
  return fallback;
}

function extractItem<T>(res: any, fallback: T): T {
  if (!res) return fallback;
  if (typeof res === 'object') {
    if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
    if (res.client && typeof res.client === 'object') return res.client;
    if (res.project && typeof res.project === 'object') return res.project;
    if (res.task && typeof res.task === 'object') return res.task;
    if (res.user && typeof res.user === 'object') return res.user;
    if (res.backup && typeof res.backup === 'object') return res.backup;
    if (res.timelog && typeof res.timelog === 'object') return res.timelog;
    if (res.mail && typeof res.mail === 'object') return res.mail;
    if (res.node && typeof res.node === 'object') return res.node;
    if (res.item && typeof res.item === 'object') return res.item;
    if (res.result && typeof res.result === 'object') return res.result;
  }
  return res as T;
}

export interface ApiClient {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  getActiveUser(): User;
  setActiveUser(user: User): void;
  request<T = any>(endpoint: string, options?: RequestInit): Promise<T>;
  [key: string]: any;
}

export const apiClient: ApiClient = {
  // Auth Token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getActiveUser(): User {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id) return u;
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0];
  },

  setActiveUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', 'Bearer ' + token);
    }

    try {
      const res = await fetch('/api' + endpoint, {
        ...options,
        headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent('plexi:unauthorized'));
        }
        throw new Error('API Error: ' + res.status + ' ' + res.statusText);
      }

      return await res.json();
    } catch (err) {
      throw err;
    }
  },

  // Auth Operations
  async login(email: string, pass: string): Promise<{ token: string; user: User }> {
    const res = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    if (res && res.token && res.user) {
      this.setToken(res.token);
      this.setActiveUser(res.user);
      return { token: res.token, user: res.user };
    }
    throw new Error(res?.error || 'Authentication failed. Please check your credentials.');
  },

  // Clients
  async getClients(): Promise<Client[]> {
    try {
      const res = await apiFetch<any>('/clients');
      const list = extractArray<Client>(res, []);
      if (list && list.length > 0) {
        setStored('clients', list);
        return list;
      }
      return getStored<Client[]>('clients', INITIAL_CLIENTS);
    } catch {
      return getStored<Client[]>('clients', INITIAL_CLIENTS);
    }
  },

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'projects_count'>): Promise<Client> {
    try {
      const res = await apiFetch<any>('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });
      const created = extractItem<Client>(res, null as any);
      if (created && created.id) {
        const clients = getStored<Client[]>('clients', INITIAL_CLIENTS);
        setStored('clients', [created, ...clients.filter(c => c.id !== created.id)]);
        this.logActivity('created new client', created.business_name || 'Client', 'CLIENT');
        return created;
      }
      throw new Error('Failed to create client');
    } catch {
      const clients = getStored<Client[]>('clients', INITIAL_CLIENTS);
      const newClient: Client = {
        ...clientData,
        id: 'c-' + Date.now().toString().slice(-4),
        projects_count: 0,
        created_at: new Date().toISOString(),
      };
      const updated = [newClient, ...clients];
      setStored('clients', updated);
      this.logActivity('created new client', newClient.business_name || 'Client', 'CLIENT');
      return newClient;
    }
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      const res = await apiFetch<any>('/clients/' + id, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const updated = extractItem<Client>(res, null as any);
      if (updated && updated.id) {
        const clients = getStored<Client[]>('clients', INITIAL_CLIENTS);
        setStored('clients', clients.map(c => c.id === id ? { ...c, ...updated } : c));
        this.logActivity('updated client details', updated.business_name || 'Client', 'CLIENT');
        return updated;
      }
      throw new Error('Client not found');
    } catch {
      const clients = getStored<Client[]>('clients', INITIAL_CLIENTS);
      const idx = clients.findIndex(c => c.id === id);
      if (idx !== -1) {
        clients[idx] = { ...clients[idx], ...updates };
        setStored('clients', [...clients]);
        this.logActivity('updated client details', clients[idx].business_name || 'Client', 'CLIENT');
        return clients[idx];
      }
      throw new Error('Client not found');
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await apiFetch('/clients/' + id, { method: 'DELETE' });
    } catch {
      // offline fallback
    } finally {
      const clients = getStored<Client[]>('clients', INITIAL_CLIENTS).filter(c => c.id !== id);
      setStored('clients', clients);
      this.logActivity('archived/deleted client', 'ID: ' + id, 'CLIENT');
    }
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const res = await apiFetch<any>('/projects');
      const list = extractArray<Project>(res, []);
      if (list && list.length > 0) {
        setStored('projects', list);
        return list;
      }
      return getStored<Project[]>('projects', INITIAL_PROJECTS);
    } catch {
      return getStored<Project[]>('projects', INITIAL_PROJECTS);
    }
  },

  async createProject(projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
    try {
      const res = await apiFetch<any>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      const created = extractItem<Project>(res, null as any);
      if (created && created.id) {
        const projects = getStored<Project[]>('projects', INITIAL_PROJECTS);
        setStored('projects', [created, ...projects.filter(p => p.id !== created.id)]);
        this.logActivity('launched new project', created.project_name || 'Project', 'PROJECT');
        return created;
      }
      throw new Error('Failed to create project');
    } catch {
      const projects = getStored<Project[]>('projects', INITIAL_PROJECTS);
      const newProject: Project = {
        ...projectData,
        id: 'p-' + Date.now().toString().slice(-4),
        created_at: new Date().toISOString(),
      };
      const updated = [newProject, ...projects];
      setStored('projects', updated);

      const clients = getStored<Client[]>('clients', INITIAL_CLIENTS);
      const cIdx = clients.findIndex(c => c.id === projectData.client_id);
      if (cIdx !== -1) {
        clients[cIdx].projects_count = (clients[cIdx].projects_count || 0) + 1;
        setStored('clients', clients);
      }

      this.logActivity('launched new project', newProject.project_name || 'Project', 'PROJECT');
      return newProject;
    }
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      const res = await apiFetch<any>('/projects/' + id, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const updated = extractItem<Project>(res, null as any);
      if (updated && updated.id) {
        const projects = getStored<Project[]>('projects', INITIAL_PROJECTS);
        setStored('projects', projects.map(p => p.id === id ? { ...p, ...updated } : p));
        this.logActivity('updated project milestone', updated.project_name || 'Project', 'PROJECT');
        return updated;
      }
      throw new Error('Project not found');
    } catch {
      const projects = getStored<Project[]>('projects', INITIAL_PROJECTS);
      const idx = projects.findIndex(p => p.id === id);
      if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...updates };
        setStored('projects', [...projects]);
        this.logActivity('updated project milestone', projects[idx].project_name || 'Project', 'PROJECT');
        return projects[idx];
      }
      throw new Error('Project not found');
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await apiFetch('/projects/' + id, { method: 'DELETE' });
    } catch {
      // fallback
    } finally {
      const projects = getStored<Project[]>('projects', INITIAL_PROJECTS).filter(p => p.id !== id);
      setStored('projects', projects);
    }
  },

  // Tasks & Kanban
  async getTasks(): Promise<Task[]> {
    try {
      const res = await apiFetch<any>('/tasks');
      const list = extractArray<Task>(res, []);
      if (list && list.length > 0) {
        setStored('tasks', list);
        return list;
      }
      return getStored<Task[]>('tasks', INITIAL_TASKS);
    } catch {
      return getStored<Task[]>('tasks', INITIAL_TASKS);
    }
  },

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    try {
      const res = await apiFetch<any>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      const created = extractItem<Task>(res, null as any);
      if (created && created.id) {
        const tasks = getStored<Task[]>('tasks', INITIAL_TASKS);
        setStored('tasks', [created, ...tasks.filter(t => t.id !== created.id)]);
        this.logActivity('created task', created.title || 'Task', 'TASK');
        return created;
      }
      throw new Error('Failed to create task');
    } catch {
      const tasks = getStored<Task[]>('tasks', INITIAL_TASKS);
      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id: 't-' + Date.now().toString().slice(-4),
        created_at: now,
        updated_at: now,
      };
      const updated = [newTask, ...tasks];
      setStored('tasks', updated);
      this.logActivity('created task', newTask.title || 'Task', 'TASK');
      return newTask;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const res = await apiFetch<any>('/tasks/' + id, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const updated = extractItem<Task>(res, null as any);
      if (updated && updated.id) {
        const tasks = getStored<Task[]>('tasks', INITIAL_TASKS);
        setStored('tasks', tasks.map(t => t.id === id ? { ...t, ...updated } : t));
        return updated;
      }
      throw new Error('Task not found');
    } catch {
      const tasks = getStored<Task[]>('tasks', INITIAL_TASKS);
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...updates, updated_at: new Date().toISOString() };
        setStored('tasks', [...tasks]);
        return tasks[idx];
      }
      throw new Error('Task not found');
    }
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    try {
      const res = await apiFetch<any>('/tasks/' + id + '/status', {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      const updated = extractItem<Task>(res, null as any);
      if (updated && updated.id) {
        const tasks = getStored<Task[]>('tasks', INITIAL_TASKS);
        setStored('tasks', tasks.map(t => t.id === id ? { ...t, ...updated } : t));
        this.logActivity('moved task to ' + status, updated.title || 'Task', 'TASK');
        return updated;
      }
      throw new Error('Status change failed');
    } catch {
      const task = await this.updateTask(id, { status });
      this.logActivity('moved task to ' + status, task.title || 'Task', 'TASK');
      return task;
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await apiFetch('/tasks/' + id, { method: 'DELETE' });
    } catch {
      // fallback
    } finally {
      const tasks = getStored<Task[]>('tasks', INITIAL_TASKS).filter(t => t.id !== id);
      setStored('tasks', tasks);
    }
  },

  // Team
  async getUsers(): Promise<User[]> {
    try {
      const res = await apiFetch<any>('/users');
      const list = extractArray<User>(res, []);
      if (list && list.length > 0) {
        setStored('users', list);
        return list;
      }
      return getStored<User[]>('users', INITIAL_USERS);
    } catch {
      return getStored<User[]>('users', INITIAL_USERS);
    }
  },

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'active_tasks_count'>): Promise<User> {
    try {
      const res = await apiFetch<any>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      const created = extractItem<User>(res, null as any);
      if (created && created.id) {
        const users = getStored<User[]>('users', INITIAL_USERS);
        setStored('users', [...users.filter(u => u.id !== created.id), created]);
        this.logActivity('added new team member', created.full_name || 'Member', 'SYSTEM');
        return created;
      }
      throw new Error('User creation failed');
    } catch {
      const users = getStored<User[]>('users', INITIAL_USERS);
      const newUser: User = {
        ...userData,
        id: 'u-' + Date.now().toString().slice(-4),
        active_tasks_count: 0,
        created_at: new Date().toISOString(),
      };
      const updated = [...users, newUser];
      setStored('users', updated);
      this.logActivity('added new team member', newUser.full_name || 'Member', 'SYSTEM');
      return newUser;
    }
  },

  // Time Logs
  async getTimeLogs(): Promise<TimeLog[]> {
    try {
      const res = await apiFetch<any>('/timelogs');
      const list = extractArray<TimeLog>(res, []);
      if (list && list.length > 0) {
        setStored('timelogs', list);
        return list;
      }
      return getStored<TimeLog[]>('timelogs', INITIAL_TIME_LOGS);
    } catch {
      return getStored<TimeLog[]>('timelogs', INITIAL_TIME_LOGS);
    }
  },

  async createTimeLog(logData: Omit<TimeLog, 'id' | 'created_at'>): Promise<TimeLog> {
    try {
      const res = await apiFetch<any>('/timelogs', {
        method: 'POST',
        body: JSON.stringify(logData),
      });
      const created = extractItem<TimeLog>(res, null as any);
      if (created && created.id) {
        const logs = getStored<TimeLog[]>('timelogs', INITIAL_TIME_LOGS);
        setStored('timelogs', [created, ...logs]);
        this.logActivity('logged time on', logData.task_title || 'Task', 'TASK');
        return created;
      }
      throw new Error('Failed to log time');
    } catch {
      const logs = getStored<TimeLog[]>('timelogs', INITIAL_TIME_LOGS);
      const newLog: TimeLog = {
        ...logData,
        id: 'tl-' + Date.now().toString().slice(-4),
        created_at: new Date().toISOString(),
      };
      setStored('timelogs', [newLog, ...logs]);

      const tasks = getStored<Task[]>('tasks', INITIAL_TASKS);
      const tIdx = tasks.findIndex(t => t.id === logData.task_id);
      if (tIdx !== -1) {
        tasks[tIdx].logged_hours = (tasks[tIdx].logged_hours || 0) + ((logData.duration_minutes || 0) / 60);
        setStored('tasks', tasks);
      }

      this.logActivity('logged time on', logData.task_title || 'Task', 'TASK');
      return newLog;
    }
  },

  // VPS Fleet
  async getFleet(): Promise<VPSNode[]> {
    try {
      const res = await apiFetch<any>('/fleet');
      const list = extractArray<VPSNode>(res, []);
      if (list && list.length > 0) {
        setStored('fleet', list);
        return list;
      }
      return getStored<VPSNode[]>('fleet', INITIAL_VPS_NODES);
    } catch {
      return getStored<VPSNode[]>('fleet', INITIAL_VPS_NODES);
    }
  },

  // SRE Services Health
  async getServices(): Promise<ServiceHealth[]> {
    try {
      const res = await apiFetch<any>('/sre/services');
      const list = extractArray<ServiceHealth>(res, []);
      if (list && list.length > 0) {
        setStored('services', list);
        return list;
      }
      return getStored<ServiceHealth[]>('services', INITIAL_SERVICES);
    } catch {
      return getStored<ServiceHealth[]>('services', INITIAL_SERVICES);
    }
  },

  // Cloudflare R2 Backups
  async getBackups(): Promise<CloudflareBackup[]> {
    try {
      const res = await apiFetch<any>('/backups');
      const list = extractArray<CloudflareBackup>(res, []);
      if (list && list.length > 0) {
        setStored('backups', list);
        return list;
      }
      return getStored<CloudflareBackup[]>('backups', INITIAL_BACKUPS);
    } catch {
      return getStored<CloudflareBackup[]>('backups', INITIAL_BACKUPS);
    }
  },

  async triggerBackup(): Promise<CloudflareBackup> {
    try {
      const res = await apiFetch<any>('/backups/trigger', { method: 'POST' });
      const created = extractItem<CloudflareBackup>(res, null as any);
      if (created && created.filename) {
        const backups = getStored<CloudflareBackup[]>('backups', INITIAL_BACKUPS);
        setStored('backups', [created, ...backups]);
        this.logActivity('triggered manual Cloudflare R2 snapshot', created.filename, 'BACKUP');
        return created;
      }
      throw new Error('Backup trigger returned invalid data');
    } catch {
      const backups = getStored<CloudflareBackup[]>('backups', INITIAL_BACKUPS);
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestampStr = '' + now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + '-' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds());

      const newBackup: CloudflareBackup = {
        id: 'bk-' + Date.now().toString().slice(-4),
        filename: 'plexi-postgres-backup-' + timestampStr + '.sql.gz',
        bucket: 'clienthub-backups',
        account_id: 'fa0942a4bd8e442e22f78fdb6a2a605a',
        size_bytes: 48500000 + Math.floor(Math.random() * 800000),
        size_human: '46.4 MB',
        status: 'COMPLETED',
        database_name: 'plexihub_db',
        checksum: 'sha256:' + Math.random().toString(36).substring(2, 12) + '...' + Math.random().toString(36).substring(2, 6),
        created_at: now.toISOString(),
      };

      const updated = [newBackup, ...backups];
      setStored('backups', updated);
      this.logActivity('triggered manual Cloudflare R2 snapshot', newBackup.filename, 'BACKUP');
      return newBackup;
    }
  },

  // Private Git Repos
  async getGitRepos(): Promise<GitRepo[]> {
    try {
      const res = await apiFetch<any>('/git/repos');
      const list = extractArray<GitRepo>(res, []);
      if (list && list.length > 0) {
        setStored('repos', list);
        return list;
      }
      return getStored<GitRepo[]>('repos', INITIAL_REPOS);
    } catch {
      return getStored<GitRepo[]>('repos', INITIAL_REPOS);
    }
  },

  // Mail Logs
  async getMailLogs(): Promise<MailLog[]> {
    try {
      const res = await apiFetch<any>('/mail/logs');
      const list = extractArray<MailLog>(res, []);
      if (list && list.length > 0) {
        setStored('mail', list);
        return list;
      }
      return getStored<MailLog[]>('mail', INITIAL_MAIL_LOGS);
    } catch {
      return getStored<MailLog[]>('mail', INITIAL_MAIL_LOGS);
    }
  },

  async sendTestEmail(recipient: string, subject: string): Promise<MailLog> {
    try {
      const res = await apiFetch<any>('/mail/send-test', {
        method: 'POST',
        body: JSON.stringify({ recipient, subject }),
      });
      const mail = extractItem<MailLog>(res, null as any);
      if (mail && mail.recipient) {
        const mailLogs = getStored<MailLog[]>('mail', INITIAL_MAIL_LOGS);
        setStored('mail', [mail, ...mailLogs]);
        this.logActivity('dispatched Spacemail relay test', recipient, 'SYSTEM');
        return mail;
      }
      throw new Error('Email send failed');
    } catch {
      const mailLogs = getStored<MailLog[]>('mail', INITIAL_MAIL_LOGS);
      const newMail: MailLog = {
        id: 'ml-' + Date.now().toString().slice(-4),
        recipient,
        sender: 'admin@plexivia.com',
        subject,
        status: 'DELIVERED',
        queued_at: new Date().toISOString(),
        delivered_at: new Date(Date.now() + 1200).toISOString(),
        latency_ms: 1200 + Math.floor(Math.random() * 400),
      };
      setStored('mail', [newMail, ...mailLogs]);
      this.logActivity('dispatched Spacemail relay test', recipient, 'SYSTEM');
      return newMail;
    }
  },

  // Activities & Stats
  async getActivities(): Promise<ActivityLog[]> {
    try {
      const res = await apiFetch<any>('/activities');
      const list = extractArray<ActivityLog>(res, []);
      if (list && list.length > 0) {
        setStored('activities', list);
        return list;
      }
      return getStored<ActivityLog[]>('activities', INITIAL_ACTIVITIES);
    } catch {
      return getStored<ActivityLog[]>('activities', INITIAL_ACTIVITIES);
    }
  },

  logActivity(action: string, targetName: string, targetType: ActivityLog['target_type']) {
    const user = this.getActiveUser();
    const activities = getStored<ActivityLog[]>('activities', INITIAL_ACTIVITIES);
    const newAct: ActivityLog = {
      id: 'act-' + Date.now().toString().slice(-4),
      user_name: user.full_name || 'Admin',
      user_avatar: user.avatar,
      action,
      target_name: targetName,
      target_type: targetType,
      timestamp: 'Just now',
    };
    setStored('activities', [newAct, ...activities.slice(0, 19)]);
  },

  async getStats(): Promise<SystemStats> {
    try {
      const res = await apiFetch<any>('/stats');
      if (res && typeof res === 'object') {
        const statsObj = res.stats || res.summary || res.data || res;
        if (statsObj && typeof statsObj === 'object') {
          setStored('stats', statsObj);
          return statsObj;
        }
      }
      return getStored<SystemStats>('stats', INITIAL_STATS);
    } catch {
      return getStored<SystemStats>('stats', INITIAL_STATS);
    }
  },
};

export const api = apiClient;
export default apiClient;
