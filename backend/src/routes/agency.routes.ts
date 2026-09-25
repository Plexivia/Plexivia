import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';
import * as projectController from '../controllers/projectController.js';
import * as taskController from '../controllers/taskController.js';
import * as teamController from '../controllers/teamController.js';
import * as employeeController from '../controllers/employeeController.js';

const router = Router();

// Internal Agency Employees & Staff
router.get('/employees', employeeController.getEmployees);
router.post('/employees', employeeController.createEmployee);
router.get('/employees/:id', employeeController.getEmployeeById);
router.put('/employees/:id', employeeController.updateEmployee);
router.patch('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

// Agency Client Operations
router.get('/clients', clientController.getClients);
router.post('/clients', clientController.createClient);
router.get('/clients/:id', clientController.getClientById);
router.put('/clients/:id', clientController.updateClient);
router.patch('/clients/:id', clientController.updateClient);
router.delete('/clients/:id', clientController.deleteClient);
router.get('/clients/:id/modules', clientController.getClientModules);
router.put('/clients/:id/modules', clientController.updateClientModules);
router.patch('/clients/:id/modules', clientController.updateClientModules);
router.get('/clients/:id/domains', clientController.getClientDomains);
router.put('/clients/:id/domains', clientController.updateClientDomains);
router.patch('/clients/:id/domains', clientController.updateClientDomains);

// Internal Projects
router.get('/projects', projectController.getProjects);
router.post('/projects', projectController.createProject);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', projectController.updateProject);
router.patch('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// Tasks & Issue Tracking
router.get('/tasks', taskController.getTasks);
router.post('/tasks', taskController.createTask);
router.get('/tasks/:id', taskController.getTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.patch('/tasks/:id', taskController.updateTask);
router.put('/tasks/:id/status', taskController.updateTaskStatus);
router.delete('/tasks/:id', taskController.deleteTask);
router.post('/tasks/:id/checklist', taskController.handleChecklist);

// Teams & Squads
router.get('/teams', teamController.getTeams);
router.post('/teams', teamController.createTeam);
router.get('/teams/:id', teamController.getTeamById);
router.put('/teams/:id', teamController.updateTeam);
router.patch('/teams/:id', teamController.updateTeam);
router.delete('/teams/:id', teamController.deleteTeam);
router.post('/teams/:id/members', teamController.addTeamMember);
router.delete('/teams/:id/members/:memberId', teamController.removeTeamMember);

export default router;
