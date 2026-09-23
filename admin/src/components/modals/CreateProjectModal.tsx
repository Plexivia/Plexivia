import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { ProjectType, ProjectStatus } from '../../types';
import { FolderPlus, Globe, GitBranch, Calendar } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { clients, users, createProject } = useData();
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const [clientId, setClientId] = useState(safeClients[0]?.id || '');
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('ECOMMERCE_MULTITENANT');
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [productionUrl, setProductionUrl] = useState('');
  const [leadId, setLeadId] = useState(safeUsers[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (name: string) => {
    setProjectName(name);
    if (!projectCode) {
      const generated = name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      if (generated) setProjectCode(generated + '-ECOMM');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectCode.trim()) return;

    setLoading(true);
    try {
      const selectedClient = safeClients.find(c => c.id === clientId);
      const selectedLead = safeUsers.find(u => u.id === leadId);

      await createProject({
        client_id: clientId || safeClients[0]?.id,
        client_name: selectedClient?.business_name || 'Client',
        project_name: projectName.trim(),
        project_code: projectCode.trim().toUpperCase(),
        project_type: projectType,
        git_repo_url: gitRepoUrl.trim() || ('https://git.plexivia.com/plexivia/' + projectCode.toLowerCase()),
        production_url: productionUrl.trim() || ('https://' + projectCode.toLowerCase() + '.plexivia.com'),
        status: 'ACTIVE' as ProjectStatus,
        progress_percent: 0,
        lead_id: leadId || safeUsers[0]?.id,
        lead_name: selectedLead?.full_name || 'Admin',
        due_date: dueDate,
      });

      onClose();
      // Reset
      setProjectName('');
      setProjectCode('');
      setGitRepoUrl('');
      setProductionUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Launch New Enterprise Project"
      subtitle="Initialize a new client repository, deployment target, and project Kanban workspace"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Assign to Client *
            </label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
            >
              {safeClients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.business_name} ({c.client_type})
                </option>
              ))}
            </select>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Architecture Type *
            </label>
            <select
              value={projectType}
              onChange={e => setProjectType(e.target.value as ProjectType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
            >
              <option value="ECOMMERCE_MULTITENANT">Multi-Tenant eCommerce</option>
              <option value="CUSTOM_WEB">Custom Web App / CMS</option>
              <option value="SRE_INFRA">SRE & Infrastructure Ops</option>
              <option value="MOBILE_APP">Mobile App (React Native)</option>
              <option value="SYSTEM_MIGRATION">System Cloud Migration</option>
            </select>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Flagship Web Application"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-2xs"
            />
          </div>

          {/* Project Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Project Identifier Code *
            </label>
            <input
              type="text"
              required
              value={projectCode}
              onChange={e => setProjectCode(e.target.value.toUpperCase())}
              placeholder="e.g. APP-MAIN"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
            />
          </div>

          {/* Git Repo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Private Git Repo (Gitea)
            </label>
            <div className="relative">
              <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={gitRepoUrl}
                onChange={e => setGitRepoUrl(e.target.value)}
                placeholder="https://git.plexivia.com/plexivia/repo"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>

          {/* Production Domain */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Production Ingress Domain
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={productionUrl}
                onChange={e => setProductionUrl(e.target.value)}
                placeholder="https://clientdomain.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>

          {/* Project Lead */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Assigned Project Lead *
            </label>
            <select
              value={leadId}
              onChange={e => setLeadId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
            >
              {safeUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Target Delivery Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Delivery Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            {loading ? 'Initializing Project...' : 'Create & Provision Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
