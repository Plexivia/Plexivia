import React, { useMemo } from 'react';
import { Mail, Send, User as UserIcon } from 'lucide-react';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
import { RoleBadge } from '@/components/common/Badge';

interface MemberTableProps {
  members: any[];
  tasks: any[];
  invitingEmail: string | null;
  onInvite: (email: string) => void;
  exportFilename: string;
  emptyTitle?: string;
}

const header = (title: string) => ({ column }: any) => <DataTableColumnHeader column={column} title={title} />;

// Roster list with search plus role and department filters
export const MemberTable: React.FC<MemberTableProps> = ({ members, tasks, invitingEmail, onInvite, exportFilename, emptyTitle = 'No members found' }) => {
  const options = (key: string) =>
    Array.from(new Set(members.map((m) => m[key]).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  const columns = useMemo(
    () => [
      {
        id: 'member',
        accessorFn: (m: any) => `${m.full_name || m.name || ''} ${m.email || ''}`,
        header: header('Member'),
        cell: ({ row }: any) => {
          const m = row.original;
          const name = m.full_name || m.name || 'Member';
          return (
            <div className="flex items-center gap-3 min-w-0">
              {m.avatar || m.avatar_url ? (
                <img src={m.avatar || m.avatar_url} alt={name} className="size-9 rounded-xl object-cover" />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {m.full_name ? m.full_name.charAt(0).toUpperCase() : <UserIcon className="size-4" />}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-bold text-foreground">{name}</div>
                {m.department && <div className="truncate font-mono text-[11px] text-muted-foreground">{m.department}</div>}
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
        accessorKey: 'hourly_rate',
        header: header('Rate'),
        cell: ({ getValue }: any) =>
          getValue() !== undefined ? <span className="font-mono text-xs font-bold text-foreground">৳{getValue()} / hr</span> : <span className="text-muted-foreground">—</span>,
      },
      {
        id: 'tasks',
        accessorFn: (m: any) => tasks.filter((t) => t.assignee_id === m.id && t.status !== 'DONE').length,
        header: header('Active Tasks'),
        cell: ({ getValue }: any) => <span className="font-mono text-xs font-bold text-foreground">{getValue()}</span>,
      },
      {
        id: 'done',
        accessorFn: (m: any) => tasks.filter((t) => t.assignee_id === m.id && t.status === 'DONE').length,
        header: header('Done'),
        cell: ({ getValue }: any) => <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{getValue()}</span>,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }: any) =>
          row.original.email ? (
            <button
              type="button"
              disabled={invitingEmail === row.original.email}
              onClick={() => onInvite(row.original.email)}
              title="Send invitation & temporary password email"
              className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-sky-400 cursor-pointer disabled:opacity-50"
            >
              <Send className="size-3" />
              {invitingEmail === row.original.email ? 'Sending...' : 'Invite'}
            </button>
          ) : null,
      },
    ],
    [tasks, invitingEmail, onInvite]
  );

  return (
    <UnifiedDataTable
      columns={columns}
      data={members}
      searchPlaceholder="Search by name, email, or department..."
      facetedFilters={[
        { columnId: 'role', title: 'Role', options: options('role') },
        { columnId: 'department', title: 'Department', options: options('department') },
      ]}
      exportFilename={exportFilename}
      emptyTitle={emptyTitle}
    />
  );
};

export default MemberTable;
