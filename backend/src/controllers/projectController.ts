import { Request, Response } from 'express';
import { getProjectModel } from '../models/Agency.js';
import { getProjectTypeModel } from '../models/ProjectType.js';
import { getWhiteLabelEcommerceModel } from '../models/WhiteLabelEcommerce.js';
import { getClientModel } from '../models/Client.js';
import { generateDId } from '../utils/dId.js';

// Retrieve all agency projects with status, client, and search filtering
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { status, clientDId, clientId, client_id, search, projectTypeDId } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = new RegExp(`^${status}$`, 'i');
    }
    const targetClient = clientDId || clientId || client_id;
    if (targetClient) {
      filter.$or = [{ client_dId: targetClient }, { client_id: targetClient }];
    }
    if (projectTypeDId) {
      filter.project_type_dId = String(projectTypeDId);
    }
    if (search) {
      const q = String(search);
      filter.$or = [{ name: new RegExp(q, 'i') }, { dId: new RegExp(q, 'i') }];
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

// Retrieve a single agency project by 16-digit dId or legacy id
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const ProjectModel = getProjectModel();
    const project = await ProjectModel.findOne({
      $or: [{ dId: identifier }, { id: identifier }],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: `Project '${identifier}' not found` });
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

// Create a new agency project record with 16-digit dId
export const createProject = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const projectName = data.name || data.project_name;
    if (!projectName) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const clientDId = data.clientDId || data.client_dId || data.clientId || data.client_id;
    const projectTypeDId = data.projectTypeDId || data.project_type_dId;
    const ProjectModel = getProjectModel();
    const dId = generateDId();

    const created = await ProjectModel.create({
      dId,
      client_dId: clientDId,
      project_type_dId: projectTypeDId,
      name: projectName.trim(),
      description: data.description || '',
      status: data.status || 'Planning',
      progress: Number(data.progress || data.progressPercent || 0),
      priority: data.priority || 'Medium',
      due_date: data.due_date || data.dueDate || new Date().toISOString(),
      tasks_count: 0,
      created_at: new Date().toISOString(),
    });

    // Also link project to client record if client exists
    if (clientDId) {
      const ClientModel = getClientModel();
      await ClientModel.findOneAndUpdate(
        { $or: [{ dId: clientDId }, { id: clientDId }] },
        { $addToSet: { projects: { dId: created.dId, name: created.name } } }
      );
    }

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

// Update an existing agency project by 16-digit dId or legacy id
export const updateProject = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const updates = req.body;
    const ProjectModel = getProjectModel();

    const project = await ProjectModel.findOneAndUpdate(
      { $or: [{ dId: identifier }, { id: identifier }] },
      { $set: updates },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: `Project '${identifier}' not found` });
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

// Delete an agency project record by 16-digit dId or legacy id
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const ProjectModel = getProjectModel();
    const deleted = await ProjectModel.findOneAndDelete({
      $or: [{ dId: identifier }, { id: identifier }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: `Project '${identifier}' not found` });
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

// Retrieve all available project types (WhiteLabel Ecommerce, Custom, ERP)
export const getProjectTypes = async (_req: Request, res: Response) => {
  try {
    const ProjectTypeModel = getProjectTypeModel();
    const types = await ProjectTypeModel.find({ status: 'ACTIVE' }).sort({ created_at: 1 });

    return res.json({
      success: true,
      status: 'success',
      count: types.length,
      data: types,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve project types' });
  }
};

// Create a new project type
export const createProjectType = async (req: Request, res: Response) => {
  try {
    const { name, key, description } = req.body;
    if (!name || !key) {
      return res.status(400).json({ success: false, message: 'Project type name and key are required.' });
    }

    const ProjectTypeModel = getProjectTypeModel();
    const dId = generateDId();

    const created = await ProjectTypeModel.create({
      dId,
      name: name.trim(),
      key: key.trim().toLowerCase(),
      description: description ? String(description).trim() : '',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Project type '${created.name}' created successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create project type' });
  }
};

// Retrieve all WhiteLabel Ecommerce projects
export const getWhiteLabelEcommerceProjects = async (req: Request, res: Response) => {
  try {
    const { clientDId, status } = req.query;
    const filter: any = {};

    if (clientDId) {
      filter.clientDId = String(clientDId);
    }
    if (status) {
      filter.status = new RegExp(`^${status}$`, 'i');
    }

    const Model = getWhiteLabelEcommerceModel();
    const stores = await Model.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: stores.length,
      data: stores,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve ecommerce projects' });
  }
};

// Retrieve a single WhiteLabel Ecommerce project by 16-digit dId or clientKey
export const getWhiteLabelEcommerceProjectById = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const Model = getWhiteLabelEcommerceModel();
    const store = await Model.findOne({
      $or: [{ dId: identifier }, { clientKey: identifier }, { name: identifier }],
    });

    if (!store) {
      return res.status(404).json({ success: false, message: `WhiteLabel Ecommerce project '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: store,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve ecommerce project' });
  }
};

// Create a new WhiteLabel Ecommerce project linked to client dId and projectType dId
export const createWhiteLabelEcommerceProject = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.clientDId || !data.domainInfo) {
      return res.status(400).json({
        success: false,
        message: 'Name, clientDId, and domainInfo (storeURL, adminURL, backendURL, databaseURL) are required.',
      });
    }

    const Model = getWhiteLabelEcommerceModel();
    const ProjectTypeModel = getProjectTypeModel();
    const dId = generateDId();

    // Resolve project type DID
    let projectTypeDId = data.projectTypeDId;
    if (!projectTypeDId) {
      const typeDoc = await ProjectTypeModel.findOne({ key: 'whitelabel_ecommerce' });
      projectTypeDId = typeDoc?.dId || generateDId();
    }

    const created = await Model.create({
      dId,
      clientDId: String(data.clientDId).trim(),
      projectTypeDId,
      name: String(data.name).trim(),
      clientKey: (data.clientKey || data.name).toLowerCase().replace(/[^a-z0-9]/g, ''),
      domainInfo: data.domainInfo,
      owners: Array.isArray(data.owners) ? data.owners : [],
      policies: data.policies || {},
      features: data.features || {},
      stockManagement: data.stockManagement || {},
      reports: data.reports || {},
      cloudFlareAnalytics: data.cloudFlareAnalytics || {},
      googleAnalytics: data.googleAnalytics || {},
      assetsConfig: data.assetsConfig || { sections: [] },
      allowedMenus: Array.isArray(data.allowedMenus) ? data.allowedMenus : ['overview', 'orders', 'products', 'settings'],
      theme: data.theme || { light: {}, dark: {} },
      status: data.status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Also register in main Client projects array
    const ClientModel = getClientModel();
    await ClientModel.findOneAndUpdate(
      { dId: created.clientDId },
      { $addToSet: { projects: { dId: created.dId, name: created.name } } }
    );

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `WhiteLabel Ecommerce project '${created.name}' initialized successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create ecommerce project' });
  }
};

