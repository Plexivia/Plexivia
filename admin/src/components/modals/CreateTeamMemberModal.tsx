import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { UserRole, UserStatus } from '../../types';
import { UserPlus, Mail, UserCheck, DollarSign, Briefcase } from 'lucide-react';

interface CreateTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

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
      });

      onClose();
      // Reset
      setFullName('');
      setEmail('');
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
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Role *
              </label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="PM">Project Manager</option>
                <option value="DEV">Fullstack Developer</option>
                <option value="DESIGNER">UI/UX Designer</option>
                <option value="SRE">SRE & DevOps Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Internal Hourly Rate ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={0}
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Adding Member...' : 'Authorize Team Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
