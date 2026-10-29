import crypto from 'crypto';
import { Request, Response } from 'express';
import { getAdminModel } from '../models/Admin.js';
import { hashPassword } from '../utils/security.js';
import { sendMail, renderTeamInviteEmailHtml } from '../utils/mailer.js';

// Generate a random temporary password for newly invited team members
const generateTempPassword = (): string => `Plexi@${crypto.randomInt(100000, 999999)}`;

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
    const user = await AdminModel.findOne({ $or: [{ email: id.toLowerCase() }, { dId: id }] });

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

// Create a new administrative user record and dispatch team invitation email
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

    const tempPassword = String(data.password || '').trim() || generateTempPassword();
    const role = data.role || 'DEV';
    const department = data.department || 'Engineering';

    const created = await AdminModel.create({
      email,
      password_hash: hashPassword(tempPassword),
      full_name: userName.trim(),
      role,
      department,
      designation: data.designation || 'Software Engineer',
      hourly_rate: Number(data.hourly_rate || 0),
      phone: data.phone || '',
      avatar: data.avatar || '',
      is_active: data.is_active !== undefined ? data.is_active : true,
      two_factor_enabled: data.two_factor_enabled !== undefined ? data.two_factor_enabled : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const mail = await sendMail({
      to: email,
      subject: 'You Have Been Invited to Plexivia Dashboard',
      html: renderTeamInviteEmailHtml({
        fullName: created.full_name,
        email: created.email,
        role: created.role,
        department: created.department || 'Engineering',
        tempPassword,
      }),
      text: `Welcome to Plexivia, ${created.full_name}! Sign in at https://admin.plexivia.com with email ${created.email} and temporary password: ${tempPassword}`,
    });

    return res.status(201).json({
      success: true,
      emailSent: mail.success,
      message: mail.success
        ? `User '${created.full_name}' created and invitation email sent to ${created.email}`
        : `User '${created.full_name}' created, but invitation email failed: ${mail.error || 'SMTP error'}`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create user' });
  }
};

// Provision a fresh temporary password and dispatch invitation email to an existing user
export const sendUserInvite = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    const AdminModel = getAdminModel();
    const user = await AdminModel.findOne({
      $or: [{ email: id.toLowerCase() }, { dId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }

    const tempPassword = generateTempPassword();
    user.password_hash = hashPassword(tempPassword);
    user.updated_at = new Date().toISOString();
    await user.save();

    const mail = await sendMail({
      to: user.email,
      subject: 'You Have Been Invited to Plexivia Dashboard',
      html: renderTeamInviteEmailHtml({
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department || 'Engineering',
        tempPassword,
      }),
      text: `Welcome to Plexivia, ${user.full_name}! Sign in at https://admin.plexivia.com with email ${user.email} and temporary password: ${tempPassword}`,
    });

    if (!mail.success) {
      return res.status(502).json({
        success: false,
        message: `Failed to send invitation email: ${mail.error || 'SMTP error'}`,
      });
    }

    return res.json({
      success: true,
      message: `Invitation email sent to ${user.email}`,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to send invitation email' });
  }
};

// Update an existing administrative user by identifier
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const AdminModel = getAdminModel();

    const user = await AdminModel.findOneAndUpdate(
      { $or: [{ email: id.toLowerCase() }, { dId: id }] },
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
    const deleted = await AdminModel.findOneAndDelete({ $or: [{ email: id.toLowerCase() }, { dId: id }] });

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
