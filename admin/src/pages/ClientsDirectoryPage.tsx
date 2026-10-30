import { HeaderTitle } from '@/components/common/HeaderTitle';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import * as MenuUi from '@/components/ui/dropdown-menu';
import { CreateClientModal } from '../components/modals/CreateClientModal';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { Client } from '../types';
import { Building2, Plus, Trash2, Pencil, Eye, MoreHorizontal, MessageCircle, Copy, Check } from 'lucide-react';

// The JSX dropdown primitives carry no prop types, so treat them as loosely typed components
const DropdownMenu = MenuUi.DropdownMenu as React.FC<any>;
const DropdownMenuContent = MenuUi.DropdownMenuContent as React.FC<any>;
const DropdownMenuItem = MenuUi.DropdownMenuItem as React.FC<any>;
const DropdownMenuLabel = MenuUi.DropdownMenuLabel as React.FC<any>;
const DropdownMenuSeparator = MenuUi.DropdownMenuSeparator as React.FC<any>;
const DropdownMenuTrigger = MenuUi.DropdownMenuTrigger as React.FC<any>;

// Digits-only phone link for opening a WhatsApp chat
const whatsappLink = (c: Client): string => {
  const digits = (c.contact_whatsapp || c.contact_phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
};

// Phone number with WhatsApp and copy shortcuts
const PhoneCell: React.FC<{ client: Client }> = ({ client }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const phone = client.contact_phone || '';
  const wa = whatsappLink(client);

  const copyPhone = async () => {
    if (!phone || !navigator.clipboard) return;
    await navigator.clipboard.writeText(phone);
    setCopied(true);
    showToast('success', 'Copied', `${phone} copied to clipboard.`);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!phone) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <span className="font-mono text-xs text-foreground">{phone}</span>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          title="Message on WhatsApp"
          className="inline-flex size-6 items-center justify-center rounded-md bg-emerald-500 text-white transition hover:bg-emerald-400 cursor-pointer"
        >
          <MessageCircle className="size-3.5" />
        </a>
      )}
      <button
        type="button"
        onClick={copyPhone}
        title="Copy phone number"
        className="inline-flex size-6 items-center justify-center rounded-md bg-muted text-foreground transition hover:bg-muted/70 cursor-pointer"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
};

export const ClientsDirectoryPage: React.FC = () => {
  const { clients, projects, deleteClient, refreshAll } = useData();
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Client | null>(null);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  const activeCount = safeClients.filter((c) => c.status === 'ACTIVE').length;

  const columns = [
    {
      id: 'client_name',
      accessorFn: (c: any) => `${c.client_name || ''} ${c.client_key || ''}`,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Client Name" />,
      cell: ({ row }: any) => (
        <div className="min-w-0">
          <div className="font-bold text-foreground truncate">{row.original.client_name || '—'}</div>
          {row.original.client_key && <div className="text-[11px] font-mono text-primary">@{row.original.client_key}</div>}
        </div>
      ),
    },
    {
      accessorKey: 'business_name',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Business Name" />,
      cell: ({ getValue }: any) => <span className="text-foreground truncate">{getValue() || '—'}</span>,
    },
    {
      id: 'phone',
      accessorFn: (c: any) => `${c.contact_phone || ''} ${c.contact_whatsapp || ''}`,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Phone Number" />,
      cell: ({ row }: any) => <PhoneCell client={row.original} />,
    },
    {
      accessorKey: 'contact_email',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ getValue }: any) => <span className="truncate text-muted-foreground">{getValue() || '—'}</span>,
    },
    {
      id: 'projects',
      accessorFn: (c: any) => safeProjects.filter((p) => p.client_id === c.id).length,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Projects" />,
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-foreground">{getValue()}</span>,
    },
    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }: any) => {
        const c: Client = row.original;
        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                aria-label="Actions"
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setViewTarget(c)} className="cursor-pointer">
                  <Eye className="text-muted-foreground" /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditTarget(c)} className="cursor-pointer">
                  <Pencil className="text-muted-foreground" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(c)} className="cursor-pointer">
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderTitle
        icon={Building2}
        title="All Clients"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase">
            Total Enrolled Clients
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">{safeClients.length}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">All registered clients</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono uppercase">
            Active Clients
          </span>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 font-mono mt-2">{activeCount}</div>
          <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5 block">Active contracts</span>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-500/20 shadow-xs">
          <span className="text-xs font-semibold text-sky-700 dark:text-sky-400 font-mono uppercase">
            Total Projects
          </span>
          <div className="text-2xl font-bold text-sky-800 dark:text-sky-300 font-mono mt-2">{safeProjects.length}</div>
          <span className="text-[11px] text-sky-600/70 dark:text-sky-400/70 mt-0.5 block">Across all clients</span>
        </div>
      </div>

      <UnifiedDataTable
        columns={columns}
        data={safeClients}
        searchPlaceholder="Search by client, business, phone, or email..."
        exportFilename="clients"
        emptyTitle="No clients found"
      />

      {/* Modals */}
      <CreateClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      <CreateClientModal
        isOpen={!!viewTarget}
        client={viewTarget}
        readOnly
        onClose={() => setViewTarget(null)}
      />

      <CreateClientModal
        isOpen={!!editTarget}
        client={editTarget}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteClient(deleteTarget.id)}
        title="Delete Client"
        message={`Remove "${deleteTarget?.business_name || 'this client'}" from the directory? This cannot be undone.`}
        confirmText="Delete"
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
};
