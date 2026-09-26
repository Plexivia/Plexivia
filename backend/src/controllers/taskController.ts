import { Request, Response } from 'express';
import { getTaskModel } from '../models/Agency.js';
import { generateDId } from '../utils/dId.js';

// Retrieve all tasks with status, priority, and project filtering
export const getTasks = async (req: Request, res: Response) => {
  try {
    const { status, priority, projectDId, projectId, project_id, search } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = new RegExp(`^${status}$`, 'i');
    }
    if (priority) {
      filter.priority = new RegExp(`^${priority}$`, 'i');
    }
    const targetProject = projectDId || projectId || project_id;
    if (targetProject) {
      filter.$or = [{ project_dId: targetProject }, { project_id: targetProject }];
    }
    if (search) {
      const q = String(search);
      filter.$or = [{ title: new RegExp(q, 'i') }, { dId: new RegExp(q, 'i') }];
    }

    const TaskModel = getTaskModel();
    const tasks = await TaskModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: tasks.length,
      data: tasks,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve tasks' });
  }
};

// Retrieve a single task by 16-digit dId or legacy id
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const TaskModel = getTaskModel();
    const task = await TaskModel.findOne({
      $or: [{ dId: identifier }, { id: identifier }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: `Task '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: task,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve task' });
  }
};

// Create a new task with 16-digit dId in database
export const createTask = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const projectDId = data.projectDId || data.project_dId || data.projectId || data.project_id || 'p-001';
    const TaskModel = getTaskModel();
    const dId = generateDId();

    const created = await TaskModel.create({
      dId,
      project_dId: projectDId,
      title: data.title.trim(),
      description: data.description || '',
      status: data.status || 'Todo',
      priority: data.priority || 'Medium',
      assignee: data.assignee || data.assignee_name || '',
      due_date: data.due_date || data.dueDate,
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Task '${created.title}' created successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create task' });
  }
};

// Update an existing task by 16-digit dId or legacy id
export const updateTask = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const updates = req.body;
    const TaskModel = getTaskModel();

    const task = await TaskModel.findOneAndUpdate(
      { $or: [{ dId: identifier }, { id: identifier }] },
      { $set: updates },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: `Task '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Task '${task.title}' updated successfully`,
      data: task,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update task' });
  }
};

// Update task Kanban column status by 16-digit dId
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const TaskModel = getTaskModel();
    const task = await TaskModel.findOneAndUpdate(
      { $or: [{ dId: identifier }, { id: identifier }] },
      { $set: { status } },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: `Task '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Task status updated to '${status}'`,
      data: task,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update task status' });
  }
};

// Delete a task record by 16-digit dId or legacy id
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const TaskModel = getTaskModel();
    const deleted = await TaskModel.findOneAndDelete({
      $or: [{ dId: identifier }, { id: identifier }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: `Task '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Task '${deleted.title}' deleted successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete task' });
  }
};

// Handle task checklist actions
export const handleChecklist = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const { action, text, itemId } = req.body;
    const TaskModel = getTaskModel();
    const task = await TaskModel.findOne({
      $or: [{ dId: identifier }, { id: identifier }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: `Task '${identifier}' not found` });
    }

    return res.json({ success: true, status: 'success', data: [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to handle checklist' });
  }
};

