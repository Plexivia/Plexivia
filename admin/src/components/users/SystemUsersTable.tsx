import React, { useMemo, useState } from 'react';
import { Mail, KeyRound, ShieldCheck, MessageCircle, MoreHorizontal, Trash2, Eye, User as UserIcon } from 'lucide-react';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
import * as SwitchUi from '@/components/ui/switch';
import * as MenuUi from '@/components/ui/dropdown-menu';
import { RoleBadge } from '@/components/common/Badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ResetPasswordModal } from '@/components/modals/ResetPasswordModal';
import { EditUserModal } from '@/components/modals/EditUserModal';
import { formatDateTime } from '@/utils/dateHelper';
import { useData } from '@/context/DataContext';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types';

// The JSX UI primitives carry no prop types, so treat them as loosely typed components
const Switch = SwitchUi.Switch as React.FC<any>;
const DropdownMenu = MenuUi.DropdownMenu as React.FC<any>;
const DropdownMenuContent = MenuUi.DropdownMenuContent as React.FC<any>;
const DropdownMenuItem = MenuUi.DropdownMenuItem as React.FC<any>;
const DropdownMenuLabel = MenuUi.DropdownMenuLabel as React.FC<any>;
const DropdownMenuSeparator = MenuUi.DropdownMenuSeparator as React.FC<any>;
const DropdownMenuTrigger = MenuUi.DropdownMenuTrigger as React.FC<any>;

const PRIVILEGED_ROLES = ['OWNER', 'SUPER_ADMIN'];

const header = (title: string) => ({ column }: any) => <DataTableColumnHeader column={column} title={title} />;

// Resolve the identifier the users API accepts for a record
const userKey = (u: User): string => u.dId || u.email || u.id;

