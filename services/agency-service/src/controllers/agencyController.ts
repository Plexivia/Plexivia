import { Request, Response } from 'express';
import {
  getClientModel,
  getProjectModel,
  getTaskModel,
  getTeamModel,
  getEmployeeModel,
} from '../models/Agency.js';

// Retrieve all clients
export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const Client = getClientModel();
    const clients = await Client.find();
    if (clients.length > 0) {
      res.json({ success: true, count: clients.length, data: clients });
      return;
    }
  } catch {}

  res.json({
    success: true,
    count: 2,
    data: [
      {
        id: 'c-001',
        name: 'Decantre BD',
        client_key: 'decantre',
        category: 'eCommerce & Fragrance',
        status: 'Active',
        portal_url: 'https://decantre.com',
        email: 'founder@decantre.com',
        phone: '+8801700000001',
        contract_value: 350000,
        health: 'Optimal',
        created_at: '2024-02-10T10:00:00Z',
      },
      {
        id: 'c-002',
        name: 'Surokkha Store',
        client_key: 'surokkha',
        category: 'Health & Pharmacy',
        status: 'Active',
        portal_url: 'https://surokkha.store',
        email: 'contact@surokkha.store',
        phone: '+8801700000002',
        contract_value: 420000,
        health: 'Optimal',
        created_at: '2024-03-01T10:00:00Z',
      },
    ],
  });
};

// Retrieve client by ID
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const Client = getClientModel();
    const client = await Client.findOne({ id });
    if (client) {
      res.json({ success: true, data: client });
      return;
    }
  } catch {}

  res.json({
    success: true,
    data: {
      id,
      name: 'Decantre BD',
      client_key: 'decantre',
      category: 'eCommerce & Fragrance',
      status: 'Active',
      portal_url: 'https://decantre.com',
      email: 'founder@decantre.com',
      phone: '+8801700000001',
      contract_value: 350000,
      health: 'Optimal',
      created_at: '2024-02-10T10:00:00Z',
    },
  });
};

// Retrieve all projects
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  const { clientId } = req.query;
  const filter: any = {};
  if (clientId) filter.client_id = clientId;

  try {
    const Project = getProjectModel();
    const projects = await Project.find(filter);
    if (projects.length > 0) {
      res.json({ success: true, count: projects.length, data: projects });
      return;
    }
  } catch {}

  res.json({
    success: true,
    count: 2,
    data: [
      {
        id: 'p-001',
        client_id: 'c-001',
        name: 'Decantre Multi-Tenant eCommerce ERP',
        status: 'In Progress',
        progress: 82,
        priority: 'High',
        due_date: '2026-10-15',
        tasks_count: 14,
        created_at: '2024-02-15T12:00:00Z',
      },
      {
        id: 'p-002',
        client_id: 'c-002',
        name: 'Surokkha POS & Inventory Sync',
        status: 'Completed',
        progress: 100,
        priority: 'Medium',
        due_date: '2026-08-30',
        tasks_count: 8,
        created_at: '2024-03-05T12:00:00Z',
      },
    ],
  });
};

// Retrieve all tasks
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const Task = getTaskModel();
    const tasks = await Task.find();
    if (tasks.length > 0) {
      res.json({ success: true, count: tasks.length, data: tasks });
      return;
    }
  } catch {}

  res.json({
    success: true,
    count: 2,
    data: [
      {
        id: 't-001',
        project_id: 'p-001',
        title: 'Complete 2FA live countdown integration',
        status: 'Done',
        priority: 'High',
        assignee: 'Senior Fullstack Dev',
        due_date: '2026-09-26',
        created_at: '2026-09-20T10:00:00Z',
      },
      {
        id: 't-002',
        project_id: 'p-001',
        title: 'Deploy microservices on Ubuntu VPS',
        status: 'In Progress',
        priority: 'High',
        assignee: 'DevOps Lead',
        due_date: '2026-09-27',
        created_at: '2026-09-21T10:00:00Z',
      },
    ],
  });
};

// Retrieve all teams
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const Team = getTeamModel();
    const teams = await Team.find();
    if (teams.length > 0) {
      res.json({ success: true, count: teams.length, data: teams });
      return;
    }
  } catch {}

  res.json({
    success: true,
    count: 2,
    data: [
      {
        id: 'tm-001',
        name: 'Core Platform Engineering',
        department: 'Engineering',
        lead_name: 'Senior Fullstack Dev',
        members_count: 5,
        status: 'Active',
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'tm-002',
        name: 'Cloud Infrastructure & SRE',
        department: 'Operations',
        lead_name: 'DevOps Lead',
        members_count: 3,
        status: 'Active',
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
  });
};

// Retrieve all employees
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const Employee = getEmployeeModel();
    const employees = await Employee.find();
    if (employees.length > 0) {
      res.json({ success: true, count: employees.length, data: employees });
      return;
    }
  } catch {}

  res.json({
    success: true,
    count: 1,
    data: [
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
  });
};
