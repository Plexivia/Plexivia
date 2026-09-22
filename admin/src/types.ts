export type ClientType = 'SINGLE_TENANT' | 'MULTI_TENANT_ECOMMERCE';
export type ProjectType = 'ECOMMERCE_MULTITENANT' | 'CUSTOM_WEB' | 'SRE_INFRA' | 'MOBILE_APP' | 'SYSTEM_MIGRATION';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'MAINTENANCE' | 'ARCHIVED' | 'DEPLOYING' | 'COMPLETED' | 'PAUSED';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'SUPER_ADMIN' | 'PM' | 'DEV' | 'DESIGNER' | 'SRE' | (string & {});
export type NodeStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'REBOOTING' | 'SYNCING';
export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'WARNING';
export type NavTab = 'overview' | 'projects' | 'clients' | 'timer' | 'team' | 'fleet' | 'sre' | 'mail' | 'git' | 'backups' | 'settings' | 'documents';
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'ONBOARDING' | 'MAINTENANCE' | 'ARCHIVED' | 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'REBOOTING' | 'SYNCING' | 'HEALTHY' | 'DOWN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'AWAY' | 'OFFLINE';

export interface MenuItem {
  title: string;
  url: string;
  icon?: any;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  items?: MenuItem[];
}

export interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}


export interface Client {
  id: string;
  client_key?: string;
  business_name?: string;
  primary_domain?: string;
  client_type?: ClientType;
  database_shared?: boolean;
  status?: ClientStatus;
  monthly_revenue?: number;
  monthly_retainer?: number;
  contact_email?: string;
  contact_phone?: string;
  projects_count?: number;
  created_at?: string;
}

export interface Project {
  id: string;
  client_id?: string;
  client_name?: string;
  project_name?: string;
  project_code?: string;
  project_type?: ProjectType;
  git_repo_url?: string;
  production_url?: string;
  staging_url?: string;
  status?: ProjectStatus;
  progress_percent?: number;
  lead_id?: string;
  lead_name?: string;
  due_date?: string;
  tasks_count?: {
    total: number;
    completed: number;
  };
  created_at?: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
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
  project_id?: string;
  project_name?: string;
  project_code?: string;
  assignee_id?: string;
  assignee_name?: string;
  assignee_avatar?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_hours?: number;
  spent_hours?: number;
  logged_hours?: number;
  estimate_points?: number;
  due_date?: string;
  tags?: string[];
  checklist?: TaskChecklistItem[];
  comments?: TaskComment[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  did?: string;
  name?: string;
  full_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: UserRole | string;
  department?: string;
  designation?: string;
  subRole?: string;
  avatar?: string;
  avatar_url?: string;
  is_active?: boolean;
  status?: string;
  hourly_rate?: number;
  active_tasks_count?: number;
  total_logged_hours?: number;
  created_at?: string;
}

export interface VPSNode {
  id: string;
  name?: string;
  node_name?: string;
  hostname?: string;
  ipAddress?: string;
  ip_address?: string;
  sshPort?: number;
  ssh_port?: number;
  status: NodeStatus;
  isMaster?: boolean;
  is_master?: boolean;
  region?: string;
  location?: string;
  os?: string;
  cpu_percent?: number;
  ram_percent?: number;
  disk_percent?: number;
  docker_containers_count?: number;
  uptime_days?: number;
  last_ping?: string;
  cpu?: {
    cores: number;
    usagePercent: number;
    loadAvg: [number, number, number];
  };
  ram?: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
  };
  disk?: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    partitions?: Array<{
      mountPoint: string;
      totalBytes: number;
      usedBytes: number;
      usagePercent: number;
    }>;
  };
  uptime?: {
    seconds: number;
    formatted: string;
    percent: number;
  };
  network?: {
    pingMs: number;
    rxBytesPerSec: number;
    txBytesPerSec: number;
    interfaces?: Array<{
      name: string;
      ip: string;
      rxBytes: number;
      txBytes: number;
    }>;
  };
  containers?: Array<{
    name: string;
    image: string;
    status: 'running' | 'restarting' | 'stopped';
    port: string;
    cpuPercent: number;
    memoryMb: number;
  }>;
  lastHeartbeat?: string;
}

export interface ServiceHealth {
  id: string;
  name: string;
  service_key?: string;
  port: number;
  ingress_domain: string;
  internal_url?: string;
  version: string;
  status: ServiceStatus;
  latency_ms: number;
  uptime_percent: number;
  description: string;
  last_checked: string;
}

export interface CloudflareBackup {
  id: string;
  filename: string;
  size_bytes?: number;
  size_formatted?: string;
  size_human?: string;
  r2_bucket?: string;
  bucket?: string;
  account_id?: string;
  sha256_checksum?: string;
  checksum?: string;
  database_name?: string;
  created_at?: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'COMPLETED' | 'RUNNING' | 'NEVER';
  email_notified_to?: string;
  download_url?: string;
}

