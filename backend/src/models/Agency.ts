import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';
import { IClient, getClientModel } from './Client.js';

export { IClient, getClientModel };

export interface IProject extends Document {
  dId: string;
  client_dId?: string;
  project_type_dId?: string;
  name: string;
  description?: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'Archived';
  progress: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  due_date: string;
  tasks_count: number;
  created_at: string;
}

export interface ITask extends Document {
  dId: string;
  project_dId?: string;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Testing' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee?: string;
  due_date?: string;
  created_at: string;
}

export interface ITeam extends Document {
  dId: string;
  name: string;
  department: string;
  lead_name: string;
  members_count: number;
  status: 'Active' | 'Busy';
  created_at: string;
}

export interface IEmployee extends Document {
  dId: string;
  employee_code: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  designation: string;
  salary_monthly: number;
  joined_date: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  created_at: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    client_dId: { type: String, index: true },
    project_type_dId: { type: String, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Planning', 'In Progress', 'Review', 'Completed', 'Archived'], default: 'Planning' },
    progress: { type: Number, default: 0 },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    due_date: { type: String, required: true },
    tasks_count: { type: Number, default: 0 },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'projects', timestamps: false }
);

const TaskSchema = new Schema<ITask>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    project_dId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Todo', 'In Progress', 'Testing', 'Done'], default: 'Todo' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    assignee: { type: String, default: '' },
    due_date: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'tasks', timestamps: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    name: { type: String, required: true },
    department: { type: String, required: true },
    lead_name: { type: String, required: true },
    members_count: { type: Number, default: 1 },
    status: { type: String, enum: ['Active', 'Busy'], default: 'Active' },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'teams', timestamps: false }
);

const EmployeeSchema = new Schema<IEmployee>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    employee_code: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    role: { type: String, default: 'DEV' },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    salary_monthly: { type: Number, default: 0 },
    joined_date: { type: String, default: () => new Date().toISOString() },
    status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'RESIGNED'], default: 'ACTIVE' },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'employees', timestamps: false }
);

// Retrieve or compile Project model
export const getProjectModel = (): mongoose.Model<IProject> => {
  if (operationsDbConnection) return operationsDbConnection.models.Project || operationsDbConnection.model<IProject>('Project', ProjectSchema);
  return mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
};

// Retrieve or compile Task model
export const getTaskModel = (): mongoose.Model<ITask> => {
  if (operationsDbConnection) return operationsDbConnection.models.Task || operationsDbConnection.model<ITask>('Task', TaskSchema);
  return mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
};

// Retrieve or compile Team model
export const getTeamModel = (): mongoose.Model<ITeam> => {
  if (operationsDbConnection) return operationsDbConnection.models.Team || operationsDbConnection.model<ITeam>('Team', TeamSchema);
  return mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
};

// Retrieve or compile Employee model
export const getEmployeeModel = (): mongoose.Model<IEmployee> => {
  if (operationsDbConnection) return operationsDbConnection.models.Employee || operationsDbConnection.model<IEmployee>('Employee', EmployeeSchema);
  return mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
};

