import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { NavTab } from '../../types';
import {
  Search,
  KanbanSquare,
  Building2,
  Server,
  Users,
  CheckCircle2,
  ArrowRight,
  Command,
  X
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { projects, tasks, clients, users, fleet } = useData();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeFleet = Array.isArray(fleet) ? fleet : [];

  const filteredProjects = q
    ? safeProjects.filter(
        p =>
          (p.project_name || '').toLowerCase().includes(q) ||
          (p.project_code || '').toLowerCase().includes(q) ||
          (p.client_name || '').toLowerCase().includes(q)
      )
    : safeProjects.slice(0, 3);

  const filteredTasks = q
    ? safeTasks.filter(t => (t.title || '').toLowerCase().includes(q) || (Array.isArray(t.tags) ? t.tags : []).some(tag => (tag || '').toLowerCase().includes(q)))
    : safeTasks.slice(0, 3);

  const filteredClients = q
    ? safeClients.filter(c => (c.business_name || '').toLowerCase().includes(q) || (c.primary_domain || '').toLowerCase().includes(q))
    : safeClients.slice(0, 2);

  const filteredFleet = q
    ? safeFleet.filter(n => (n.node_name || '').toLowerCase().includes(q) || (n.hostname || '').toLowerCase().includes(q))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden z-10 transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/80 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, project, task, client, or fleet node..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono flex items-center gap-1.5">
                <KanbanSquare className="w-3.5 h-3.5 text-cyan-400" /> Projects
              </span>
              <div className="space-y-1.5">
                {filteredProjects.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onNavigate('projects');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 transition-all text-left group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {proj.project_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {proj.project_code} • {proj.client_name}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Work Items & Tasks
              </span>
              <div className="space-y-1.5">
                {filteredTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onNavigate('projects');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 transition-all text-left group"
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-medium text-white truncate group-hover:text-emerald-300 transition-colors">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t.project_code} • {t.assignee_name} • {t.status}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients */}
          {filteredClients.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" /> Clients
              </span>
              <div className="space-y-1.5">
                {filteredClients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('clients');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/30 transition-all text-left group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {c.business_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.primary_domain} • {c.client_type}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VPS Fleet */}
          {filteredFleet.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-400" /> Fleet Nodes
              </span>
              <div className="space-y-1.5">
                {filteredFleet.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onNavigate('fleet');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 transition-all text-left group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white font-mono group-hover:text-blue-300 transition-colors">
                        {(n.node_name || n.name || "")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {n.ip_address} • {n.location}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredProjects.length === 0 &&
            filteredTasks.length === 0 &&
            filteredClients.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                No matching resources found for "{query}"
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
