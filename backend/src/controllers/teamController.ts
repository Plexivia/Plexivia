import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { Team, TeamMember } from '../types/index.js';

export const getTeams = (req: Request, res: Response) => {
  try {
    const { department, status, search } = req.query;
    let teams = [...Store.teams];

    if (department) {
      teams = teams.filter(t => t.department.toLowerCase().includes(String(department).toLowerCase()));
    }
    if (status) {
      teams = teams.filter(t => t.status.toLowerCase() === String(status).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      teams = teams.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.code?.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.lead_name?.toLowerCase().includes(q)
      );
    }

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

export const getTeamById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const team = Store.teams.find(t => t.id === id || t.code?.toLowerCase() === id.toLowerCase());

    if (!team) {
      return res.status(404).json({ success: false, message: `Team '${id}' not found` });
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

export const createTeam = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }

    const leadId = data.leadId || data.lead_id;
    let leadName = data.leadName || data.lead_name;
    let leadAvatar = data.leadAvatar || data.lead_avatar;

    if (leadId && !leadName) {
      const leadUser = Store.users.find(u => u.id === leadId);
      if (leadUser) {
        leadName = leadUser.name;
        leadAvatar = leadUser.avatar;
      }
    }

    const newTeam: Team = {
      id: data.id || `tm-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      code: data.code || data.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 6),
      description: data.description || '',
      department: data.department || 'Engineering',
      leadId,
      lead_id: leadId,
      leadName,
      lead_name: leadName,
      leadAvatar,
      lead_avatar: leadAvatar,
      members: Array.isArray(data.members) ? data.members : [],
      members_count: Array.isArray(data.members) ? data.members.length : 0,
      membersCount: Array.isArray(data.members) ? data.members.length : 0,
      projects_count: 0,
      projectsCount: 0,
      status: data.status || 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    Store.teams.unshift(newTeam);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Team '${newTeam.name}' created successfully`,
      data: newTeam,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create team' });
  }
};

export const updateTeam = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const index = Store.teams.findIndex(t => t.id === id || t.code?.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Team '${id}' not found` });
    }

    Store.teams[index] = {
      ...Store.teams[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (Array.isArray(Store.teams[index].members)) {
      Store.teams[index].members_count = Store.teams[index].members.length;
      Store.teams[index].membersCount = Store.teams[index].members.length;
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Team '${Store.teams[index].name}' updated successfully`,
      data: Store.teams[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update team' });
  }
};

export const deleteTeam = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const index = Store.teams.findIndex(t => t.id === id || t.code?.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Team '${id}' not found` });
    }

    const [deleted] = Store.teams.splice(index, 1);
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

export const addTeamMember = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { userId, user_id, role, designation } = req.body;
    const targetUserId = userId || user_id;

    const team = Store.teams.find(t => t.id === id || t.code?.toLowerCase() === id.toLowerCase());
    if (!team) {
      return res.status(404).json({ success: false, message: `Team '${id}' not found` });
    }

    const user = Store.users.find(u => u.id === targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: `User '${targetUserId}' not found` });
    }

    const alreadyMember = team.members.some(m => m.id === user.id);
    if (alreadyMember) {
      return res.status(409).json({ success: false, message: 'User is already a member of this team' });
    }

    const member: TeamMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role || user.role,
      avatar: user.avatar,
      designation: designation || user.designation,
      department: user.department,
      joined_at: new Date().toISOString(),
    };

    team.members.push(member);
    team.members_count = team.members.length;
    team.membersCount = team.members.length;

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `User '${user.name}' added to team '${team.name}'`,
      data: team,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to add team member' });
  }
};

export const removeTeamMember = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const memberId = req.params.memberId as string;
    const team = Store.teams.find(t => t.id === id || t.code?.toLowerCase() === id.toLowerCase());

    if (!team) {
      return res.status(404).json({ success: false, message: `Team '${id}' not found` });
    }

    const memberIndex = team.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: `Member '${memberId}' not found in team` });
    }

    team.members.splice(memberIndex, 1);
    team.members_count = team.members.length;
    team.membersCount = team.members.length;

    return res.json({
      success: true,
      status: 'success',
      message: `Member removed from team '${team.name}'`,
      data: team,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to remove team member' });
  }
};
