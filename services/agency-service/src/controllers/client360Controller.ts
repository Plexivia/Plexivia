import { Request, Response } from 'express';
import { getClientModel, getProjectModel, getTaskModel } from '../models/Agency.js';

// Aggregate 360-degree client intelligence across projects, tasks, and telemetry
export const getClient360 = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const Client = getClientModel();
  const Project = getProjectModel();
  const Task = getTaskModel();

  try {
    const client = await Client.findOne({ $or: [{ id }, { client_key: id }] });
    if (!client) {
      res.status(404).json({ success: false, message: `Client '${id}' not found` });
      return;
    }

    const projects = await Project.find({ client_id: client.id });
    const tasks = await Task.find({ project_id: { $in: projects.map((p) => p.id) } });

    const client360 = {
      client,
      projects,
      tasks,
    };

    res.status(200).json({ success: true, data: client360 });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
