import { Request, Response } from 'express';
import { Store } from '../data/mockStore.js';
import { Task, TaskStatus } from '../types/index.js';

export const getTasks = (req: Request, res: Response) => {
  try {
    const { status, priority, projectId, project_id, assigneeId, assignee_id, search } = req.query;
    let tasks = [...Store.tasks];

    if (status) {
      tasks = tasks.filter(t => String(t.status).toLowerCase() === String(status).toLowerCase());
    }
    if (priority) {
      tasks = tasks.filter(t => String(t.priority).toLowerCase() === String(priority).toLowerCase());
    }
    const targetProjectId = projectId || project_id;
    if (targetProjectId) {
      tasks = tasks.filter(t => t.projectId === targetProjectId || t.project_id === targetProjectId);
    }
    const targetAssigneeId = assigneeId || assignee_id;
    if (targetAssigneeId) {
      tasks = tasks.filter(t => t.assigneeId === targetAssigneeId || t.assignee_id === targetAssigneeId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.projectName?.toLowerCase().includes(q) ||
        t.project_name?.toLowerCase().includes(q) ||
        t.issueKey?.toLowerCase().includes(q)
      );
    }

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

export const getTaskById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const task = Store.tasks.find(t => t.id === id || t.issueKey?.toLowerCase() === id.toLowerCase());

    if (!task) {
      return res.status(404).json({ success: false, message: `Task '${id}' not found` });
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

export const createTask = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const projectId = data.projectId || data.project_id;
    let projectName = data.projectName || data.project_name;
    let projectCode = data.projectCode || data.project_code;

    if (projectId && (!projectName || !projectCode)) {
      const project = Store.projects.find(p => p.id === projectId);
      if (project) {
        projectName = project.name;
        projectCode = project.code;
      }
    }

    const nextNumber = Store.tasks.length + 101;
    const issueKey = data.issueKey || (projectCode ? `${projectCode}-${nextNumber}` : `TSK-${nextNumber}`);

    const newTask: Task = {
      id: data.id || `t-${Date.now().toString().slice(-4)}`,
      issueKey,
      projectId,
      project_id: projectId,
      projectName,
      project_name: projectName,
      projectCode,
      project_code: projectCode,
      assigneeId: data.assigneeId || data.assignee_id,
      assignee_id: data.assignee_id || data.assigneeId,
      assigneeName: data.assigneeName || data.assignee_name,
      assignee_name: data.assignee_name || data.assigneeName,
      assigneeAvatar: data.assigneeAvatar || data.assignee_avatar,
      assignee_avatar: data.assignee_avatar || data.assigneeAvatar,
      reporterId: data.reporterId || data.reporter_id,
      reporter_id: data.reporter_id || data.reporterId,
      reporterName: data.reporterName || data.reporter_name,
      reporter_name: data.reporter_name || data.reporterName,
      title: data.title.trim(),
      description: data.description || '',
      status: (data.status as TaskStatus) || 'TODO',
      priority: data.priority || 'MEDIUM',
      estimatedHours: Number(data.estimatedHours || data.estimated_hours || 0),
      estimated_hours: Number(data.estimated_hours || data.estimatedHours || 0),
      spentHours: Number(data.spentHours || data.spent_hours || 0),
      spent_hours: Number(data.spent_hours || data.spentHours || 0),
      loggedHours: Number(data.loggedHours || data.logged_hours || 0),
      logged_hours: Number(data.logged_hours || data.loggedHours || 0),
      dueDate: data.dueDate || data.due_date,
      due_date: data.due_date || data.dueDate,
      tags: Array.isArray(data.tags) ? data.tags : [],
      checklist: Array.isArray(data.checklist) ? data.checklist : [],
      comments: Array.isArray(data.comments) ? data.comments : [],
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    Store.tasks.unshift(newTask);

    // Update project tasks count
    if (projectId) {
      const project = Store.projects.find(p => p.id === projectId);
      if (project) {
        const count = project.tasksCount || { total: 0, completed: 0, inProgress: 0 };
        count.total += 1;
        if (newTask.status === 'DONE') count.completed += 1;
        if (newTask.status === 'IN_PROGRESS') count.inProgress = (count.inProgress || 0) + 1;
        project.tasksCount = count;
        project.tasks_count = count;
      }
    }

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Task '${newTask.title}' created successfully`,
      data: newTask,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create task' });
  }
};

export const updateTask = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const index = Store.tasks.findIndex(t => t.id === id || t.issueKey?.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Task '${id}' not found` });
    }

    Store.tasks[index] = {
      ...Store.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return res.json({
      success: true,
      status: 'success',
      message: `Task '${Store.tasks[index].title}' updated successfully`,
      data: Store.tasks[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update task' });
  }
};

export const updateTaskStatus = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const index = Store.tasks.findIndex(t => t.id === id || t.issueKey?.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ success: false, message: `Task '${id}' not found` });
    }

    Store.tasks[index].status = status as TaskStatus;
    Store.tasks[index].updatedAt = new Date().toISOString();
    Store.tasks[index].updated_at = new Date().toISOString();

    return res.json({
      success: true,
      status: 'success',
      message: `Task status updated to '${status}'`,
      data: Store.tasks[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update task status' });
  }
};

export const deleteTask = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const index = Store.tasks.findIndex(t => t.id === id || t.issueKey?.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Task '${id}' not found` });
    }

    const [deleted] = Store.tasks.splice(index, 1);
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

export const handleChecklist = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { text, itemId, completed } = req.body;

    const task = Store.tasks.find(t => t.id === id || t.issueKey?.toLowerCase() === id.toLowerCase());
    if (!task) {
      return res.status(404).json({ success: false, message: `Task '${id}' not found` });
    }

    if (!task.checklist) {
      task.checklist = [];
    }

    if (itemId) {
      const item = task.checklist.find(c => c.id === String(itemId));
      if (!item) {
        return res.status(404).json({ success: false, message: `Checklist item '${itemId}' not found` });
      }
      if (completed !== undefined) item.completed = Boolean(completed);
      if (text) item.text = String(text);
      return res.json({ success: true, status: 'success', data: task });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Checklist item text is required' });
    }

    const newItem = {
      id: `chk_${Date.now().toString().slice(-4)}`,
      text: text.trim(),
      completed: false,
    };
    task.checklist.push(newItem);

    return res.status(201).json({
      success: true,
      status: 'success',
      data: newItem,
      task,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update checklist' });
  }
};