// Digits-only phone link for opening a WhatsApp chat
const whatsappLink = (u: User): string => {
  const digits = (u.phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
};

// Team roster with status toggle, contact shortcuts, profile edit, password update, 2FA setup and removal
export const SystemUsersTable: React.FC<{ users: User[] }> = ({ users }) => {
  const { tasks, updateUser, sendUser2fa, deleteUser, bulkDeleteUsers } = useData();
  const currentUser = useAuthStore((state) => state.user);
  const [busy, setBusy] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<User | null>(null);
  const [bulkTargets, setBulkTargets] = useState<User[]>([]);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const activeTaskCount = (u: User) => safeTasks.filter((t: any) => t.assignee_id === u.id && t.status !== 'DONE').length;

  const isSelf = (u: User) => !!currentUser?.email && u.email === currentUser.email;
  // Only Owner / Super Admin may manage privileged accounts, and only Owner may manage Owners
  const canManage = (u: User) => {
    if (!u.role || !PRIVILEGED_ROLES.includes(u.role)) return true;
    if (u.role === 'OWNER') return currentUser?.role === 'OWNER';
    return PRIVILEGED_ROLES.includes(currentUser?.role || '');
  };

  // Run a per-row action while showing that row as busy
  const runFor = async (key: string, action: () => Promise<unknown>) => {
    setBusy(key);
    try {
      await action();
    } catch {
      // Toast already shown by the data context
    } finally {
      setBusy(null);
    }
  };

  const toggleStatus = (u: User) =>
    runFor(`status:${userKey(u)}`, () =>
      updateUser(userKey(u), { is_active: u.is_active === false }, `${u.full_name} is now ${u.is_active === false ? 'active' : 'inactive'}.`)
    );

  const options = (key: keyof User) =>
    Array.from(new Set(users.map((u) => u[key]).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  const columns = useMemo(
    () => [
      {
        id: 'member',
        accessorFn: (u: User) => `${u.full_name || u.name || ''} ${u.email || ''}`,
        header: header('Member Name'),
        cell: ({ row }: any) => {
          const u: User = row.original;
          const name = u.full_name || u.name || 'User';
          return (
            <div className="flex items-center gap-3 min-w-0">
              {u.avatar || u.avatar_url ? (
                <img src={u.avatar || u.avatar_url} alt={name} className="size-9 rounded-xl object-cover" />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {name ? name.charAt(0).toUpperCase() : <UserIcon className="size-4" />}
                </div>
              )}
              <div className="truncate font-bold text-foreground">
                {name}
                {isSelf(u) && <span className="ml-1.5 font-mono text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">(you)</span>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: header('Role'),
        filterFn: 'arrIncludesSome' as const,
        cell: ({ row }: any) => (row.original.role ? <RoleBadge role={row.original.role} /> : <span className="text-muted-foreground">—</span>),
      },
      {
        accessorKey: 'department',
        header: header('Department'),
        filterFn: 'arrIncludesSome' as const,
        cell: ({ getValue }: any) => <span className="text-muted-foreground">{getValue() || '—'}</span>,
      },
      {
        accessorKey: 'email',
        header: header('Email'),
        cell: ({ row }: any) => (
          <span className="flex items-center gap-1.5 min-w-0 text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{row.original.email || '—'}</span>
          </span>
        ),
      },
      {
        id: 'tasks',
        accessorFn: (u: User) => activeTaskCount(u),
        header: header('Active Tasks'),
        cell: ({ getValue }: any) => <span className="font-mono text-xs font-bold text-foreground">{getValue()}</span>,
      },
      {
        id: 'contact',
        header: 'Contact',
        enableSorting: false,
        cell: ({ row }: any) => {
          const u: User = row.original;
          const wa = whatsappLink(u);
          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Message on WhatsApp"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-400 cursor-pointer"
                >
                  <MessageCircle className="size-3" /> WhatsApp
                </a>
              ) : (
                <span
                  title="No phone number on file"
                  className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground opacity-60"
                >
                  <MessageCircle className="size-3" /> WhatsApp
                </span>
              )}
              {u.email ? (
                <a
                  href={`mailto:${u.email}`}
                  title="Send an email"
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-sky-400 cursor-pointer"
                >
                  <Mail className="size-3" /> Email
                </a>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'status',
        accessorFn: (u: User) => (u.is_active === false ? 'Inactive' : 'Active'),
        header: header('Status'),
        filterFn: 'arrIncludesSome' as const,
        cell: ({ row }: any) => {
          const u: User = row.original;
          const active = u.is_active !== false;
          return (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={active}
                onCheckedChange={() => toggleStatus(u)}
                disabled={busy === `status:${userKey(u)}` || isSelf(u) || !canManage(u)}
                aria-label="Toggle active status"
              />
              <span className={`font-mono text-[11px] font-semibold ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>
          );
        },
      },
      {
        id: 'last_login',
        accessorFn: (u: User) => u.last_login_at || '',
        header: header('Last Login'),
        cell: ({ getValue }: any) =>
          getValue() ? (
            <span className="font-mono text-[11px] text-muted-foreground">{formatDateTime(getValue())}</span>
          ) : (
            <span className="font-mono text-[11px] text-muted-foreground/60">Never</span>
          ),
      },
      {
        id: 'actions',
        header: 'Action',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }: any) => {
          const u: User = row.original;
          const manageable = canManage(u);
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                  aria-label="Actions"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setEditTarget(u)} className="cursor-pointer">
                    <Eye className="text-muted-foreground" /> View / Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={!manageable} onClick={() => setResetTarget(u)} className="cursor-pointer">
                    <KeyRound className="text-muted-foreground" /> Update Password
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!manageable || busy === `2fa:${userKey(u)}` || !u.email}
                    onClick={() => runFor(`2fa:${userKey(u)}`, () => sendUser2fa(userKey(u)))}
                    className="cursor-pointer"
                  >
                    <ShieldCheck className="text-sky-500" /> {busy === `2fa:${userKey(u)}` ? 'Sending 2FA...' : 'Send 2FA'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={!manageable || isSelf(u)}
                    onClick={() => setRevokeTarget(u)}
                    className="cursor-pointer"
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, currentUser, users, safeTasks]
  );

  return (
    <>
      <UnifiedDataTable
        columns={columns}
        data={users}
        enableRowSelection
        searchPlaceholder="Search by name, email, or department..."
        facetedFilters={[
          { columnId: 'role', title: 'Role', options: options('role') },
          { columnId: 'department', title: 'Department', options: options('department') },
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ],
          },
        ]}
        initialColumnVisibility={{ last_login: false }}
        bulkActions={[{ label: 'Delete', icon: Trash2, variant: 'destructive', onClick: (rows: User[]) => setBulkTargets(rows) }]}
        exportFilename="team"
        emptyTitle="No team members found"
      />

      <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
      <EditUserModal user={editTarget} onClose={() => setEditTarget(null)} />

      <ConfirmDialog
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => revokeTarget && runFor(`revoke:${userKey(revokeTarget)}`, () => deleteUser(userKey(revokeTarget)))}
        title="Delete Member"
        message={`Remove ${revokeTarget?.full_name || 'this user'} (${revokeTarget?.email || ''}) from the dashboard? They will no longer be able to sign in.`}
        confirmText="Delete"
      />

      <ConfirmDialog
        isOpen={bulkTargets.length > 0}
        onClose={() => setBulkTargets([])}
        onConfirm={() => runFor('bulk', () => bulkDeleteUsers(bulkTargets.map(userKey)))}
        title="Delete Members"
        message={`Remove ${bulkTargets.length} selected member(s) from the dashboard? Your own account and protected accounts are skipped.`}
        confirmText={`Delete ${bulkTargets.length} Member(s)`}
      />
    </>
  );
};

export default SystemUsersTable;
