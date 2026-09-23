import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { Project } from '../types/index.js';

export const getProjects = (req: Request, res: Response) => {
  try {
    const { status, type, clientId, client_id, teamId, team_id, search } = req.query;
    let projects = [...Store.projects];

    if (status) {
      projects = projects.filter(p => String(p.status).toLowerCase() === String(status).toLowerCase());
    }
    if (type) {
      const pType = String(type).toLowerCase();
      projects = projects.filter(p =>
        (p.type && String(p.type).toLowerCase() === pType) ||
        (p.project_type && String(p.project_type).toLowerCase() === pType)
      );
    }
    const targetClientId = clientId || client_id;
    if (targetClientId) {
      projects = projects.filter(p => p.clientId === targetClientId || p.client_id === targetClientId);
    }
    const targetTeamId = teamId || team_id;
    if (targetTeamId) {
      projects = projects.filter(p => p.teamId === targetTeamId || p.team_id === targetTeamId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      projects = projects.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.clientName?.toLowerCase().includes(q) ||
        p.client_name?.toLowerCase().includes(q)
      );
    }

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

export const getProjectById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = Store.projects.find(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());

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

export const createProject = (req: Request, res: Response) => {
  try {
    const data = req.body;
    const projectName = data.name || data.project_name;
    if (!projectName) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const projectCode = data.code || data.project_code || projectName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 6);
    const clientId = data.clientId || data.client_id;
    let clientName = data.clientName || data.client_name;
    if (clientId && !clientName) {
      const foundClient = Store.clients.find(c => c.id === clientId);
      if (foundClient) clientName = foundClient.business_name;
    }

    const newProject: Project = {
      id: data.id || `p-${Date.now().toString().slice(-4)}`,
      name: projectName.trim(),
      project_name: projectName.trim(),
      code: projectCode,
      project_code: projectCode,
      description: data.description || '',
      clientId,
      client_id: clientId,
      clientName,
      client_name: clientName,
      type: data.type || data.project_type || 'CUSTOM_WEB',
      project_type: data.project_type || data.type || 'CUSTOM_WEB',
      teamId: data.teamId || data.team_id,
      team_id: data.team_id || data.teamId,
      teamName: data.teamName || data.team_name,
      team_name: data.team_name || data.teamName,
      status: data.status || 'PLANNING',
      progressPercent: Number(data.progressPercent || data.progress_percent || 0),
      progress_percent: Number(data.progress_percent || data.progressPercent || 0),
      leadId: data.leadId || data.lead_id,
      lead_id: data.lead_id || data.leadId,
      leadName: data.leadName || data.lead_name,
      lead_name: data.lead_name || data.leadName,
      leadAvatar: data.leadAvatar || data.lead_avatar,
      lead_avatar: data.lead_avatar || data.leadAvatar,
      gitRepoUrl: data.gitRepoUrl || data.git_repo_url,
      git_repo_url: data.git_repo_url || data.gitRepoUrl,
      productionUrl: data.productionUrl || data.production_url,
      production_url: data.production_url || data.productionUrl,
      stagingUrl: data.stagingUrl || data.staging_url,
      staging_url: data.staging_url || data.stagingUrl,
      dueDate: data.dueDate || data.due_date,
      due_date: data.due_date || data.dueDate,
      tasksCount: { total: 0, completed: 0, inProgress: 0 },
      tasks_count: { total: 0, completed: 0, inProgress: 0 },
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    Store.projects.unshift(newProject);

    // Update client projects_count
    if (clientId) {
      const client = Store.clients.find(c => c.id === clientId);
      if (client) {
        client.projects_count = (client.projects_count || 0) + 1;
      }
    }

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Project '${newProject.name}' created successfully`,
      data: newProject,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create project' });
  }
};

export const updateProject = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const index = Store.projects.findIndex(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Project '${id}' not found` });
    }

    Store.projects[index] = {
      ...Store.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return res.json({
      success: true,
      status: 'success',
      message: `Project '${Store.projects[index].name}' updated successfully`,
      data: Store.projects[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update project' });
  }
};

export const deleteProject = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const index = Store.projects.findIndex(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Project '${id}' not found` });
    }

    const [deleted] = Store.projects.splice(index, 1);
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
