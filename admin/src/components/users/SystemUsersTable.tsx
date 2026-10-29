import React, { useMemo, useState } from 'react';
import { Mail, Send, KeyRound, Power, BellRing, UserX, MoreHorizontal, Trash2, User as UserIcon } from 'lucide-react';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
import * as SwitchUi from '@/components/ui/switch';
import * as MenuUi from '@/components/ui/dropdown-menu';
import { RoleBadge } from '@/components/common/Badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ResetPasswordModal } from '@/components/modals/ResetPasswordModal';
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

// System users roster with status and mail toggles, invite, password reset and access revocation
export const SystemUsersTable: React.FC<{ users: User[] }> = ({ users }) => {
  const { updateUser, inviteUser, deleteUser, bulkDeleteUsers } = useData();
  const currentUser = useAuthStore((state) => state.user);
  const [busy, setBusy] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<User | null>(null);
  const [bulkTargets, setBulkTargets] = useState<User[]>([]);

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

  const toggleMail = (u: User) =>
    runFor(`mail:${userKey(u)}`, () =>
      updateUser(
        userKey(u),
        { receive_email_notifications: !u.receive_email_notifications },
        `Email notifications ${u.receive_email_notifications ? 'turned off' : 'turned on'} for ${u.full_name}.`
      )
    );

  const options = (key: keyof User) =>
    Array.from(new Set(users.map((u) => u[key]).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  const columns = useMemo(
    () => [
      {
        id: 'member',
        accessorFn: (u: User) => `${u.full_name || u.name || ''} ${u.email || ''}`,
        header: header('User'),
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
              <div className="min-w-0">
                <div className="truncate font-bold text-foreground">
                  {name}
                  {isSelf(u) && <span className="ml-1.5 font-mono text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">(you)</span>}
                </div>
                {u.department && <div className="truncate font-mono text-[11px] text-muted-foreground">{u.department}</div>}
              </div>
            </div>
          );
        },
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
        accessorKey: 'role',
        header: header('Assigned Role'),
        filterFn: 'arrIncludesSome' as const,
        cell: ({ row }: any) => (row.original.role ? <RoleBadge role={row.original.role} /> : <span className="text-muted-foreground">—</span>),
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
        id: 'mail',
        accessorFn: (u: User) => (u.receive_email_notifications ? 'On' : 'Off'),
        header: header('Get Mail'),
        cell: ({ row }: any) => {
          const u: User = row.original;
          return (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={!!u.receive_email_notifications}
                onCheckedChange={() => toggleMail(u)}
                disabled={busy === `mail:${userKey(u)}` || !canManage(u)}
                aria-label="Toggle email notifications"
              />
              <span className={`font-mono text-[11px] font-semibold ${u.receive_email_notifications ? 'text-sky-600 dark:text-sky-400' : 'text-muted-foreground'}`}>
                {u.receive_email_notifications ? 'On' : 'Off'}
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
        header: '',
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
                  <DropdownMenuItem
                    disabled={!manageable || busy === `invite:${userKey(u)}` || !u.email}
                    onClick={() => runFor(`invite:${userKey(u)}`, () => inviteUser(userKey(u)))}
                    className="cursor-pointer"
                  >
                    <Send className="text-sky-500" /> {busy === `invite:${userKey(u)}` ? 'Sending Invite...' : 'Resend Invite Email'}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={!manageable} onClick={() => setResetTarget(u)} className="cursor-pointer">
                    <KeyRound className="text-muted-foreground" /> Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={!manageable || isSelf(u)} onClick={() => toggleStatus(u)} className="cursor-pointer">
                    <Power className="text-muted-foreground" /> {u.is_active === false ? 'Activate Account' : 'Deactivate Account'}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={!manageable} onClick={() => toggleMail(u)} className="cursor-pointer">
                    <BellRing className="text-muted-foreground" /> {u.receive_email_notifications ? 'Turn Off Get Mail' : 'Turn On Get Mail'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={!manageable || isSelf(u)}
                    onClick={() => setRevokeTarget(u)}
                    className="cursor-pointer"
                  >
                    <UserX /> Revoke Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, currentUser, users]
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
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ],
          },
        ]}
        bulkActions={[{ label: 'Revoke Access', icon: Trash2, variant: 'destructive', onClick: (rows: User[]) => setBulkTargets(rows) }]}
        exportFilename="system-users"
        emptyTitle="No system users found"
      />

      <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />

      <ConfirmDialog
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => revokeTarget && runFor(`revoke:${userKey(revokeTarget)}`, () => deleteUser(userKey(revokeTarget)))}
        title="Revoke Access"
        message={`Remove ${revokeTarget?.full_name || 'this user'} (${revokeTarget?.email || ''}) from the dashboard? They will no longer be able to sign in.`}
        confirmText="Revoke Access"
      />

      <ConfirmDialog
        isOpen={bulkTargets.length > 0}
        onClose={() => setBulkTargets([])}
        onConfirm={() => runFor('bulk', () => bulkDeleteUsers(bulkTargets.map(userKey)))}
        title="Revoke Access"
        message={`Remove ${bulkTargets.length} selected user(s) from the dashboard? Your own account and protected accounts are skipped.`}
        confirmText={`Revoke ${bulkTargets.length} User(s)`}
      />
    </>
  );
};

export default SystemUsersTable;
