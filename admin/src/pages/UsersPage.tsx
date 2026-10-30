import { HeaderTitle } from '@/components/common/HeaderTitle';
import { SystemUsersTable } from '@/components/users/SystemUsersTable';
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CreateTeamMemberModal } from '../components/modals/CreateTeamMemberModal';
import { AccessMatrixModal } from '../components/users/AccessMatrixModal';
import { UserPlus, Users, CheckCircle2, UserX, Lock } from 'lucide-react';

// Render team management page with status stats, roster table, access matrix and creation modal
export const UsersPage: React.FC = () => {
  const { users, refreshAll } = useData();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  const safeUsers = Array.isArray(users) ? users : [];
  const activeCount = safeUsers.filter((u) => u.is_active !== false).length;

  return (
    <div className="space-y-6">
      <HeaderTitle
        icon={Users}
        title="Team"
        onRefresh={refreshAll}
        actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAccessOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted/70 text-foreground border border-border text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>User Types &amp; Access</span>
          </button>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/30 transition-all cursor-pointer "
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <span>Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
            {activeCount}
          </div>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-mono font-medium">
            <span>Inactive</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800 dark:text-rose-300">
            {safeUsers.length - activeCount}
          </div>
        </div>
      </div>

      <SystemUsersTable users={safeUsers} />

      <AccessMatrixModal isOpen={isAccessOpen} onClose={() => setIsAccessOpen(false)} />

      <CreateTeamMemberModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
