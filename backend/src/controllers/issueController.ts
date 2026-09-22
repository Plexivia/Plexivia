import { Request, Response } from 'express';
import { PlexiviaIssueService } from '../services/PlexiviaIssueService.js';
import { PlexiviaIssueFilters } from '../types/index.js';

export const getIssues = (req: Request, res: Response) => {
  try {
    const filters: PlexiviaIssueFilters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      project: req.query.project as string,
      projectId: req.query.projectId as string,
      assignee: req.query.assignee as string,
      assigneeId: req.query.assigneeId as string,
      issueType: req.query.issueType as string,
      search: req.query.search as string
    };

    const issues = PlexiviaIssueService.getAll(filters);
    return res.json({
      status: 'success',
      count: issues.length,
      timestamp: new Date().toISOString(),
      data: issues
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to retrieve issues' });
  }
};

export const getIssueById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const issue = PlexiviaIssueService.getById(id);

    if (!issue) {
      return res.status(404).json({ status: 'error', message: `Plexivia Issue '${id}' not found` });
    }

    return res.json({
      status: 'success',
      data: issue
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to retrieve issue' });
  }
};

export const createIssue = (req: Request, res: Response) => {
  try {
    const issueData = req.body;
    if (!issueData.title) {
      return res.status(400).json({ status: 'error', message: 'Issue title is required' });
    }

    const created = PlexiviaIssueService.create(issueData);
    return res.status(201).json({
      status: 'success',
      message: `Plexivia Issue '${created.issueKey}' created successfully`,
      data: created
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to create issue' });
  }
};

export const updateIssue = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const updated = PlexiviaIssueService.update(id, updates);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: `Plexivia Issue '${id}' not found` });
    }

    return res.json({
      status: 'success',
      message: `Plexivia Issue '${updated.issueKey}' updated successfully`,
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to update issue' });
  }
};

export const deleteIssue = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const success = PlexiviaIssueService.delete(id);

    if (!success) {
      return res.status(404).json({ status: 'error', message: `Plexivia Issue '${id}' not found` });
    }

    return res.json({
      status: 'success',
      message: `Plexivia Issue '${id}' deleted successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to delete issue' });
  }
};

export const handleChecklist = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { text, itemId, completed } = req.body;

    const issue = PlexiviaIssueService.getById(id);
    if (!issue) {
      return res.status(404).json({ status: 'error', message: `Plexivia Issue '${id}' not found` });
    }

    // If itemId is provided, toggle / update checklist item
    if (itemId) {
      const updatedIssue = PlexiviaIssueService.toggleChecklistItem(id, String(itemId), completed);
      if (!updatedIssue) {
        return res.status(404).json({ status: 'error', message: `Checklist item '${itemId}' not found in issue '${id}'` });
      }
      return res.json({
        status: 'success',
        message: 'Checklist item updated',
        data: updatedIssue
      });
    }

    // Otherwise add new checklist item
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Checklist item text is required' });
    }

    const newItem = PlexiviaIssueService.addChecklistItem(id, text.trim());
    return res.status(201).json({
      status: 'success',
      message: 'Checklist item added',
      data: newItem,
      issue: PlexiviaIssueService.getById(id)
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to process checklist operation' });
  }
};
