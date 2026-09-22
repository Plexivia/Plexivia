import { Request, Response } from 'express';
import { PlexiviaProjectService } from '../services/PlexiviaProjectService.js';
import { PlexiviaProjectFilters } from '../types/index.js';

export const getProjects = (req: Request, res: Response) => {
  try {
    const filters: PlexiviaProjectFilters = {
      status: req.query.status as string,
      type: req.query.type as string,
      clientId: req.query.clientId as string,
      search: req.query.search as string
    };

    const projects = PlexiviaProjectService.getAll(filters);
    return res.json({
      status: 'success',
      count: projects.length,
      timestamp: new Date().toISOString(),
      data: projects
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to retrieve projects' });
  }
};

export const getProjectById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = PlexiviaProjectService.getById(id);

    if (!project) {
      return res.status(404).json({ status: 'error', message: `Plexivia Project '${id}' not found` });
    }

    return res.json({
      status: 'success',
      data: project
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to retrieve project' });
  }
};

export const createProject = (req: Request, res: Response) => {
  try {
    const projectData = req.body;
    if (!projectData.name) {
      return res.status(400).json({ status: 'error', message: 'Project name is required' });
    }

    const created = PlexiviaProjectService.create(projectData);
    return res.status(201).json({
      status: 'success',
      message: `Plexivia Project '${created.name}' (${created.code}) created successfully`,
      data: created
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to create project' });
  }
};

export const updateProject = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const updated = PlexiviaProjectService.update(id, updates);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: `Plexivia Project '${id}' not found` });
    }

    return res.json({
      status: 'success',
      message: `Plexivia Project '${updated.name}' updated successfully`,
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to update project' });
  }
};

export const deleteProject = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const success = PlexiviaProjectService.delete(id);

    if (!success) {
      return res.status(404).json({ status: 'error', message: `Plexivia Project '${id}' not found` });
    }

    return res.json({
      status: 'success',
      message: `Plexivia Project '${id}' deleted successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to delete project' });
  }
};
