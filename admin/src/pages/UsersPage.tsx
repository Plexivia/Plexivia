import { HeaderTitle } from '@/components/common/HeaderTitle';
import { MemberTable } from '@/components/common/MemberTable';
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { RoleBadge } from '../components/common/Badge';
import { CreateTeamMemberModal } from '../components/modals/CreateTeamMemberModal';
import {
  UserPlus,
  Mail,
  Send,
  Search,
  Users,
  ShieldCheck,
  Building,
  CheckCircle2,
  Briefcase,
  User as UserIcon
} from 'lucide-react';

// Render user management page with roster filters and creation modal
export const UsersPage: React.FC = () => {
  const { users, tasks, inviteUser, refreshAll } = useData();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [invitingEmail, setInvitingEmail] = useState<string | null>(null);

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Dispatch team invitation email to the selected user
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
        title="User Management"
        onRefresh={refreshAll}
        actions={
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/30 transition-all cursor-pointer "
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {safeUsers.length}
          </div>
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium">
            <span>Active Users</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
            {safeUsers.filter((u) => u.status !== 'INACTIVE').length}
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-mono font-medium">
            <span>Departments</span>
            <Building className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-800 dark:text-purple-300">
            {new Set(safeUsers.map((u) => u.department).filter(Boolean)).size}
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-mono font-medium">
            <span>Active Roles</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300">
            {new Set(safeUsers.map((u) => u.role).filter(Boolean)).size}
          </div>
        </div>
      </div>

      <MemberTable
        members={safeUsers}
        tasks={safeTasks}
        invitingEmail={invitingEmail}
        onInvite={handleSendInvite}
        exportFilename="users"
        emptyTitle="No users available"
      />

      <CreateTeamMemberModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
