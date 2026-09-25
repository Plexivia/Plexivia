import { Request, Response } from 'express';
import { getAdminModel } from '../models/Admin.js';

// Retrieve all administrative users with role, department, and search filtering
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, department, search } = req.query;
    const filter: any = {};

    if (role) {
      filter.role = new RegExp(`^${role}$`, 'i');
    }
    if (department) {
      filter.department = new RegExp(String(department), 'i');
    }
    if (search) {
      const q = String(search);
      filter.full_name = new RegExp(q, 'i');
    }

    const AdminModel = getAdminModel();
    const users = await AdminModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve users' });
  }
};

// Retrieve a single administrative user by identifier
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const AdminModel = getAdminModel();
    const user = await AdminModel.findOne({ $or: [{ email: id.toLowerCase() }] });

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

// Create a new administrative user record
export const createUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const userName = data.full_name || data.name;
    if (!data.email || !userName) {
      return res.status(400).json({ success: false, message: 'User name and email are required' });
    }

    const email = String(data.email).trim().toLowerCase();
    const AdminModel = getAdminModel();
    const existing = await AdminModel.findOne({ email });

    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const created = await AdminModel.create({
      email,
      full_name: userName.trim(),
      role: data.role || 'DEV',
      department: data.department || 'Engineering',
      designation: data.designation || 'Software Engineer',
      phone: data.phone || '',
      avatar: data.avatar || '',
      is_active: data.is_active !== undefined ? data.is_active : true,
      two_factor_enabled: data.two_factor_enabled !== undefined ? data.two_factor_enabled : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: `User '${created.full_name}' created successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create user' });
  }
};

// Update an existing administrative user by identifier
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const AdminModel = getAdminModel();

    const user = await AdminModel.findOneAndUpdate(
      { $or: [{ email: id.toLowerCase() }] },
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }

    return res.json({
      success: true,
      message: `User '${user.full_name}' updated successfully`,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update user' });
  }
};

// Delete an administrative user by identifier
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const AdminModel = getAdminModel();
    const deleted = await AdminModel.findOneAndDelete({ $or: [{ email: id.toLowerCase() }] });

    if (!deleted) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }

    return res.json({
      success: true,
      message: `User '${deleted.full_name}' deleted successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete user' });
  }
};
