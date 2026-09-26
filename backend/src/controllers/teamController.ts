import { Request, Response } from 'express';
import { getTeamModel } from '../models/Agency.js';
import { generateDId } from '../utils/dId.js';

// Retrieve all agency teams with department and status filtering
export const getTeams = async (req: Request, res: Response) => {
  try {
    const { department, status, search } = req.query;
    const filter: any = {};

    if (department) {
      filter.department = new RegExp(String(department), 'i');
    }
    if (status) {
      filter.status = new RegExp(String(status), 'i');
    }
    if (search) {
      const q = String(search);
      filter.$or = [{ name: new RegExp(q, 'i') }, { dId: new RegExp(q, 'i') }];
    }

    const TeamModel = getTeamModel();
    const teams = await TeamModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: teams.length,
      data: teams,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve teams' });
  }
};

// Retrieve a single team record by 16-digit dId or legacy id
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const TeamModel = getTeamModel();
    const team = await TeamModel.findOne({
      $or: [{ dId: identifier }, { id: identifier }],
    });

    if (!team) {
      return res.status(404).json({ success: false, message: `Team '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: team,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve team' });
  }
};

// Create a new agency team with 16-digit dId in database
export const createTeam = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }

    const TeamModel = getTeamModel();
    const dId = generateDId();

    const created = await TeamModel.create({
      dId,
      name: data.name.trim(),
      department: data.department || 'Engineering',
      lead_name: data.lead_name || data.leadName || 'Team Lead',
      members_count: Number(data.members_count || 1),
      status: data.status || 'Active',
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Team '${created.name}' created successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create team' });
  }
};

// Update an existing agency team by 16-digit dId or legacy id
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const updates = req.body;
    const TeamModel = getTeamModel();

    const team = await TeamModel.findOneAndUpdate(
      { $or: [{ dId: identifier }, { id: identifier }] },
      { $set: updates },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ success: false, message: `Team '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Team '${team.name}' updated successfully`,
      data: team,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update team' });
  }
};

// Delete an agency team by 16-digit dId or legacy id
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const TeamModel = getTeamModel();
    const deleted = await TeamModel.findOneAndDelete({
      $or: [{ dId: identifier }, { id: identifier }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: `Team '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Team '${deleted.name}' deleted successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete team' });
  }
};

// Add member to team roster by 16-digit dId
export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const teamId = (req.params.dId || req.params.id) as string;
    const TeamModel = getTeamModel();
    const team = await TeamModel.findOne({ $or: [{ dId: teamId }, { id: teamId }] });

    if (!team) {
      return res.status(404).json({ success: false, message: `Team '${teamId}' not found` });
    }

    await TeamModel.updateOne({ $or: [{ dId: teamId }, { id: teamId }] }, { $inc: { members_count: 1 } });
    return res.status(201).json({ success: true, status: 'success', message: 'Team member added' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to add team member' });
  }
};

// Remove member from team roster by 16-digit dId
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const teamId = (req.params.dId || req.params.id) as string;
    const TeamModel = getTeamModel();
    const team = await TeamModel.findOne({ $or: [{ dId: teamId }, { id: teamId }] });

    if (!team) {
      return res.status(404).json({ success: false, message: `Team '${teamId}' not found` });
    }

    await TeamModel.updateOne({ $or: [{ dId: teamId }, { id: teamId }] }, { $inc: { members_count: -1 } });
    return res.json({ success: true, status: 'success', message: 'Team member removed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to remove team member' });
  }
};

