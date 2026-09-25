import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { Task, TaskStatus } from '../types/index.js';

// Retrieve all tasks with status, priority, project, and assignee filtering
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

// Retrieve a single task by identifier or issue key
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

// Create a new task and update parent project task statistics
export const createTask = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const projectId = data.projectId || data.project_id;
    let projectName = data.projectName || data.project_name;
    let projectCode = data.projectCode || data.project_code || 'TSK';

    if (projectId) {
      const project = Store.projects.find(p => p.id === projectId);
      if (project) {
        projectName = project.name;
        projectCode = project.code;
      }
    }

    const issueKey = `${projectCode}-${Math.floor(100 + Math.random() * 900)}`;

    const newTask: Task = {
      id: data.id || `t-${Date.now().toString().slice(-4)}`,
      issueKey,
      title: data.title.trim(),
      description: data.description || '',
      status: (data.status as TaskStatus) || 'TODO',
      priority: data.priority || 'MEDIUM',
      projectId,
      project_id: projectId,
      projectName,
      project_name: projectName,
      projectCode,
      project_code: projectCode,
      assigneeId: data.assigneeId || data.assignee_id,
      assignee_id: data.assigneeId || data.assignee_id,
      assigneeName: data.assigneeName || data.assignee_name,
      assignee_name: data.assigneeName || data.assignee_name,
      assigneeAvatar: data.assigneeAvatar || data.assignee_avatar,
      assignee_avatar: data.assigneeAvatar || data.assignee_avatar,
      reporterId: data.reporterId || data.reporter_id,
      reporter_id: data.reporterId || data.reporter_id,
      reporterName: data.reporterName || data.reporter_name,
      reporter_name: data.reporterName || data.reporter_name,
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
      comments: [],
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    Store.tasks.unshift(newTask);

    if (projectId) {
      const project = Store.projects.find(p => p.id === projectId);
      if (project) {
        const pTasks = Store.tasks.filter(t => t.projectId === projectId || t.project_id === projectId);
        const completed = pTasks.filter(t => t.status === 'DONE').length;
        const inProgress = pTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length;
        project.tasksCount = { total: pTasks.length, completed, inProgress };
        project.tasks_count = { total: pTasks.length, completed, inProgress };
        if (pTasks.length > 0) {
          project.progressPercent = Math.round((completed / pTasks.length) * 100);
          project.progress_percent = project.progressPercent;
        }
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

// Update an existing task by identifier or issue key
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

// Update task Kanban column status and recalculate progress
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

// Delete a task record by identifier or issue key
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

// Handle task checklist items creation and toggle completion
export const handleChecklist = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { action, text, itemId } = req.body;
    const task = Store.tasks.find(t => t.id === id || t.issueKey?.toLowerCase() === id.toLowerCase());

    if (!task) {
      return res.status(404).json({ success: false, message: `Task '${id}' not found` });
    }

    if (!task.checklist) {
      task.checklist = [];
    }

    if (action === 'ADD') {
      if (!text) {
        return res.status(400).json({ success: false, message: 'Checklist item text is required' });
      }
      const newItem = {
        id: `chk-${Date.now().toString().slice(-4)}`,
        text: text.trim(),
        completed: false,
      };
      task.checklist.push(newItem);
      return res.status(201).json({ success: true, status: 'success', data: task.checklist });
    }

    if (action === 'TOGGLE') {
      if (!itemId) {
        return res.status(400).json({ success: false, message: 'Item ID is required' });
      }
      const item = task.checklist.find(c => c.id === itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: `Checklist item '${itemId}' not found` });
      }
      item.completed = !item.completed;
      if (item.completed) {
        item.completedAt = new Date().toISOString();
      }
      return res.json({ success: true, status: 'success', data: task.checklist });
    }

    return res.status(400).json({ success: false, message: `Unknown checklist action '${action}'` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to handle checklist' });
  }
};
