export interface VPSNode {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  sshPort: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'REBOOTING' | 'SYNCING';
  isMaster: boolean;
  region: string;
  os: string;
  cpu: {
    cores: number;
    usagePercent: number;
    loadAvg: [number, number, number];
  };
  ram: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
  };
  disk: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    partitions: Array<{
      mountPoint: string;
      totalBytes: number;
      usedBytes: number;
      usagePercent: number;
    }>;
  };
  uptime: {
    seconds: number;
    formatted: string;
    percent: number;
  };
  network: {
    pingMs: number;
    rxBytesPerSec: number;
    txBytesPerSec: number;
    interfaces: Array<{
      name: string;
      ip: string;
      rxBytes: number;
      txBytes: number;
    }>;
  };
  containers: Array<{
    name: string;
    image: string;
    status: 'running' | 'restarting' | 'stopped';
    port: string;
    cpuPercent: number;
    memoryMb: number;
  }>;
  lastHeartbeat: string;
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
  status: 'SENT' | 'FAILED' | 'QUEUED';
  smtpServer: string;
  sender: string;
  messageId: string;
  timestamp: string;
  errorMessage?: string;
  sizeBytes: number;
  metadata?: Record<string, any>;
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

export type PlexiviaProjectType = 'ECOMMERCE_MULTITENANT' | 'CUSTOM_WEB' | 'SRE_INFRA' | 'MOBILE_APP' | 'SYSTEM_MIGRATION' | 'INTERNAL_TOOL';
export type PlexiviaProjectStatus = 'PLANNING' | 'ACTIVE' | 'MAINTENANCE' | 'ARCHIVED' | 'DEPLOYING' | 'COMPLETED' | 'PAUSED';

export interface PlexiviaProject {
  id: string;
  name: string;
  code: string;
  description: string;
  clientId?: string;
  clientName?: string;
  type: PlexiviaProjectType;
  status: PlexiviaProjectStatus;
  progressPercent: number;
  leadId?: string;
  leadName?: string;
  leadAvatar?: string;
  gitRepoUrl?: string;
  productionUrl?: string;
  stagingUrl?: string;
  dueDate?: string;
  tasksCount: {
    total: number;
    completed: number;
    inProgress: number;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type PlexiviaIssueStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type PlexiviaIssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT';
export type PlexiviaIssueType = 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'TASK' | 'EPIC' | 'INFRA';

export interface PlexiviaChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface PlexiviaIssue {
  id: string;
  issueKey: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  title: string;
  description?: string;
  status: PlexiviaIssueStatus;
  priority: PlexiviaIssuePriority;
  issueType: PlexiviaIssueType;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  reporterId?: string;
  reporterName?: string;
  estimatedHours?: number;
  spentHours?: number;
  loggedHours?: number;
  dueDate?: string;
  tags?: string[];
  checklist?: PlexiviaChecklistItem[];
  commentsCount?: number;
  attachmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PlexiviaDocCategory = 'ARCHITECTURE' | 'API_SPEC' | 'RUNBOOK' | 'DEPLOYMENT' | 'CLIENT_BRIEF' | 'SRE_GUIDE' | 'GENERAL';
export type PlexiviaDocStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface PlexiviaDoc {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  category: PlexiviaDocCategory;
  status: PlexiviaDocStatus;
  projectId?: string;
  projectName?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  version: string;
  tags?: string[];
  isPublic?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlexiviaIssueFilters {
  status?: string;
  priority?: string;
  project?: string;
  projectId?: string;
  assignee?: string;
  assigneeId?: string;
  issueType?: string;
  search?: string;
}

export interface PlexiviaProjectFilters {
  status?: string;
  type?: string;
  clientId?: string;
  search?: string;
}

export interface PlexiviaDocFilters {
  category?: string;
  status?: string;
  projectId?: string;
  search?: string;
}

