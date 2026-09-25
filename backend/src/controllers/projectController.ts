import { Request, Response } from 'express';
import { getProjectModel } from '../models/Agency.js';

// Retrieve all agency projects with status, client, and search filtering
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { status, clientId, client_id, search } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = new RegExp(`^${status}$`, 'i');
    }
    const targetClientId = clientId || client_id;
    if (targetClientId) {
      filter.client_id = targetClientId;
    }
    if (search) {
      const q = String(search);
      filter.name = new RegExp(q, 'i');
    }

    const ProjectModel = getProjectModel();
    const projects = await ProjectModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve projects' });
  }
};

// Retrieve a single agency project by unique identifier
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ProjectModel = getProjectModel();
    const project = await ProjectModel.findOne({ id });

    if (!project) {
      return res.status(404).json({ success: false, message: `Project '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve project' });
  }
};

// Create a new agency project record in database
export const createProject = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const projectName = data.name || data.project_name;
    if (!projectName) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const clientId = data.clientId || data.client_id || 'c-001';
    const ProjectModel = getProjectModel();

    const created = await ProjectModel.create({
      id: data.id || `p-${Date.now().toString().slice(-4)}`,
      client_id: clientId,
      name: projectName.trim(),
      description: data.description || '',
      status: data.status || 'Planning',
      progress: Number(data.progress || data.progressPercent || 0),
      priority: data.priority || 'Medium',
      due_date: data.due_date || data.dueDate || new Date().toISOString(),
      tasks_count: 0,
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Project '${created.name}' created successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create project' });
  }
};

// Update an existing agency project by identifier
export const updateProject = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const ProjectModel = getProjectModel();

    const project = await ProjectModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: `Project '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Project '${project.name}' updated successfully`,
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update project' });
  }
};

// Delete an agency project record by identifier
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ProjectModel = getProjectModel();
    const deleted = await ProjectModel.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: `Project '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Project '${deleted.name}' deleted successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete project' });
  }
};
