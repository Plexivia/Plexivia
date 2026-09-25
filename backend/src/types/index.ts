// ============================================================================
// Plexivia Micro-Backends Core Entity Types & Schemas
// Services: PlexiAuth, PlexiHub, PlexiAgency, PlexiFinance
// ============================================================================

// 1. 🔐 PlexiAuth (Admin IAM & Client Secrets Vault)
export type AdminRole = 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'SUPER_ADMIN' | 'PM' | 'DEV' | 'DESIGNER' | 'SRE' | 'MEMBER' | string;
export type AdminStatus = 'ACTIVE' | 'INACTIVE' | 'AWAY' | 'OFFLINE' | 'SUSPENDED' | 'LOCKED' | string;

export interface ServicePermissions {
  auth?: boolean;
  hub?: boolean;
  agency?: boolean;
  finance?: boolean;
}

export interface ModulePermissions {
  invoices?: string[];
  payments?: string[];
  bills?: string[];
  payroll?: string[];
  clientVault?: string[];
  vpsTelemetry?: string[];
  projects?: string[];
  tasks?: string[];
  teams?: string[];
  [key: string]: string[] | undefined;
}

export interface AdminPermissions {
  services: ServicePermissions;
  modules: ModulePermissions;
}

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  username?: string;
  role: AdminRole;
  department?: string;
  designation?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  avatar_url?: string;
  is_active: boolean;
  status?: AdminStatus;
  two_factor_enabled?: boolean;
  two_factor_secret?: string;
  permissions?: AdminPermissions;
  hourly_rate?: number;
  active_tasks_count?: number;
  total_logged_hours?: number;
  last_login_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ClientVaultItem {
  id: string;
  client_id: string;
  client_key: string;
  business_name: string;
  vps_ip?: string;
  vps_ssh_port?: number;
  vps_ssh_user?: string;
  vps_ssh_private_key?: string;
  db_connection_uri?: string;
  api_secret_keys?: Record<string, string>;
  secure_notes?: string;
  created_at: string;
  updated_at?: string;
}

// 2. 🌐 PlexiHub (Support, Telemetry & Docs)
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED' | 'CLOSED';
export type SupportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: 'CLIENT' | 'SUPPORT_AGENT' | 'SYSTEM';
  sender_name: string;
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface SupportTicket {
  id: string;
  client_id: string;
  client_name: string;
  subject: string;
  category: 'VPS_SERVER' | 'DEPLOYMENT' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG';
  priority: SupportPriority;
  status: SupportTicketStatus;
  messages: SupportMessage[];
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectDoc {
  id: string;
  client_id: string;
  title: string;
  slug: string;
  category: string;
  content_markdown: string;
  is_public_to_client: boolean;
  version: string;
  created_at: string;
  updated_at?: string;
}

export interface SystemTelemetry {
  cpu_usage_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  uptime_seconds: number;
  active_containers: number;
  services_status: {
    auth: 'healthy' | 'degraded' | 'down';
    hub: 'healthy' | 'degraded' | 'down';
    agency: 'healthy' | 'degraded' | 'down';
    finance: 'healthy' | 'degraded' | 'down';
  };
}

// 3. 🏢 PlexiAgency (Projects, Tasks, Employees & Teams)
export type EmployeeRole = 'PM' | 'DEV' | 'DESIGNER' | 'SRE' | 'QA' | 'INTERN';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED';

export interface Employee {
  id: string;
  employee_code: string;
  email: string;
  full_name: string;
  name?: string;
  role: EmployeeRole;
  department: string;
  designation: string;
  phone?: string;
  salary_monthly?: number;
  joined_date: string;
  status: EmployeeStatus;
  active_tasks_count?: number;
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

// 4. 💳 PlexiFinance (Invoices, Payments, Bills, Payroll)
export type InvoiceStatus = 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'DRAFT' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string;
  issued_date: string;
  items: InvoiceItem[];
  payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  invoice_id?: string;
  client_id: string;
  client_name: string;
  amount: number;
  currency: string;
  payment_method: 'BKASH' | 'NAGAD' | 'BANK_TRANSFER' | 'STRIPE' | 'CASH';
  transaction_ref: string;
  received_at: string;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED';
  notes?: string;
  created_at: string;
}

export interface Bill {
  id: string;
  bill_number: string;
  vendor_name: string;
  category: 'INFRA_SERVER' | 'SAAS_SUBSCRIPTION' | 'OFFICE_RENT' | 'UTILITIES' | 'MARKETING' | 'MISC';
  amount: number;
  currency: string;
  due_date: string;
  paid_date?: string;
  status: 'PAID' | 'UNPAID' | 'PENDING';
  receipt_url?: string;
  created_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  month: string;
  basic_salary: number;
  bonuses?: number;
  deductions?: number;
  net_payable: number;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
  disbursed_at?: string;
  created_at: string;
}

export interface FinancialSummary {
  total_revenue: number;
  monthly_recurring_revenue: number;
  total_expenses: number;
  net_profit: number;
  unpaid_invoices_amount: number;
  pending_payroll_amount: number;
  active_retainers_count: number;
}

// Client Multi-Tenant Model (for backward compatibility & agency reference)
export type ClientType = 'SINGLE_TENANT' | 'MULTI_TENANT_ECOMMERCE' | 'CORPORATE';
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'ONBOARDING' | 'MAINTENANCE' | 'ARCHIVED';

export interface ClientModules {
  cpanelAccess?: boolean;
  multiWarehouse?: boolean;
  posIntegration?: boolean;
  advancedReports?: boolean;
  [key: string]: boolean | undefined;
}

export interface ClientDomains {
  storefrontUrl?: string;
  storefrontApiUrl?: string;
  dashboardUrl?: string;
  dashboardApiUrl?: string;
  cpanelUrl?: string;
}

export interface ClientVPSConfig {
  ip?: string;
  agentPort?: number;
  agentSecretHash?: string;
}

export interface Client {
  id: string;
  did?: string;
  client_key?: string;
  clientKey?: string;
  business_name: string;
  businessName?: string;
  brandName?: string;
  primary_domain?: string;
  primaryDomain?: string;
  domain?: string;
  client_type?: ClientType;
  type?: string;
  database_shared?: boolean;
  status: ClientStatus;
  monthly_revenue?: number;
  monthly_retainer?: number;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  projects_count?: number;
  modules?: ClientModules;
  domains?: ClientDomains;
  vps?: ClientVPSConfig;
  created_at: string;
  updated_at?: string;
}

export interface Client360View {
  client: Client;
  projects: Project[];
  financials: {
    monthly_retainer: number;
    total_paid: number;
    unpaid_invoices_amount: number;
    unpaid_invoices_count: number;
    invoices: Invoice[];
    payments: Payment[];
  };
  support: {
    open_tickets_count: number;
    total_tickets_count: number;
    tickets: SupportTicket[];
    docs_count: number;
    docs: ProjectDoc[];
  };
  vault: {
    vps_configured: boolean;
    db_configured: boolean;
    ssh_configured: boolean;
  };
}

// Legacy User reference alias
export type User = Admin;
export type UserRole = AdminRole;
export type UserStatus = AdminStatus;
