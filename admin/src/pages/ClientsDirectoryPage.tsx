import { HeaderTitle } from '@/components/common/HeaderTitle';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
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
  const { clients, projects, deleteClient, refreshAll } = useData();
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Total MRR calculation
  const totalMRR = safeClients.reduce((acc, c) => acc + (c.monthly_retainer || 0), 0);
  const multiTenantCount = safeClients.filter(c => c.client_type === 'MULTI_TENANT_ECOMMERCE').length;
  const singleTenantCount = safeClients.filter(c => c.client_type === 'SINGLE_TENANT').length;

  const handleDelete = async (client: Client) => {
    if (window.confirm(`Are you sure you want to remove "${client.business_name || 'this client'}"?`)) {
      await deleteClient(client.id);
    }
  };

  const columns = [
    {
      id: 'business',
      accessorFn: (c: any) => `${c.business_name || ''} ${c.client_key || ''} ${c.primary_domain || ''}`,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Client" />,
      cell: ({ row }: any) => (
        <div className="min-w-0">
          <div className="font-bold text-foreground truncate">{row.original.business_name}</div>
          <div className="text-[11px] font-mono text-primary">@{row.original.client_key}</div>
        </div>
      ),
    },
    {
      accessorKey: 'client_type',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Architecture" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ row }: any) => <TenantTypeBadge type={row.original.client_type} sharedDb={row.original.database_shared} />,
    },
    {
      accessorKey: 'status',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'primary_domain',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Domain" />,
      cell: ({ row }: any) =>
        row.original.primary_domain ? (
          <a href={`https://${row.original.primary_domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-xs text-primary hover:underline">
            <span className="truncate">{row.original.primary_domain}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : <span className="text-muted-foreground">—</span>,
    },
    {
      id: 'contact',
      accessorFn: (c: any) => `${c.contact_email || ''} ${c.contact_phone || ''}`,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }: any) => (
        <div className="min-w-0 text-xs text-muted-foreground">
          <div className="truncate">{row.original.contact_email || '—'}</div>
          {row.original.contact_phone && <div className="font-mono">{row.original.contact_phone}</div>}
        </div>
      ),
    },
    {
      accessorKey: 'monthly_retainer',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Retainer (BDT)" />,
      cell: ({ getValue }: any) => (
        <span className="font-mono text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          ৳{Number(getValue() || 0).toLocaleString('en-BD')} / mo
        </span>
      ),
    },
    {
      id: 'projects',
      accessorFn: (c: any) => safeProjects.filter((p) => p.client_id === c.id).length,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Projects" />,
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-foreground">{getValue()}</span>,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }: any) => (
        <button
          onClick={() => handleDelete(row.original)}
          title="Remove client"
          className="rounded-lg bg-rose-600 p-1.5 text-white transition hover:bg-rose-500 cursor-pointer"
        >
          <Trash2 className="size-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderTitle
        icon={Building2}
        title="Enterprise Clients Directory"
        onRefresh={refreshAll}
        actions={
        <button
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/30 transition-all  cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Client</span>
        </button>
        }
      />

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase">
            Total Enrolled Clients
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">{safeClients.length}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Active contracts</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 shadow-xs">
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 font-mono uppercase">
            Multi-Tenant eCommerce
          </span>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-300 font-mono mt-2">{multiTenantCount}</div>
          <span className="text-[11px] text-purple-600/70 dark:text-purple-400/70 mt-0.5 block">Shared Postgres Cluster</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 shadow-xs">
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 font-mono uppercase">
            Dedicated Single-Tenant
          </span>
          <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-300 font-mono mt-2">{singleTenantCount}</div>
          <span className="text-[11px] text-indigo-600/70 dark:text-indigo-400/70 mt-0.5 block">Isolated VPS / DB</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono uppercase">
            Monthly Retainer Runrate
          </span>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 font-mono mt-2">
            ৳{totalMRR.toLocaleString('en-BD')} / mo
          </div>
          <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5 block">Recurring services</span>
        </div>
      </div>

      <UnifiedDataTable
        columns={columns}
        data={safeClients}
        searchPlaceholder="Search by business name, slug, or domain..."
        facetedFilters={[
          {
            columnId: 'client_type',
            title: 'Architecture',
            options: [
              { label: 'Multi-Tenant', value: 'MULTI_TENANT_ECOMMERCE' },
              { label: 'Single Tenant', value: 'SINGLE_TENANT' },
            ],
          },
          {
            columnId: 'status',
            title: 'Status',
            options: Array.from(new Set(safeClients.map((c) => c.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) })),
          },
        ]}
        exportFilename="clients"
        emptyTitle="No clients found"
      />

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
