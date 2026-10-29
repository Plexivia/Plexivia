import crypto from 'crypto';
import { Request, Response } from 'express';
import { getAdminModel } from '../models/Admin.js';
import { hashPassword } from '../utils/security.js';
import { sendMail, renderTeamInviteEmailHtml, renderPasswordResetByAdminEmailHtml } from '../utils/mailer.js';
import { AuthedRequest } from '../middleware/auth.js';

const PRIVILEGED_ROLES = ['OWNER', 'SUPER_ADMIN'];
const UPDATABLE_FIELDS = [
  'full_name',
  'email',
  'phone',
  'role',
  'department',
  'designation',
  'hourly_rate',
  'avatar',
  'is_active',
  'receive_email_notifications',
  'two_factor_enabled',
];

// Generate a random temporary password for newly invited team members
const generateTempPassword = (): string => `Plexi@${crypto.randomInt(100000, 999999)}`;

// Escape user input before it is used inside a regular expression
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build a lookup that matches a user by email, dId or Mongo _id
const userLookup = (rawId: string) => {
  const id = String(rawId || '').trim();
  return {
    $or: [{ email: id.toLowerCase() }, { dId: id }, ...(/^[0-9a-fA-F]{24}$/.test(id) ? [{ _id: id }] : [])],
  };
};

// Check whether the requester may manage the target role (only Owner / Super Admin may touch privileged accounts)
const canManageRole = (requesterRole: string | undefined, targetRole: string | undefined): boolean => {
  if (!targetRole || !PRIVILEGED_ROLES.includes(targetRole)) return true;
  if (targetRole === 'OWNER') return requesterRole === 'OWNER';
  return PRIVILEGED_ROLES.includes(requesterRole || '');
};

// Check whether the request targets the signed-in admin's own account
const isSelf = (req: AuthedRequest, user: { _id: unknown; email: string }): boolean =>
  String(user._id) === req.auth?.sub || user.email === req.auth?.email;

