import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { ClientType, ClientStatus } from '../../types';
import { Building2, Globe, Mail, Phone, DollarSign, Database } from 'lucide-react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({ isOpen, onClose }) => {
  const { createClient } = useData();
  const [businessName, setBusinessName] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [clientType, setClientType] = useState<ClientType>('MULTI_TENANT_ECOMMERCE');
  const [databaseShared, setDatabaseShared] = useState<boolean>(true);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [monthlyRetainer, setMonthlyRetainer] = useState<number | string>('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (name: string) => {
    setBusinessName(name);
    if (!clientKey) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 16);
      if (slug) {
        setClientKey(slug);
        if (!primaryDomain) setPrimaryDomain(slug + '.com');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !clientKey.trim() || !contactEmail.trim()) return;

    setLoading(true);
    try {
      await createClient({
        business_name: businessName.trim(),
        client_key: clientKey.trim().toLowerCase(),
        primary_domain: primaryDomain.trim() || (clientKey.toLowerCase() + '.com'),
        client_type: clientType,
        database_shared: clientType === 'MULTI_TENANT_ECOMMERCE' ? databaseShared : false,
        status: 'ACTIVE' as ClientStatus,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        monthly_retainer: Number(monthlyRetainer) || 0,
      });

      onClose();
      // Reset
      setBusinessName('');
      setClientKey('');
      setPrimaryDomain('');
      setContactEmail('');
      setContactPhone('');
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
      title="Onboard New Enterprise Client"
      subtitle="Register a new client entity, domain mapping, and tenant architecture profile"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Business Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={businessName}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Client Slug / Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Client Identifier Slug *
            </label>
            <input
              type="text"
              required
              value={clientKey}
              onChange={e => setClientKey(e.target.value.toLowerCase())}
              placeholder="e.g. acme"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Primary Domain */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Primary Ingress Domain *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={primaryDomain}
                onChange={e => setPrimaryDomain(e.target.value)}
                placeholder="e.g. acme.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Tenant Architecture Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tenant Architecture Type *
            </label>
            <select
              value={clientType}
              onChange={e => setClientType(e.target.value as ClientType)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="MULTI_TENANT_ECOMMERCE">Multi-Tenant eCommerce</option>
              <option value="SINGLE_TENANT">Dedicated Single-Tenant</option>
            </select>
          </div>

          {/* Shared Database Toggle (for multi-tenant) */}
          {clientType === 'MULTI_TENANT_ECOMMERCE' && (
            <div className="md:col-span-2 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Shared PostgreSQL Fleet Database
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Route queries via dynamic Postgres search_path and tenant schema partition
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDatabaseShared(!databaseShared)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
                  databaseShared ? 'bg-purple-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    databaseShared ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Contact Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Primary Contact Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="billing@client.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Monthly Retainer */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Monthly Retainer ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={0}
                step={100}
                value={monthlyRetainer}
                onChange={e => setMonthlyRetainer(Number(e.target.value))}
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
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            {loading ? 'Registering Client...' : 'Enroll & Initialize Client'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
