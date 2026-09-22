import { Store } from '../data/mockStore.js';
import { PlexiviaDoc, PlexiviaDocFilters } from '../types/index.js';
import { TelemetryHub } from '../websocket/telemetryHub.js';

export class PlexiviaDocService {
  public static getAll(filters: PlexiviaDocFilters = {}): PlexiviaDoc[] {
    let result = [...Store.docs];

    if (filters.category) {
      result = result.filter(d => d.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters.status) {
      result = result.filter(d => d.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters.projectId) {
      result = result.filter(d => d.projectId === filters.projectId);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public static getById(id: string): PlexiviaDoc | null {
    return Store.docs.find(d => d.id === id || d.slug.toLowerCase() === id.toLowerCase()) || null;
  }

  public static create(data: Partial<PlexiviaDoc>): PlexiviaDoc {
    const id = data.id || `doc-${Date.now().toString(36)}`;
    const title = data.title || 'Untitled Document';
    const slug = data.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const project = data.projectId ? Store.projects.find(p => p.id === data.projectId) : undefined;

    const newDoc: PlexiviaDoc = {
      id,
      title,
      slug,
      description: data.description || '',
      content: data.content || '',
      category: data.category || 'GENERAL',
      status: data.status || 'DRAFT',
      projectId: data.projectId,
      projectName: project ? project.name : data.projectName,
      authorId: data.authorId || 'usr-dev-01',
      authorName: data.authorName || 'Alex Rahman',
      authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      version: data.version || '1.0.0',
      tags: data.tags || [],
      isPublic: data.isPublic ?? true,
      isPinned: data.isPinned ?? false,
      createdAt: now,
      updatedAt: now
    };

    Store.docs.unshift(newDoc);
    TelemetryHub.broadcastEvent('DOC_CREATED', newDoc);

    return newDoc;
  }

  public static update(id: string, updates: Partial<PlexiviaDoc>): PlexiviaDoc | null {
    const index = Store.docs.findIndex(d => d.id === id || d.slug.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const existing = Store.docs[index];
    const updated: PlexiviaDoc = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      slug: updates.slug ? updates.slug.toLowerCase() : existing.slug,
      updatedAt: new Date().toISOString()
    };

    Store.docs[index] = updated;
    TelemetryHub.broadcastEvent('DOC_UPDATED', updated);

    return updated;
  }

  public static delete(id: string): boolean {
    const index = Store.docs.findIndex(d => d.id === id || d.slug.toLowerCase() === id.toLowerCase());
    if (index === -1) return false;

    const [deleted] = Store.docs.splice(index, 1);
    TelemetryHub.broadcastEvent('DOC_DELETED', { id: deleted.id, slug: deleted.slug });

    return true;
  }
}
