import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import type { User } from '../../types';

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
}

const ROLE_OPTIONS = ['SUPER_ADMIN', 'PM', 'DEV', 'DESIGNER', 'SRE'];

const LABEL_CLASS = 'block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5';
const INPUT_CLASS =
  'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-2xs';

// Render modal to view and edit a team member's profile details
export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose }) => {
  const { updateUser } = useData();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name || user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setRole(user?.role || '');
    setDepartment(user?.department || '');
    setDesignation(user?.designation || '');
  }, [user]);

  // Save the edited profile fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim() || !email.trim()) return;

    setLoading(true);
    try {
      await updateUser(
        user.dId || user.email || user.id,
        {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role,
          department: department.trim(),
          designation: designation.trim(),
        },
        `${fullName.trim()} updated.`
      );
      onClose();
    } catch {
      // Toast already shown by the data context
    } finally {
      setLoading(false);
    }
  };

  const roles = role && !ROLE_OPTIONS.includes(role) ? [role, ...ROLE_OPTIONS] : ROLE_OPTIONS;

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Member Profile"
      subtitle="View and edit this team member's details"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Member Name *</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Email *</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Phone / WhatsApp</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1700-000000" className={`${INPUT_CLASS} font-mono`} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={`${INPUT_CLASS} font-mono`}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Department</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Designation</label>
            <input value={designation} onChange={(e) => setDesignation(e.target.value)} className={INPUT_CLASS} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
