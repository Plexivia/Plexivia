import { Store } from '../data/mockStore.js';
import { PlexiviaIssue, PlexiviaIssueFilters, PlexiviaChecklistItem } from '../types/index.js';
import { TelemetryHub } from '../websocket/telemetryHub.js';
import { PlexiviaProjectService } from './PlexiviaProjectService.js';

export class PlexiviaIssueService {
  public static getAll(filters: PlexiviaIssueFilters = {}): PlexiviaIssue[] {
    let result = [...Store.issues];

    if (filters.status) {
      const statusArr = filters.status.split(',').map(s => s.trim().toLowerCase());
      result = result.filter(i => statusArr.includes(i.status.toLowerCase()));
    }

    if (filters.priority) {
      const prioArr = filters.priority.split(',').map(p => p.trim().toLowerCase());
      result = result.filter(i => prioArr.includes(i.priority.toLowerCase()));
    }

    if (filters.project || filters.projectId) {
      const proj = (filters.project || filters.projectId)?.toLowerCase();
      result = result.filter(i =>
        i.projectId.toLowerCase() === proj ||
        i.projectCode?.toLowerCase() === proj ||
        i.projectName?.toLowerCase() === proj
      );
    }

    if (filters.assignee || filters.assigneeId) {
      const assign = (filters.assignee || filters.assigneeId)?.toLowerCase();
      result = result.filter(i =>
        i.assigneeId?.toLowerCase() === assign ||
        i.assigneeName?.toLowerCase().includes(assign!)
      );
    }

    if (filters.issueType) {
      result = result.filter(i => i.issueType.toLowerCase() === filters.issueType?.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.issueKey.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public static getById(id: string): PlexiviaIssue | null {
    return Store.issues.find(i => i.id === id || i.issueKey.toLowerCase() === id.toLowerCase()) || null;
  }

  public static create(data: Partial<PlexiviaIssue>): PlexiviaIssue {
    const id = data.id || `issue-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    // Resolve project details
    const project = Store.projects.find(p => p.id === data.projectId || p.code === data.projectId);
    const projectId = project ? project.id : (data.projectId || 'proj-core-01');
    const projectName = project ? project.name : (data.projectName || 'Plexivia Project');
    const projectCode = project ? project.code : (data.projectCode || 'PLX');

    // Auto-generate sequential issue key
    const existingKeys = Store.issues
      .filter(i => i.projectId === projectId || i.projectCode === projectCode)
      .map(i => {
        const num = parseInt(i.issueKey.replace(/^[^\d]+-/, ''), 10);
        return isNaN(num) ? 0 : num;
      });
    const nextNum = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 101;
    const issueKey = data.issueKey || `${projectCode}-${nextNum}`;

    const newIssue: PlexiviaIssue = {
      id,
      issueKey,
      projectId,
      projectName,
      projectCode,
      title: data.title || 'Untitled Issue',
      description: data.description || '',
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      issueType: data.issueType || 'TASK',
      assigneeId: data.assigneeId,
      assigneeName: data.assigneeName,
      assigneeAvatar: data.assigneeAvatar,
      reporterId: data.reporterId || 'usr-admin-01',
      reporterName: data.reporterName || 'Plexivia Architect',
      estimatedHours: data.estimatedHours ?? 0,
      spentHours: data.spentHours ?? 0,
      loggedHours: data.loggedHours ?? 0,
      dueDate: data.dueDate,
      tags: data.tags || [],
      checklist: data.checklist || [],
      commentsCount: data.commentsCount ?? 0,
      attachmentsCount: data.attachmentsCount ?? 0,
      createdAt: now,
      updatedAt: now
    };

    Store.issues.unshift(newIssue);

    // Update project statistics
    PlexiviaProjectService.recalculateCounters(projectId);

    // Real-time broadcast
    TelemetryHub.broadcastEvent('ISSUE_CREATED', newIssue);

    return newIssue;
  }

  public static update(id: string, updates: Partial<PlexiviaIssue>): PlexiviaIssue | null {
    const index = Store.issues.findIndex(i => i.id === id || i.issueKey.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const existing = Store.issues[index];
    const updated: PlexiviaIssue = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      issueKey: existing.issueKey, // Immutable Key
      updatedAt: new Date().toISOString()
    };

    Store.issues[index] = updated;

    // Recalculate parent project metrics if status changed
    if (updates.status && updates.status !== existing.status) {
      PlexiviaProjectService.recalculateCounters(updated.projectId);
    }

    TelemetryHub.broadcastEvent('ISSUE_UPDATED', updated);

    return updated;
  }

  public static delete(id: string): boolean {
    const index = Store.issues.findIndex(i => i.id === id || i.issueKey.toLowerCase() === id.toLowerCase());
    if (index === -1) return false;

    const [deleted] = Store.issues.splice(index, 1);

    // Recalculate parent project metrics
    PlexiviaProjectService.recalculateCounters(deleted.projectId);

    TelemetryHub.broadcastEvent('ISSUE_DELETED', { id: deleted.id, issueKey: deleted.issueKey, projectId: deleted.projectId });

    return true;
  }

  public static addChecklistItem(issueId: string, itemText: string): PlexiviaChecklistItem | null {
    const issue = this.getById(issueId);
    if (!issue) return null;

    const newItem: PlexiviaChecklistItem = {
      id: `chk-${Date.now().toString(36)}`,
      text: itemText,
      completed: false
    };

    if (!issue.checklist) {
      issue.checklist = [];
    }

    issue.checklist.push(newItem);
    issue.updatedAt = new Date().toISOString();

    TelemetryHub.broadcastEvent('ISSUE_UPDATED', issue);

    return newItem;
  }

  public static toggleChecklistItem(issueId: string, itemId: string, completed?: boolean): PlexiviaIssue | null {
    const issue = this.getById(issueId);
    if (!issue || !issue.checklist) return null;

    const item = issue.checklist.find(c => c.id === itemId);
    if (!item) return null;

    item.completed = completed !== undefined ? completed : !item.completed;
    if (item.completed) {
      item.completedAt = new Date().toISOString();
    } else {
      delete item.completedAt;
    }

    issue.updatedAt = new Date().toISOString();
    TelemetryHub.broadcastEvent('ISSUE_UPDATED', issue);

    return issue;
  }
}
