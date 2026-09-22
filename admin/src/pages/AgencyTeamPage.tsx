import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RoleBadge } from '../components/common/Badge';
import { CreateTeamMemberModal } from '../components/modals/CreateTeamMemberModal';
import {
  UserPlus,
  Mail,
  KanbanSquare,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const AgencyTeamPage: React.FC = () => {
  const { users, tasks } = useData();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
            Agency Engineering & Ops Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Specialist roster, RBAC permissions, task workload distribution, and billing rates.
          </p>
        </div>

        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/50 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {safeUsers.map(member => {
          const memberTasks = safeTasks.filter(t => t.assignee_id === member.id && t.status !== 'DONE');
          const completedTasks = safeTasks.filter(t => t.assignee_id === member.id && t.status === 'DONE');

          return (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Avatar & Role Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.full_name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800 group-hover:ring-cyan-500/50 transition-all"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {member.full_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {member.department}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={member.role} />
                </div>

                {/* Email & Details */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80 font-mono">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-400">{member.email}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Hourly Billing:</span>
                    <strong className="text-white font-mono">${member.hourly_rate} / hr</strong>
                  </div>
                </div>
              </div>

              {/* Workload Status */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <KanbanSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300">
                    <strong className="text-white">{memberTasks.length}</strong> active tasks
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completedTasks.length} done</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Role-Based Access Control (RBAC) Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Role</th>
                <th className="p-3">Projects & Kanban</th>
                <th className="p-3">Clients & Billing</th>
                <th className="p-3">VPS Fleet & SSH</th>
                <th className="p-3">Cloudflare R2 Backups</th>
                <th className="p-3">Telemetry & SRE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="p-3 font-bold text-rose-400">SUPER_ADMIN</td>
                <td className="p-3 text-emerald-400">Full Read/Write</td>
                <td className="p-3 text-emerald-400">Full Manage</td>
                <td className="p-3 text-emerald-400">Root SSH Access</td>
                <td className="p-3 text-emerald-400">Trigger / Restore</td>
                <td className="p-3 text-emerald-400">Full Telemetry</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-purple-400">PM (Project Manager)</td>
                <td className="p-3 text-emerald-400">Full Manage</td>
                <td className="p-3 text-emerald-400">View & Edit</td>
                <td className="p-3 text-slate-500">No Access</td>
                <td className="p-3 text-slate-400">View Status</td>
                <td className="p-3 text-slate-400">Service Health</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-cyan-400">DEV (Developer)</td>
                <td className="p-3 text-emerald-400">Manage Tasks</td>
                <td className="p-3 text-slate-400">View Client Info</td>
                <td className="p-3 text-slate-400">Read Logs Only</td>
                <td className="p-3 text-slate-500">No Access</td>
                <td className="p-3 text-slate-400">Container Metrics</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-400">DESIGNER</td>
                <td className="p-3 text-emerald-400">Manage UI Tasks</td>
                <td className="p-3 text-slate-500">No Access</td>
                <td className="p-3 text-slate-500">No Access</td>
                <td className="p-3 text-slate-500">No Access</td>
                <td className="p-3 text-slate-500">No Access</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-400">SRE / DEVOPS</td>
                <td className="p-3 text-slate-400">Infra Tasks</td>
                <td className="p-3 text-slate-500">No Access</td>
                <td className="p-3 text-emerald-400">Root SSH Access</td>
                <td className="p-3 text-emerald-400">Trigger / Restore</td>
                <td className="p-3 text-emerald-400">Full Telemetry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      <CreateTeamMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
    </div>
  );
};
