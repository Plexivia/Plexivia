import { HeaderTitle } from '@/components/common/HeaderTitle';
import { MemberTable } from '@/components/common/MemberTable';
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RoleBadge } from '../components/common/Badge';
import { CreateTeamMemberModal } from '../components/modals/CreateTeamMemberModal';
import {
  UserPlus,
  Users,
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
  const { users, tasks, inviteUser, refreshAll } = useData();
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
      <HeaderTitle
        icon={Users}
        title="Agency Engineering & Ops Team"
        onRefresh={refreshAll}
        actions={
        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/30 transition-all  cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
        }
      />

      <MemberTable
        members={safeUsers}
        tasks={safeTasks}
        invitingEmail={invitingEmail}
        onInvite={handleSendInvite}
        exportFilename="team"
        emptyTitle="No team members available"
      />

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
