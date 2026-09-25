import { Router } from 'express';
import {
  getClients,
  getClientById,
  getProjects,
  getTasks,
  getTeams,
  getEmployees,
} from '../controllers/agencyController.js';
import { getClient360 } from '../controllers/client360Controller.js';

export const agencyRouter = Router();

// Route: Clients
agencyRouter.get('/clients', getClients);
agencyRouter.get('/clients/:id', getClientById);
agencyRouter.get('/clients/:id/360', getClient360);
agencyRouter.get('/clients/:id/overview', getClient360);

// Route: Projects
agencyRouter.get('/projects', getProjects);

// Route: Tasks
agencyRouter.get('/tasks', getTasks);

// Route: Teams
agencyRouter.get('/teams', getTeams);

// Route: Employees
agencyRouter.get('/employees', getEmployees);
