import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '../../context/ToastContext';

export type ProfileSection = 'profile' | 'address';

interface EditProfileModalProps {
  section: ProfileSection | null;
  onClose: () => void;
}

const LABEL_CLASS = 'block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5';
const INPUT_CLASS =
  'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-2xs';

// Render modal for the signed-in user to edit their own profile or address details
export const EditProfileModal: React.FC<EditProfileModalProps> = ({ section, onClose }) => {
  const { user, updateProfile } = useAuthStore();
  const { showToast } = useToast();
  const u = (user || {}) as Record<string, any>;
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Load current values whenever a section is opened
  useEffect(() => {
    if (!section) return;
    setValues({
      name: u.fullName || u.name || '',
      phone: u.phone || '',
      designation: u.designation || '',
      country: u.country || '',
      city: u.city || '',
      postalCode: u.postalCode || '',
      address: u.address || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [key]: e.target.value }));

  // Save only the fields shown in the open section
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keys = section === 'profile' ? ['name', 'phone', 'designation'] : ['country', 'city', 'postalCode', 'address'];
    if (section === 'profile' && !values.name?.trim()) return;

    setLoading(true);
    try {
      await updateProfile(Object.fromEntries(keys.map((k) => [k, (values[k] || '').trim()])));
      showToast('success', 'Profile Updated', 'Your changes have been saved.');
      onClose();
    } catch (err: any) {
      showToast('error', 'Update Failed', err?.response?.data?.message || err?.message || 'Could not save your changes.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      <input value={values[key] || ''} onChange={set(key)} className={INPUT_CLASS} {...props} />
    </div>
  );

  return (
    <Modal
      isOpen={!!section}
      onClose={onClose}
      title={section === 'address' ? 'Edit Address' : 'Edit Profile'}
      subtitle={section === 'address' ? 'Update your location details' : 'Update your personal details'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section === 'profile' && (
            <>
              {field('name', 'Full Name *', { required: true })}
              {field('phone', 'Phone', { type: 'tel', placeholder: '+880 1700-000000' })}
              {field('designation', 'Designation')}
            </>
          )}
          {section === 'address' && (
            <>
              {field('country', 'Country')}
              {field('city', 'City / State')}
              {field('postalCode', 'Postal Code')}
              {field('address', 'Address')}
            </>
          )}
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

export default EditProfileModal;
