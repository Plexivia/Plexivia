import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { UserRole, UserStatus } from '../../types';
import { UserPlus, Mail, UserCheck, Briefcase, KeyRound, BellRing } from 'lucide-react';
import * as SwitchUi from '@/components/ui/switch';

// The JSX switch carries no prop types, so treat it as a loosely typed component
const Switch = SwitchUi.Switch as React.FC<any>;

interface CreateTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Render modal for adding and authorizing a new agency team member
export const CreateTeamMemberModal: React.FC<CreateTeamMemberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createUser } = useData();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('DEV');
  const [department, setDepartment] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | string>('');
  const [avatar] = useState('');
  const [password, setPassword] = useState('');
  const [receiveMail, setReceiveMail] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update role and default department mapping
  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    switch (selectedRole) {
      case 'SUPER_ADMIN':
        setDepartment('Executive Engineering');
        break;
      case 'PM':
        setDepartment('Product Delivery');
        break;
      case 'DEV':
        setDepartment('Fullstack Engineering');
        break;
      case 'DESIGNER':
        setDepartment('UI/UX Design');
        break;
      case 'SRE':
        setDepartment('Platform Reliability');
        break;
    }
  };

  // Validate and submit new team member creation request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setLoading(true);
    try {
      await createUser({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        department,
        avatar:
          avatar ||
          ('https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(fullName)),
        status: 'ACTIVE' as UserStatus,
        hourly_rate: Number(hourlyRate) || 100,
        receive_email_notifications: receiveMail,
        ...(password.trim() ? { password: password.trim() } : {}),
      } as any);

      onClose();
      setFullName('');
      setEmail('');
      setPassword('');
      setReceiveMail(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Agency Team Member"
      subtitle="Provision agency credentials, assign engineering role, and allocate tasks"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => {
                  setFullName(e.target.value);
                  if (!email) {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z]/g, '.');
                    if (slug) setEmail(slug + '@plexivia.com');
                  }
                }}
                placeholder="e.g. David Zhao"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Agency Login Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="david.z@plexivia.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Role *
              </label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="PM">Project Manager</option>
                <option value="DEV">Fullstack Developer</option>
                <option value="DESIGNER">UI/UX Designer</option>
                <option value="SRE">SRE & DevOps Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Internal Hourly Rate (৳ BDT)
            </label>
            <div className="relative">
              <span className="text-sm font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono">৳</span>
              <input
                type="number"
                min={0}
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password <span className="normal-case font-normal text-slate-400">(optional — auto-generated if empty)</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950 cursor-pointer">
            <span className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-sky-500" />
              <span>
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Get Mail</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Receive system and alert notification emails</span>
              </span>
            </span>
            <Switch checked={receiveMail} onCheckedChange={setReceiveMail} />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Adding Member...' : 'Authorize Team Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
