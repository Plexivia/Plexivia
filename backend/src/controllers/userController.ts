import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { User } from '../types/index.js';

export const getUsers = (req: Request, res: Response) => {
  try {
    const { role, department, status, search } = req.query;
    let users = [...Store.users];

    if (role) {
      users = users.filter(u => String(u.role).toLowerCase() === String(role).toLowerCase());
    }
    if (department) {
      users = users.filter(u => u.department?.toLowerCase().includes(String(department).toLowerCase()));
    }
    if (status) {
      users = users.filter(u => String(u.status).toLowerCase() === String(status).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve users' });
  }
};

export const getUserById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = Store.users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve user' });
  }
};

export const createUser = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.email || !data.name) {
      return res.status(400).json({ success: false, message: 'User name and email are required' });
    }

    const emailClean = String(data.email).trim().toLowerCase();
    const existing = Store.users.find(u => u.email.toLowerCase() === emailClean);
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }

    const newUser: User = {
      id: data.id || `usr_${Date.now().toString().slice(-4)}`,
      email: emailClean,
      name: data.name.trim(),
      full_name: data.full_name || data.name.trim(),
      username: data.username || emailClean.split('@')[0],
      role: data.role || 'DEV',
      department: data.department || 'Engineering',
      designation: data.designation || 'Team Member',
      phone: data.phone,
      address: data.address,
      avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0284c7&color=ffffff&bold=true`,
      is_active: data.is_active !== undefined ? data.is_active : true,
      status: data.status || 'ACTIVE',
      hourly_rate: data.hourly_rate || 50,
      active_tasks_count: 0,
      total_logged_hours: 0,
      created_at: new Date().toISOString(),
    };

    Store.users.unshift(newUser);

    return res.status(201).json({
      success: true,
      message: `User '${newUser.name}' created successfully`,
      data: newUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create user' });
  }
};

export const updateUser = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const index = Store.users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }

    Store.users[index] = {
      ...Store.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: `User '${Store.users[index].name}' updated successfully`,
      data: Store.users[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update user' });
  }
};

export const deleteUser = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const index = Store.users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }

    const [deleted] = Store.users.splice(index, 1);
    return res.json({
      success: true,
      message: `User '${deleted.name}' deleted successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete user' });
  }
};
