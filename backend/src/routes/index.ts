import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import * as clientController from '../controllers/clientController.js';
import * as projectController from '../controllers/projectController.js';
import * as taskController from '../controllers/taskController.js';
import * as teamController from '../controllers/teamController.js';

const router = Router();

// ============================================================================
// 1. Authentication & Me Routes (/api/auth/* & /api/v1/auth/*)
// ============================================================================
router.post('/auth/login', authController.login);
router.post('/auth/2fa/verify', authController.verify2fa);
router.get('/auth/me', authController.getMe);
router.post('/v1/auth/login', authController.login);
router.post('/v1/auth/2fa/verify', authController.verify2fa);
router.get('/v1/auth/me', authController.getMe);

// ============================================================================
// 2. Users Collection Routes (/api/users/* & /api/v1/admin/users/*)
// ============================================================================
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.patch('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Document studio & admin aliases
router.get('/v1/admin/users', userController.getUsers);
router.post('/v1/admin/users', userController.createUser);
router.get('/v1/admin/users/:id', userController.getUserById);
router.put('/v1/admin/users/:id', userController.updateUser);
router.patch('/v1/admin/users/:id', userController.updateUser);
router.delete('/v1/admin/users/:id', userController.deleteUser);

// ============================================================================
// 3. Clients Collection Routes (/api/clients/*)
// ============================================================================
router.get('/clients', clientController.getClients);
router.post('/clients', clientController.createClient);
router.get('/clients/:id', clientController.getClientById);
router.put('/clients/:id', clientController.updateClient);
router.patch('/clients/:id', clientController.updateClient);
router.delete('/clients/:id', clientController.deleteClient);

// ============================================================================
// 4. Projects Collection Routes (/api/projects/*)
// ============================================================================
router.get('/projects', projectController.getProjects);
router.post('/projects', projectController.createProject);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', projectController.updateProject);
router.patch('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// ============================================================================
// 5. Tasks & Kanban Collection Routes (/api/tasks/* & /api/issues/*)
// ============================================================================
router.get('/tasks', taskController.getTasks);
router.post('/tasks', taskController.createTask);
router.get('/tasks/:id', taskController.getTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.patch('/tasks/:id', taskController.updateTask);
router.put('/tasks/:id/status', taskController.updateTaskStatus);
router.delete('/tasks/:id', taskController.deleteTask);
router.post('/tasks/:id/checklist', taskController.handleChecklist);

// Issues aliases for issue-tracker compatibility
router.get('/issues', taskController.getTasks);
router.post('/issues', taskController.createTask);
router.get('/issues/:id', taskController.getTaskById);
router.put('/issues/:id', taskController.updateTask);
router.patch('/issues/:id', taskController.updateTask);
router.delete('/issues/:id', taskController.deleteTask);
router.post('/issues/:id/checklist', taskController.handleChecklist);

// ============================================================================
// 6. Teams Collection Routes (/api/teams/* & /api/team/*)
// ============================================================================
router.get('/teams', teamController.getTeams);
router.get('/team', teamController.getTeams);
router.post('/teams', teamController.createTeam);
router.post('/team', teamController.createTeam);
router.get('/teams/:id', teamController.getTeamById);
router.get('/team/:id', teamController.getTeamById);
router.put('/teams/:id', teamController.updateTeam);
router.patch('/teams/:id', teamController.updateTeam);
router.put('/team/:id', teamController.updateTeam);
router.patch('/team/:id', teamController.updateTeam);
router.delete('/teams/:id', teamController.deleteTeam);
router.delete('/team/:id', teamController.deleteTeam);
router.post('/teams/:id/members', teamController.addTeamMember);
router.post('/team/:id/members', teamController.addTeamMember);
router.delete('/teams/:id/members/:memberId', teamController.removeTeamMember);
router.delete('/team/:id/members/:memberId', teamController.removeTeamMember);

export default router;
