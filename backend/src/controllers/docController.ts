import { Request, Response } from 'express';
import { PlexiviaDocService } from '../services/PlexiviaDocService.js';
import { PlexiviaDocFilters } from '../types/index.js';

export const getDocs = (req: Request, res: Response) => {
  try {
    const filters: PlexiviaDocFilters = {
      category: req.query.category as string,
      status: req.query.status as string,
      projectId: req.query.projectId as string,
      search: req.query.search as string
    };

    const docs = PlexiviaDocService.getAll(filters);
    return res.json({
      status: 'success',
      count: docs.length,
      timestamp: new Date().toISOString(),
      data: docs
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to retrieve documents' });
  }
};

export const getDocById = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const doc = PlexiviaDocService.getById(id);

    if (!doc) {
      return res.status(404).json({ status: 'error', message: `Plexivia Document '${id}' not found` });
    }

    return res.json({
      status: 'success',
      data: doc
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to retrieve document' });
  }
};

export const createDoc = (req: Request, res: Response) => {
  try {
    const docData = req.body;
    if (!docData.title) {
      return res.status(400).json({ status: 'error', message: 'Document title is required' });
    }

    const created = PlexiviaDocService.create(docData);
    return res.status(201).json({
      status: 'success',
      message: `Plexivia Document '${created.title}' created successfully`,
      data: created
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to create document' });
  }
};

export const updateDoc = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;
    const updated = PlexiviaDocService.update(id, updates);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: `Plexivia Document '${id}' not found` });
    }

    return res.json({
      status: 'success',
      message: `Plexivia Document '${updated.title}' updated successfully`,
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to update document' });
  }
};

export const deleteDoc = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const success = PlexiviaDocService.delete(id);

    if (!success) {
      return res.status(404).json({ status: 'error', message: `Plexivia Document '${id}' not found` });
    }

    return res.json({
      status: 'success',
      message: `Plexivia Document '${id}' deleted successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to delete document' });
  }
};
