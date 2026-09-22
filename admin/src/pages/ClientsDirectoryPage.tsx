import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { TenantTypeBadge, StatusBadge } from '../components/common/Badge';
import { CreateClientModal } from '../components/modals/CreateClientModal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { Client, ClientType } from '../types';
import {
  Building2,
  Plus,
  Search,
  Globe,
  Mail,
  Phone,
  DollarSign,
  FolderKanban,
  Database,
  ExternalLink,
  Trash2
} from 'lucide-react';

export const ClientsDirectoryPage: React.FC = () => {
  const { clients, projects, deleteClient } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Total MRR calculation
  const totalMRR = safeClients.reduce((acc, c) => acc + (c.monthly_retainer || 0), 0);
  const multiTenantCount = safeClients.filter(c => c.client_type === 'MULTI_TENANT_ECOMMERCE').length;
  const singleTenantCount = safeClients.filter(c => c.client_type === 'SINGLE_TENANT').length;

  const filteredClients = safeClients.filter(client => {
    if (filterType !== 'ALL' && client.client_type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (client.business_name || '').toLowerCase().includes(q);
      const matchSlug = (client.client_key || '').toLowerCase().includes(q);
      const matchDomain = (client.primary_domain || '').toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchDomain) return false;
    }
    return true;
  });

  const handleDelete = async (client: Client) => {
    if (window.confirm(`Are you sure you want to remove "${client.business_name || 'this client'}"?`)) {
      await deleteClient(client.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
            Enterprise Clients Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multi-tenant eCommerce instances, dedicated domains, database tenancy models, and retainer management.
          </p>
        </div>

        <button
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/50 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Onboard New Client
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 font-mono uppercase">
            Total Enrolled Clients
          </span>
          <div className="text-2xl font-bold text-white font-mono mt-2">{safeClients.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Active contracts</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-purple-400 font-mono uppercase">
            Multi-Tenant eCommerce
          </span>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-2">{multiTenantCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Shared Postgres Cluster</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-indigo-400 font-mono uppercase">
            Dedicated Single-Tenant
          </span>
          <div className="text-2xl font-bold text-indigo-300 font-mono mt-2">{singleTenantCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Isolated VPS / DB</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-emerald-400 font-mono uppercase">
            Monthly Retainer Runrate
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">
            ${totalMRR.toLocaleString()} / mo
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Recurring services</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by business name, slug, or domain..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
          >
            <option value="ALL">All Architecture Types</option>
            <option value="MULTI_TENANT_ECOMMERCE">Multi-Tenant Only</option>
            <option value="SINGLE_TENANT">Single Tenant Only</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map(client => {
          const clientProjects = safeProjects.filter(p => p.client_id === client.id);

          return (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header: Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {client.business_name}
                    </h3>
                    <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
                      slug: @{client.client_key}
                    </span>
                  </div>
                  <StatusBadge status={client.status} />
                </div>

                {/* Architecture Type & DB Badge */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <TenantTypeBadge
                    type={client.client_type}
                    sharedDb={client.database_shared}
                  />
                </div>

                {/* Domain & Contact Info */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 font-mono">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`https://${client.primary_domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline truncate flex items-center gap-1"
                    >
                      {client.primary_domain}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-400">{client.contact_email}</span>
                  </div>

                  {client.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-400 font-mono">{client.contact_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Meta & Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Retainer
                  </span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    ${(client.monthly_retainer || 0).toLocaleString()} / mo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    {clientProjects.length} Projects
                  </span>

                  <button
                    onClick={() => handleDelete(client)}
                    title="Remove client"
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreateClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
};
