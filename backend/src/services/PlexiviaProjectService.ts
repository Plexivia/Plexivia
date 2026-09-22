import { Store } from '../data/mockStore.js';
import { PlexiviaProject, PlexiviaProjectFilters } from '../types/index.js';
import { TelemetryHub } from '../websocket/telemetryHub.js';

export class PlexiviaProjectService {
  public static getAll(filters: PlexiviaProjectFilters = {}): PlexiviaProject[] {
    let result = [...Store.projects];

    if (filters.status) {
      result = result.filter(p => p.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters.type) {
      result = result.filter(p => p.type.toLowerCase() === filters.type?.toLowerCase());
    }

    if (filters.clientId) {
      result = result.filter(p => p.clientId === filters.clientId);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public static getById(id: string): PlexiviaProject | null {
    return Store.projects.find(p => p.id === id || p.code.toLowerCase() === id.toLowerCase()) || null;
  }

  public static create(data: Partial<PlexiviaProject>): PlexiviaProject {
    const id = data.id || `proj-${Date.now().toString(36)}`;
    const code = data.code || `PLX-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newProject: PlexiviaProject = {
      id,
      name: data.name || 'Untitled Plexivia Project',
      code: code.toUpperCase(),
      description: data.description || '',
      clientId: data.clientId || 'client-internal-01',
      clientName: data.clientName || 'Plexivia Internal Core',
      type: data.type || 'SRE_INFRA',
      status: data.status || 'PLANNING',
      progressPercent: data.progressPercent ?? 0,
      leadId: data.leadId,
      leadName: data.leadName,
      leadAvatar: data.leadAvatar,
      gitRepoUrl: data.gitRepoUrl,
      productionUrl: data.productionUrl,
      stagingUrl: data.stagingUrl,
      dueDate: data.dueDate,
      tasksCount: data.tasksCount || { total: 0, completed: 0, inProgress: 0 },
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now
    };

    Store.projects.unshift(newProject);
    TelemetryHub.broadcastEvent('PROJECT_CREATED', newProject);

    return newProject;
  }

  public static update(id: string, updates: Partial<PlexiviaProject>): PlexiviaProject | null {
    const index = Store.projects.findIndex(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const existing = Store.projects[index];
    const updated: PlexiviaProject = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      code: updates.code ? updates.code.toUpperCase() : existing.code,
      updatedAt: new Date().toISOString()
    };

    Store.projects[index] = updated;
    TelemetryHub.broadcastEvent('PROJECT_UPDATED', updated);

    return updated;
  }

  public static delete(id: string): boolean {
    const index = Store.projects.findIndex(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());
    if (index === -1) return false;

    const [deleted] = Store.projects.splice(index, 1);
    TelemetryHub.broadcastEvent('PROJECT_DELETED', { id: deleted.id, code: deleted.code });

    return true;
  }

  public static recalculateCounters(projectId: string) {
    const project = Store.projects.find(p => p.id === projectId);
    if (!project) return;

    const projectIssues = Store.issues.filter(i => i.projectId === projectId);
    const total = projectIssues.length;
    const completed = projectIssues.filter(i => i.status === 'DONE').length;
    const inProgress = projectIssues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW').length;

    project.tasksCount = { total, completed, inProgress };
    project.progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    project.updatedAt = new Date().toISOString();

    TelemetryHub.broadcastEvent('PROJECT_UPDATED', project);
  }
}