// Retrieve all administrative users with role, department, status, and search filtering
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, department, search, q, status } = req.query;
    const filter: any = {};

    if (role) {
      filter.role = new RegExp(`^${escapeRegex(String(role))}$`, 'i');
    }
    if (department) {
      filter.department = new RegExp(escapeRegex(String(department)), 'i');
    }
    if (status === 'active') filter.is_active = true;
    if (status === 'inactive') filter.is_active = false;

    const term = String(search || q || '').trim();
    if (term) {
      const rx = new RegExp(escapeRegex(term), 'i');
      filter.$or = [{ full_name: rx }, { email: rx }, { department: rx }, { phone: rx }];
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
    const user = await AdminModel.findOne(userLookup(id));

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
export const createUser = async (req: AuthedRequest, res: Response) => {
  try {
    const data = req.body;
    const userName = data.full_name || data.name;
    if (!data.email || !userName) {
      return res.status(400).json({ success: false, message: 'User name and email are required' });
    }

    const role = data.role || 'DEV';
    if (!canManageRole(req.auth?.role, role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions to create this role' });
    }

    const email = String(data.email).trim().toLowerCase();
    const AdminModel = getAdminModel();
    const existing = await AdminModel.findOne({ email });

    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const customPassword = String(data.password || '').trim();
    if (customPassword && customPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    const tempPassword = customPassword || generateTempPassword();
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
      receive_email_notifications: data.receive_email_notifications === true,
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
export const sendUserInvite = async (req: AuthedRequest, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    const AdminModel = getAdminModel();
    const user = await AdminModel.findOne(userLookup(id));

    if (!user) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }
    if (!canManageRole(req.auth?.role, user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions to invite this user' });
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

// Update an existing administrative user with whitelisted fields and role guards
export const updateUser = async (req: AuthedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body || {};
    const AdminModel = getAdminModel();
    const user = await AdminModel.findOne(userLookup(id));

    if (!user) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }
    if (!canManageRole(req.auth?.role, user.role) || (body.role && !canManageRole(req.auth?.role, body.role))) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions to modify this user' });
    }
    if (isSelf(req, user) && (body.is_active === false || (body.role && body.role !== user.role))) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate or change the role of your own account' });
    }

    const updates: Record<string, any> = {};
    for (const key of UPDATABLE_FIELDS) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (body.name !== undefined && updates.full_name === undefined) updates.full_name = body.name;
    if (typeof updates.full_name === 'string') updates.full_name = updates.full_name.trim();
    if (updates.is_active !== undefined) updates.is_active = Boolean(updates.is_active);
    if (updates.receive_email_notifications !== undefined) {
      updates.receive_email_notifications = Boolean(updates.receive_email_notifications);
    }

    if (typeof updates.email === 'string') {
      updates.email = updates.email.trim().toLowerCase();
      if (updates.email !== user.email && (await AdminModel.exists({ email: updates.email }))) {
        return res.status(409).json({ success: false, message: 'A user with this email already exists' });
      }
    }
    updates.updated_at = new Date().toISOString();

    const updated = await AdminModel.findByIdAndUpdate(user._id, { $set: updates }, { new: true, runValidators: true });

    return res.json({
      success: true,
      message: `User '${updated?.full_name || user.full_name}' updated successfully`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update user' });
  }
};

// Set a new password for a team member and notify them by email
export const resetUserPassword = async (req: AuthedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const password = String(req.body?.password || '').trim();
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const AdminModel = getAdminModel();
    const user = await AdminModel.findOne(userLookup(id));
    if (!user) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }
    if (!canManageRole(req.auth?.role, user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions to reset this user's password" });
    }

    user.password_hash = hashPassword(password);
    user.is_active = true;
    user.updated_at = new Date().toISOString();
    await user.save();

    const mail = await sendMail({
      to: user.email,
      subject: 'Your Plexivia Dashboard Password Was Reset',
      html: renderPasswordResetByAdminEmailHtml({ fullName: user.full_name, email: user.email }),
      text: `Hi ${user.full_name}, an administrator reset the password for your Plexivia account (${user.email}). Contact your administrator for the new password.`,
    });

    return res.json({
      success: true,
      emailSent: mail.success,
      message: `Password for ${user.full_name} has been reset successfully`,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};

// Delete an administrative user by identifier, blocking self-deletion and privileged targets
export const deleteUser = async (req: AuthedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const AdminModel = getAdminModel();
    const user = await AdminModel.findOne(userLookup(id));

    if (!user) {
      return res.status(404).json({ success: false, message: `User '${id}' not found` });
    }
    if (isSelf(req, user)) {
      return res.status(400).json({ success: false, message: 'You cannot revoke access to your own account' });
    }
    if (!canManageRole(req.auth?.role, user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions to delete this user' });
    }

    await AdminModel.deleteOne({ _id: user._id });

    return res.json({
      success: true,
      message: `User '${user.full_name}' deleted successfully`,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete user' });
  }
};

// Delete several users at once, skipping the requester and accounts they may not manage
export const bulkDeleteUsers = async (req: AuthedRequest, res: Response) => {
  try {
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids.map(String).filter(Boolean) : [];
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No users selected' });
    }

    const AdminModel = getAdminModel();
    const users = await AdminModel.find({ $or: ids.flatMap((id) => userLookup(id).$or) });
    const deletable = users.filter((u) => !isSelf(req, u) && canManageRole(req.auth?.role, u.role));
    const skipped = users.length - deletable.length;

    if (deletable.length > 0) {
      await AdminModel.deleteMany({ _id: { $in: deletable.map((u) => u._id) } });
    }

    return res.json({
      success: true,
      deleted: deletable.length,
      skipped,
      message: skipped
        ? `${deletable.length} user(s) deleted, ${skipped} skipped (own or protected accounts)`
        : `${deletable.length} user(s) deleted successfully`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete users' });
  }
};
