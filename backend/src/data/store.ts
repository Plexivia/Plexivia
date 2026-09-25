import {
  Admin,
  ClientVaultItem,
  SupportTicket,
  ProjectDoc,
  Employee,
  Project,
  Task,
  Team,
  Invoice,
  Payment,
  Bill,
  PayrollRecord,
  Client,
} from '../types/index.js';

export interface DataStore {
  admins: Admin[];
  clientVault: ClientVaultItem[];
  supportTickets: SupportTicket[];
  projectDocs: ProjectDoc[];
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  teams: Team[];
  invoices: Invoice[];
  payments: Payment[];
  bills: Bill[];
  payrolls: PayrollRecord[];
  clients: Client[];
  // Legacy alias
  users: Admin[];
}

export const Store: DataStore = {
  admins: [
    {
      id: 'adm-001',
      email: 'admin@plexivia.com',
      full_name: 'Plexivia Super Owner',
      role: 'OWNER',
      is_active: true,
      two_factor_enabled: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'adm-002',
      email: 'accountant@plexivia.com',
      full_name: 'Lead Accountant',
      role: 'ACCOUNTANT',
      is_active: true,
      two_factor_enabled: false,
      created_at: new Date().toISOString(),
    },
  ],
  clientVault: [
    {
      id: 'vlt-001',
      client_id: 'c-001',
      client_key: 'decantre',
      business_name: 'Decantre BD',
      vps_ip: '139.59.102.14',
      vps_ssh_port: 22,
      vps_ssh_user: 'root',
      db_connection_uri: 'mongodb://root:***@139.59.102.14:27017/decantre_db?authSource=admin',
      created_at: new Date().toISOString(),
    },
  ],
  supportTickets: [],
  projectDocs: [],
  employees: [
    {
      id: 'emp-001',
      employee_code: 'EMP-101',
      email: 'dev1@plexivia.com',
      full_name: 'Senior Fullstack Dev',
      role: 'DEV',
      department: 'Engineering',
      designation: 'Sr. Software Engineer',
      salary_monthly: 120000,
      joined_date: '2024-01-15',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
  ],
  projects: [],
  tasks: [],
  teams: [],
  invoices: [],
  payments: [],
  bills: [],
  payrolls: [],
  clients: [],
  users: [],
};

// Sync legacy users array to admins array for backward compatibility
Store.users = Store.admins;