export interface GitRepo {
  id: string;
  name: string;
  full_name?: string;
  description: string;
  clone_url_https?: string;
  clone_url_http?: string;
  clone_url_ssh: string;
  dual_remote_guide?: string;
  stars_count?: number;
  stars?: number;
  forks_count?: number;
  forks?: number;
  open_issues?: number;
  default_branch?: string;
  is_private?: boolean;
  last_commit_message?: string;
  last_commit_author?: string;
  last_commit_time?: string;
  last_commit?: {
    sha: string;
    message: string;
    author: string;
    timestamp: string;
  };
}

export interface MailLog {
  id: string;
  recipient: string;
  subject: string;
  template_type?: string;
  template?: string;
  status: 'SENT' | 'FAILED' | 'QUEUED' | 'DELIVERED' | 'BOUNCED';
  sent_at?: string;
  timestamp?: string;
  message_id?: string;
  messageId?: string;
  size_bytes?: number;
  sizeBytes?: number;
  sender?: string;
  queued_at?: string;
  delivered_at?: string;
  latency_ms?: number;
  error_message?: string;
}

export interface TimeLog {
  id: string;
  task_id: string;
  task_title?: string;
  project_id?: string;
  project_name?: string;
  user_id: string;
  user_name?: string;
  minutes?: number;
  duration_minutes?: number;
  billable?: boolean;
  date?: string;
  notes?: string;
  logged_at?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_avatar?: string;
  action: string;
  target_type: 'PROJECT' | 'TASK' | 'CLIENT' | 'SRE' | 'BACKUP' | 'MAIL' | 'FLEET' | 'SYSTEM';
  target_name: string;
  timestamp: string;
}

export interface SystemStats {
  active_clients?: number;
  total_clients?: number;
  multitenant_clients?: number;
  active_projects?: number;
  total_active_projects?: number;
  open_tasks?: number;
  pending_tasks?: number;
  completed_tasks_today?: number;
  hours_logged_this_week?: number;
  last_backup_time?: string;
  last_backup_size?: string;
  team_members?: number;
  system_uptime_percent?: number;
  system_health_score?: number;
  average_latency_ms?: number;
  total_storage_mb?: number;
  backups_count?: number;
  monthly_recurring_revenue?: number;
  total_revenue_monthly?: number;
  vps_nodes_online?: number;
  vps_nodes_total?: number;
}

export interface AnomalyAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  nodeId: string;
  nodeName: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface ContainerHealth {
  name: string;
  internalPort: number;
  ingressDomain: string;
  responsibility: string;
  status: 'healthy' | 'unhealthy' | 'starting';
  cpuPercent: number;
  memoryMb: number;
  memoryLimitMb: number;
  restarts: number;
  uptimeSeconds: number;
}

export interface TelemetryPacket {
  timestamp: string;
  cpu: {
    overallUsage: number;
    cores: number[];
    loadAvg: [number, number, number];
  };
  ram: {
    totalGb: number;
    usedGb: number;
    cachedGb: number;
    freeGb: number;
    usagePercent: number;
  };
  network: {
    rxKbps: number;
    txKbps: number;
    activeConnections: number;
    packetLossPercent: number;
  };
  disk: {
    readIops: number;
    writeIops: number;
    diskUsagePercent: number;
  };
  activeAnomaliesCount: number;
}

export interface EmailLogEntry {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: 'SENT' | 'FAILED' | 'QUEUED' | 'DELIVERED' | 'BOUNCED';
  smtpServer: string;
  sender: string;
  messageId: string;
  timestamp: string;
  errorMessage?: string;
  sizeBytes: number;
  metadata?: Record<string, any>;
  queued_at?: string;
  delivered_at?: string;
  latency_ms?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  defaultRecipient: string;
  variables: string[];
  htmlPreview: string;
}

export interface GiteaRepository {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  defaultBranch: string;
  cloneUrlHttps: string;
  cloneUrlSsh: string;
  starsCount: number;
  forksCount: number;
  openIssues: number;
  lastCommit: {
    sha: string;
    message: string;
    author: string;
    timestamp: string;
  };
}

export interface BackupArchive {
  id: string;
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  checksumSha256: string;
  storageTarget: 'Cloudflare R2' | 'Dual (R2 + Local Disk)';
  r2Bucket: string;
  r2Key: string;
  status: 'AVAILABLE' | 'SYNCING' | 'CORRUPTED';
  type: 'POSTGRES_DUMP' | 'FULL_SYSTEM_SNAPSHOT';
  downloadUrl: string;
}

export interface BackupStatus {
  cloudflareAccountId: string;
  r2Bucket: string;
  cronSchedule: string;
  cronFile: string;
  notificationRecipient: string;
  retentionPolicy: string;
  lastBackupStatus: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'NEVER';
  lastBackupTime: string;
  totalBackupsCount: number;
  totalR2StorageBytes: number;
  totalR2StorageFormatted: string;
  isTriggering?: boolean;
}

export interface SystemVersion {
  version: string;
  buildNumber: string;
  releaseDate: string;
  commitSha: string;
  environment: string;
  baseline: string;
  services: Array<{
    name: string;
    version: string;
    status: 'ONLINE' | 'DEGRADED';
  }>;
}
