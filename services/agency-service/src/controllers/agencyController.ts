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
    const clients = await Client.find().sort({ created_at: -1 });
    res.json({ success: true, count: clients.length, data: clients });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

// Retrieve client by ID
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const Client = getClientModel();
    const client = await Client.findOne({ $or: [{ id }, { client_key: id }] });
    if (!client) {
      res.status(404).json({ success: false, message: `Client '${id}' not found` });
      return;
    }
    res.json({ success: true, data: client });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Retrieve all projects
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  const { clientId } = req.query;
  const filter: any = {};
  if (clientId) filter.client_id = clientId;

  try {
    const Project = getProjectModel();
    const projects = await Project.find(filter).sort({ created_at: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

// Retrieve all tasks
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const Task = getTaskModel();
    const tasks = await Task.find().sort({ created_at: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

// Retrieve all teams
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const Team = getTeamModel();
    const teams = await Team.find().sort({ created_at: -1 });
    res.json({ success: true, count: teams.length, data: teams });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

// Retrieve all employees
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const Employee = getEmployeeModel();
    const employees = await Employee.find().sort({ created_at: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};
