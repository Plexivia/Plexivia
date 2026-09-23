// ============================================================================
// Plexivia Backend Core Entity Types
// Collections: User, Project, Task, Client, Team
// ============================================================================

export type UserRole = 'SUPER_ADMIN' | 'PM' | 'DEV' | 'DESIGNER' | 'SRE' | 'ADMIN' | 'MEMBER' | string;
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'AWAY' | 'OFFLINE';

export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  username?: string;
  role: UserRole;
  department?: string;
  designation?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  avatar_url?: string;
  is_active?: boolean;
  status?: UserStatus | string;
  hourly_rate?: number;
  active_tasks_count?: number;
  total_logged_hours?: number;
  created_at: string;
  updated_at?: string;
}

export type ClientType = 'SINGLE_TENANT' | 'MULTI_TENANT_ECOMMERCE' | 'CORPORATE';
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'ONBOARDING' | 'MAINTENANCE' | 'ARCHIVED';

export interface Client {
  id: string;
  client_key?: string;
  business_name: string;
  primary_domain?: string;
  client_type?: ClientType;
  database_shared?: boolean;
  status: ClientStatus;
  monthly_revenue?: number;
  monthly_retainer?: number;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  projects_count?: number;
  created_at: string;
  updated_at?: string;
}

export type ProjectType = 'ECOMMERCE_MULTITENANT' | 'CUSTOM_WEB' | 'SRE_INFRA' | 'MOBILE_APP' | 'SYSTEM_MIGRATION' | 'INTERNAL_TOOL';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'MAINTENANCE' | 'ARCHIVED' | 'DEPLOYING' | 'COMPLETED' | 'PAUSED';

export interface Project {
  id: string;
  client_id?: string;
  clientId?: string;
  client_name?: string;
  clientName?: string;
  project_name?: string;
  name: string;
  project_code?: string;
  code: string;
  description?: string;
  project_type?: ProjectType;
  type?: ProjectType;
  team_id?: string;
  teamId?: string;
  team_name?: string;
  teamName?: string;
  status: ProjectStatus;
  progress_percent?: number;
  progressPercent?: number;
  lead_id?: string;
  leadId?: string;
  lead_name?: string;
  leadName?: string;
  lead_avatar?: string;
  leadAvatar?: string;
  git_repo_url?: string;
  gitRepoUrl?: string;
  production_url?: string;
  productionUrl?: string;
  staging_url?: string;
  stagingUrl?: string;
  due_date?: string;
  dueDate?: string;
  tasks_count?: {
    total: number;
    completed: number;
    inProgress?: number;
  };
  tasksCount?: {
    total: number;
    completed: number;
    inProgress?: number;
  };
  tags?: string[];
  created_at: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface TaskComment {
  id: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  issueKey?: string;
  project_id?: string;
  projectId?: string;
  project_name?: string;
  projectName?: string;
  project_code?: string;
  projectCode?: string;
  assignee_id?: string;
  assigneeId?: string;
  assignee_name?: string;
  assigneeName?: string;
  assignee_avatar?: string;
  assigneeAvatar?: string;
  reporter_id?: string;
  reporterId?: string;
  reporter_name?: string;
  reporterName?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_hours?: number;
  estimatedHours?: number;
  spent_hours?: number;
  spentHours?: number;
  logged_hours?: number;
  loggedHours?: number;
  due_date?: string;
  dueDate?: string;
  tags?: string[];
  checklist?: TaskChecklistItem[];
  comments?: TaskComment[];
  created_at: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  designation?: string;
  department?: string;
  joined_at?: string;
}

export interface Team {
  id: string;
  name: string;
  code?: string;
  description?: string;
  department: string;
  lead_id?: string;
  leadId?: string;
  lead_name?: string;
  leadName?: string;
  lead_avatar?: string;
  leadAvatar?: string;
  members: TeamMember[];
  members_count: number;
  membersCount?: number;
  projects_count?: number;
  projectsCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at?: string;
}
