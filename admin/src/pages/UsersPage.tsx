import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { RoleBadge } from '../components/common/Badge';
import { CreateTeamMemberModal } from '../components/modals/CreateTeamMemberModal';
import {
  UserPlus,
  Mail,
  Search,
  Users,
  ShieldCheck,
  Building,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, tasks } = useData();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredUsers = useMemo(() => {
    return safeUsers.filter((u) => {
      const matchSearch =
        (u.full_name || u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.department || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [safeUsers, searchQuery, roleFilter]);

  const allRoles = useMemo(() => {
    const set = new Set<string>();
    safeUsers.forEach((u) => {
      if (u.role) set.add(u.role);
    });
    return Array.from(set);
  }, [safeUsers]);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              User Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage system users, access credentials, department allocation, and roles.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Quick Stats */}
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
            {new Set(safeUsers.map((u) => u.department).filter(Boolean)).size || 1}
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-mono font-medium">
            <span>Active Roles</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300">
            {allRoles.length || 1}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition shrink-0 cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60'
            }`}
          >
            All Roles ({safeUsers.length})
          </button>
          {allRoles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition shrink-0 cursor-pointer ${
                roleFilter === r
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              {r} ({safeUsers.filter((u) => u.role === r).length})
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((u) => {
          const userActiveTasks = safeTasks.filter(
            (t) => t.assignee_id === u.id && t.status !== 'DONE'
          );
          const userDoneTasks = safeTasks.filter(
            (t) => t.assignee_id === u.id && t.status === 'DONE'
          );

          return (
            <div
              key={u.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatar ||
                        u.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`
                      }
                      alt={u.full_name || u.name || 'User'}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-800 group-hover:ring-cyan-500/50 transition-all"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {u.full_name || u.name || 'User'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {u.department || 'Operations'}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={u.role} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-mono">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-500 dark:text-slate-400">
                      {u.email || 'No email provided'}
                    </span>
                  </div>

                  {u.hourly_rate !== undefined && (
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Billing Rate:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        ${u.hourly_rate} / hr
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white">{userActiveTasks.length}</strong> active tasks
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{userDoneTasks.length} done</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-mono text-xs">
            No users match your filter or search query.
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <CreateTeamMemberModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
