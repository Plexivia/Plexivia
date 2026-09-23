import {
  Client,
  Project,
  Task,
  TaskStatus,
  User,
  Team,
  TeamMember,
  VPSNode,
  ServiceHealth,
  MailLog,
  GitRepo,
  CloudflareBackup,
  TimeLog,
  ActivityLog,
  SystemStats,
} from '../types';

const TOKEN_KEY = 'plexi_jwt_token';
const USER_KEY = 'plexi_active_user';

// Fetch data from backend API with authentication headers
export const apiFetch = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('accessToken');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', 'Bearer ' + token);

  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const requestUrl = baseUrl ? `${baseUrl}/api${cleanEndpoint}` : `/api${cleanEndpoint}`;

  try {
    const res = await fetch(requestUrl, { ...options, headers });
    if (!res.ok) {
      if (res.status === 401) window.dispatchEvent(new CustomEvent('plexi:unauthorized'));
      throw new Error('API Error: ' + res.status + ' ' + res.statusText);
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
};

// Extract array from various API response wrapper formats
const extractArray = <T>(res: any): T[] => {
  if (!res) return [];
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
    if (Array.isArray(res.teams)) return res.teams;
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
  return [];
};

// Extract single item from various API response envelope formats
const extractItem = <T>(res: any): T | null => {
  if (!res) return null;
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
};

export interface ApiClient {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  getActiveUser(): User | null;
  setActiveUser(user: User): void;
  request<T = any>(endpoint: string, options?: RequestInit): Promise<T>;
  login(email: string, pass: string): Promise<{ token: string; user: User }>;
  
  // Clients
  getClients(): Promise<Client[]>;
  createClient(clientData: Omit<Client, 'id' | 'created_at' | 'projects_count'>): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Projects
  getProjects(): Promise<Project[]>;
  createProject(projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Users
  getUsers(): Promise<User[]>;
  createUser(userData: Omit<User, 'id' | 'created_at' | 'active_tasks_count'>): Promise<User>;

  // Teams
  getTeams(): Promise<Team[]>;
  createTeam(teamData: Partial<Team>): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team>;
  deleteTeam(id: string): Promise<void>;

  // Time Logs
  getTimeLogs(): Promise<TimeLog[]>;
  createTimeLog(logData: Omit<TimeLog, 'id' | 'created_at'>): Promise<TimeLog>;

  // Infrastructure / Secondary
  getFleet(): Promise<VPSNode[]>;
  getServices(): Promise<ServiceHealth[]>;
  getBackups(): Promise<CloudflareBackup[]>;
  triggerBackup(): Promise<CloudflareBackup>;
  getGitRepos(): Promise<GitRepo[]>;
  getMailLogs(): Promise<MailLog[]>;
  sendTestEmail(recipient: string, subject: string): Promise<MailLog>;
  getActivities(): Promise<ActivityLog[]>;
  logActivity(action: string, targetName: string, targetType: ActivityLog['target_type']): void;
  getStats(): Promise<SystemStats | null>;
}

export const apiClient: ApiClient = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('accessToken');
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('accessToken', token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  getActiveUser(): User | null {
    const saved = localStorage.getItem(USER_KEY) || localStorage.getItem('user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && (u.id || u._id || u.did)) return u;
      } catch {
        return null;
      }
    }
    return null;
  },

  setActiveUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
  },

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', 'Bearer ' + token);
    }

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
  },

  // Auth Operations
  async login(email: string, pass: string): Promise<{ token: string; user: User }> {
    const res = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    if (res && (res.token || res.accessToken) && (res.user || res.data?.user)) {
      const token = res.token || res.accessToken || res.data?.accessToken;
      const user = res.user || res.data?.user;
      this.setToken(token);
      this.setActiveUser(user);
      return { token, user };
    }
    throw new Error(res?.message || res?.error || 'Authentication failed.');
  },

  // Clients
  async getClients(): Promise<Client[]> {
    try {
      const res = await apiFetch<any>('/clients');
      return extractArray<Client>(res);
    } catch {
      return [];
    }
  },

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'projects_count'>): Promise<Client> {
    const res = await apiFetch<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
    const created = extractItem<Client>(res);
    if (created) {
      this.logActivity('created new client', created.business_name || 'Client', 'CLIENT');
      return created;
    }
    throw new Error('Failed to create client');
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const res = await apiFetch<any>('/clients/' + id, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const updated = extractItem<Client>(res);
    if (updated) {
      this.logActivity('updated client details', updated.business_name || 'Client', 'CLIENT');
      return updated;
    }
    throw new Error('Client not found');
  },

  async deleteClient(id: string): Promise<void> {
    await apiFetch('/clients/' + id, { method: 'DELETE' });
    this.logActivity('deleted client', 'ID: ' + id, 'CLIENT');
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const res = await apiFetch<any>('/projects');
      return extractArray<Project>(res);
    } catch {
      return [];
    }
  },

  async createProject(projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
    const res = await apiFetch<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    const created = extractItem<Project>(res);
    if (created) {
      this.logActivity('launched new project', created.project_name || 'Project', 'PROJECT');
      return created;
    }
    throw new Error('Failed to create project');
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const res = await apiFetch<any>('/projects/' + id, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const updated = extractItem<Project>(res);
    if (updated) {
      this.logActivity('updated project', updated.project_name || 'Project', 'PROJECT');
      return updated;
    }
    throw new Error('Project not found');
  },

  async deleteProject(id: string): Promise<void> {
    await apiFetch('/projects/' + id, { method: 'DELETE' });
    this.logActivity('deleted project', 'ID: ' + id, 'PROJECT');
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const res = await apiFetch<any>('/tasks');
      return extractArray<Task>(res);
    } catch {
      return [];
    }
  },

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const res = await apiFetch<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    const created = extractItem<Task>(res);
    if (created) {
      this.logActivity('created task', created.title || 'Task', 'TASK');
      return created;
    }
    throw new Error('Failed to create task');
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await apiFetch<any>('/tasks/' + id, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const updated = extractItem<Task>(res);
    if (updated) {
      return updated;
    }
    throw new Error('Task not found');
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const res = await apiFetch<any>('/tasks/' + id + '/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const updated = extractItem<Task>(res);
    if (updated) {
      this.logActivity('moved task to ' + status, updated.title || 'Task', 'TASK');
      return updated;
    }
    return this.updateTask(id, { status });
  },

  async deleteTask(id: string): Promise<void> {
    await apiFetch('/tasks/' + id, { method: 'DELETE' });
    this.logActivity('deleted task', 'ID: ' + id, 'TASK');
  },

  // Users
  async getUsers(): Promise<User[]> {
    try {
      const res = await apiFetch<any>('/users');
      return extractArray<User>(res);
    } catch {
      return [];
    }
  },

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'active_tasks_count'>): Promise<User> {
    const res = await apiFetch<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    const created = extractItem<User>(res);
    if (created) {
      this.logActivity('added user', created.full_name || 'User', 'SYSTEM');
      return created;
    }
    throw new Error('User creation failed');
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    try {
      const res = await apiFetch<any>('/teams');
      return extractArray<Team>(res);
    } catch {
      return [];
    }
  },

  async createTeam(teamData: Partial<Team>): Promise<Team> {
    const res = await apiFetch<any>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
    const created = extractItem<Team>(res);
    if (created) {
      this.logActivity('created team', created.name || 'Team', 'SYSTEM');
      return created;
    }
    throw new Error('Team creation failed');
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    const res = await apiFetch<any>('/teams/' + id, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const updated = extractItem<Team>(res);
    if (updated) {
      this.logActivity('updated team', updated.name || 'Team', 'SYSTEM');
      return updated;
    }
    throw new Error('Team update failed');
  },

  async deleteTeam(id: string): Promise<void> {
    await apiFetch('/teams/' + id, { method: 'DELETE' });
    this.logActivity('deleted team', 'ID: ' + id, 'SYSTEM');
  },

  // Time Logs
  async getTimeLogs(): Promise<TimeLog[]> {
    try {
      const res = await apiFetch<any>('/timelogs');
      return extractArray<TimeLog>(res);
    } catch {
      return [];
    }
  },

  async createTimeLog(logData: Omit<TimeLog, 'id' | 'created_at'>): Promise<TimeLog> {
    const res = await apiFetch<any>('/timelogs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
    const created = extractItem<TimeLog>(res);
    if (created) {
      this.logActivity('logged time on', logData.task_title || 'Task', 'TASK');
      return created;
    }
    throw new Error('Failed to log time');
  },

  // Infrastructure / Secondary
  async getFleet(): Promise<VPSNode[]> {
    try {
      const res = await apiFetch<any>('/fleet');
      return extractArray<VPSNode>(res);
    } catch {
      return [];
    }
  },

  async getServices(): Promise<ServiceHealth[]> {
    try {
      const res = await apiFetch<any>('/sre/services');
      return extractArray<ServiceHealth>(res);
    } catch {
      return [];
    }
  },

  async getBackups(): Promise<CloudflareBackup[]> {
    try {
      const res = await apiFetch<any>('/backups');
      return extractArray<CloudflareBackup>(res);
    } catch {
      return [];
    }
  },

  async triggerBackup(): Promise<CloudflareBackup> {
    const res = await apiFetch<any>('/backups/trigger', { method: 'POST' });
    const created = extractItem<CloudflareBackup>(res);
    if (created) {
      this.logActivity('triggered backup', created.filename || 'Backup', 'BACKUP');
      return created;
    }
    throw new Error('Backup trigger returned invalid data');
  },

  async getGitRepos(): Promise<GitRepo[]> {
    try {
      const res = await apiFetch<any>('/git/repos');
      return extractArray<GitRepo>(res);
    } catch {
      return [];
    }
  },

  async getMailLogs(): Promise<MailLog[]> {
    try {
      const res = await apiFetch<any>('/mail/logs');
      return extractArray<MailLog>(res);
    } catch {
      return [];
    }
  },

  async sendTestEmail(recipient: string, subject: string): Promise<MailLog> {
    const res = await apiFetch<any>('/mail/send-test', {
      method: 'POST',
      body: JSON.stringify({ recipient, subject }),
    });
    const mail = extractItem<MailLog>(res);
    if (mail) {
      this.logActivity('sent test email', recipient, 'SYSTEM');
      return mail;
    }
    throw new Error('Email send failed');
  },

  async getActivities(): Promise<ActivityLog[]> {
    try {
      const res = await apiFetch<any>('/activities');
      return extractArray<ActivityLog>(res);
    } catch {
      return [];
    }
  },

  logActivity(action: string, targetName: string, targetType: ActivityLog['target_type']) {
    const user = this.getActiveUser();
    try {
      apiFetch('/activities', {
        method: 'POST',
        body: JSON.stringify({
          user_name: user?.full_name || user?.name || 'Admin',
          user_avatar: user?.avatar,
          action,
          target_name: targetName,
          target_type: targetType,
        }),
      }).catch(() => {});
    } catch {}
  },

  async getStats(): Promise<SystemStats | null> {
    try {
      const res = await apiFetch<any>('/stats');
      if (res && typeof res === 'object') {
        return res.stats || res.summary || res.data || res;
      }
      return null;
    } catch {
      return null;
    }
  },
};

export const api = apiClient;
export default apiClient;
