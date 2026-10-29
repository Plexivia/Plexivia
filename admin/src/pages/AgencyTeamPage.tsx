import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RoleBadge } from '../components/common/Badge';
import { CreateTeamMemberModal } from '../components/modals/CreateTeamMemberModal';
import {
  UserPlus,
  Mail,
  Send,
  KanbanSquare,
  CheckCircle2,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { TableV2 } from '@/components/table/versionTwo';

type Access = 'full' | 'partial' | 'none';
interface RbacRow {
  role: string;
  roleClass: string;
  cells: Record<string, [string, Access]>;
}

const ACCESS_CLASS: Record<Access, string> = {
  full: 'text-emerald-600 dark:text-emerald-400',
  partial: 'text-muted-foreground',
  none: 'text-muted-foreground/60',
};

const RBAC_ROWS: RbacRow[] = [
  {
    role: 'SUPER_ADMIN',
    roleClass: 'text-rose-500 dark:text-rose-400',
    cells: { projects: ['Full Read/Write', 'full'], clients: ['Full Manage', 'full'], users: ['Full Control', 'full'], studio: ['Full Access', 'full'] },
  },
  {
    role: 'PM (Project Manager)',
    roleClass: 'text-purple-600 dark:text-purple-400',
    cells: { projects: ['Full Manage', 'full'], clients: ['View & Edit', 'full'], users: ['View Only', 'none'], studio: ['Generate & Edit', 'full'] },
  },
  {
    role: 'DEV (Developer)',
    roleClass: 'text-cyan-600 dark:text-cyan-400',
    cells: { projects: ['Manage Tasks', 'full'], clients: ['View Client Info', 'partial'], users: ['No Access', 'none'], studio: ['View Only', 'partial'] },
  },
  {
    role: 'DESIGNER',
    roleClass: 'text-amber-600 dark:text-amber-400',
    cells: { projects: ['Manage UI Tasks', 'full'], clients: ['No Access', 'none'], users: ['No Access', 'none'], studio: ['No Access', 'none'] },
  },
];

// Render one permission cell with its access-level colour
const accessCell = (key: string) => (row: RbacRow) => {
  const [label, level] = row.cells[key];
  return <span className={`font-mono text-[11px] ${ACCESS_CLASS[level]}`}>{label}</span>;
};

const RBAC_COLUMNS = [
  {
    key: 'role',
    header: 'Role',
    className: 'w-[200px]',
    render: (row: RbacRow) => <span className={`font-mono text-[11px] font-bold ${row.roleClass}`}>{row.role}</span>,
  },
  { key: 'projects', header: 'Projects & Tasks', render: accessCell('projects') },
  { key: 'clients', header: 'Clients & Billing', render: accessCell('clients') },
  { key: 'users', header: 'User Management', render: accessCell('users') },
  { key: 'studio', header: 'Document Studio', render: accessCell('studio') },
];

// Render agency engineering and operations team roster page
export const AgencyTeamPage: React.FC = () => {
  const { users, tasks, inviteUser } = useData();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [invitingEmail, setInvitingEmail] = useState<string | null>(null);

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Dispatch team invitation email to the selected member
  const handleSendInvite = async (email: string) => {
    setInvitingEmail(email);
    try {
      await inviteUser(email);
    } finally {
      setInvitingEmail(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
            Agency Engineering & Ops Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Specialist roster, RBAC permissions, task workload distribution, and billing rates.
          </p>
        </div>

        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {safeUsers.map(member => {
          const memberTasks = safeTasks.filter(t => t.assignee_id === member.id && t.status !== 'DONE');
          const completedTasks = safeTasks.filter(t => t.assignee_id === member.id && t.status === 'DONE');

          return (
            <div
              key={member.id || member.email}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {member.avatar || member.avatar_url ? (
                      <img
                        src={member.avatar || member.avatar_url}
                        alt={member.full_name || member.name || 'Member'}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-800 group-hover:ring-cyan-500/50 transition-all"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-sm ring-2 ring-slate-200 dark:ring-slate-800">
                        {member.full_name ? member.full_name.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {member.full_name || member.name}
                      </h3>
                      {member.department && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {member.department}
                        </p>
                      )}
                    </div>
                  </div>
                  {member.role && <RoleBadge role={member.role} />}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-mono">
                  {member.email && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-500 dark:text-slate-400">{member.email}</span>
                      </div>
                      <button
                        type="button"
                        disabled={invitingEmail === member.email}
                        onClick={() => handleSendInvite(member.email)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                        title="Send invitation & temporary password email"
                      >
                        <Send className="w-3 h-3" />
                        <span>{invitingEmail === member.email ? 'Sending...' : 'Invite'}</span>
                      </button>
                    </div>
                  )}

                  {member.hourly_rate !== undefined && (
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Hourly Billing:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">৳{member.hourly_rate} / hr</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <KanbanSquare className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">{memberTasks.length}</strong> active tasks
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completedTasks.length} done</span>
                </div>
              </div>
            </div>
          );
        })}

        {safeUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
            No team members available.
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
            Role-Based Access Control (RBAC) Matrix
          </h3>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <TableV2 columns={RBAC_COLUMNS} rows={RBAC_ROWS} getRowId={(row: RbacRow) => row.role} minWidth="min-w-[720px]" />
        </div>
      </div>

      <CreateTeamMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
    </div>
  );
};

export default AgencyTeamPage;
