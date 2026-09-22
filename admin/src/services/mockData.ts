import { 
  Client, 
  Project, 
  Task, 
  User, 
  VPSNode, 
  ServiceHealth, 
  MailLog, 
  GitRepo, 
  CloudflareBackup, 
  ActivityLog, 
  TimeLog, 
  SystemStats 
} from '../types';

export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_USERS: User[] = [];
export const INITIAL_VPS_NODES: VPSNode[] = [];
export const INITIAL_SERVICES: ServiceHealth[] = [];
export const INITIAL_BACKUPS: CloudflareBackup[] = [];
export const INITIAL_REPOS: GitRepo[] = [];
export const INITIAL_MAIL_LOGS: MailLog[] = [];
export const INITIAL_TIME_LOGS: TimeLog[] = [];
export const INITIAL_ACTIVITIES: ActivityLog[] = [];
export const INITIAL_STATS: SystemStats | null = null;
