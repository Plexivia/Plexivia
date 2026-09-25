import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';

export interface IClient extends Document {
  id: string;
  name: string;
  client_key: string;
  category: string;
  status: 'Active' | 'Pending' | 'Suspended';
  portal_url: string;
  email: string;
  phone: string;
  created_at: string;
  contract_value?: number;
  country?: string;
  health?: 'Optimal' | 'Warning' | 'Critical';
}

export interface IProject extends Document {
  id: string;
  client_id: string;
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
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Testing' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee?: string;
  due_date?: string;
  created_at: string;
}

export interface ITeam extends Document {
  id: string;
  name: string;
  department: string;
  lead_name: string;
  members_count: number;
  status: 'Active' | 'Busy';
  created_at: string;
}

export interface IEmployee extends Document {
  id: string;
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

const ClientSchema = new Schema<IClient>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  client_key: { type: String, required: true, unique: true, index: true },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['Active', 'Pending', 'Suspended'], default: 'Active' },
  portal_url: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  contract_value: { type: Number, default: 0 },
  country: { type: String, default: 'BD' },
  health: { type: String, enum: ['Optimal', 'Warning', 'Critical'], default: 'Optimal' },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'clients', timestamps: false });

const ProjectSchema = new Schema<IProject>({
  id: { type: String, required: true, unique: true, index: true },
  client_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Planning', 'In Progress', 'Review', 'Completed', 'Archived'], default: 'Planning' },
  progress: { type: Number, default: 0 },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  due_date: { type: String, required: true },
  tasks_count: { type: Number, default: 0 },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'projects', timestamps: false });

const TaskSchema = new Schema<ITask>({
  id: { type: String, required: true, unique: true, index: true },
  project_id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Testing', 'Done'], default: 'Todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  assignee: { type: String, default: '' },
  due_date: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'tasks', timestamps: false });

const TeamSchema = new Schema<ITeam>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  lead_name: { type: String, required: true },
  members_count: { type: Number, default: 1 },
  status: { type: String, enum: ['Active', 'Busy'], default: 'Active' },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { collection: 'teams', timestamps: false });

const EmployeeSchema = new Schema<IEmployee>({
  id: { type: String, required: true, unique: true, index: true },
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
}, { collection: 'employees', timestamps: false });

// Retrieve or compile Client model
export const getClientModel = (): mongoose.Model<IClient> => {
  if (operationsDbConnection) return operationsDbConnection.models.Client || operationsDbConnection.model<IClient>('Client', ClientSchema);
  return mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
};

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
