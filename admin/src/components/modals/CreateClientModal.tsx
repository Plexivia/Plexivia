import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Client, ClientStatus } from '../../types';
import { Building2, Globe, Mail, Phone, MessageCircle, User, KeyRound, Copy, Check, ShieldOff } from 'lucide-react';
import { clientSupportKeyApi, apiErrorMessage } from '../../services/supportApi';
import { toast } from 'sonner';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  readOnly?: boolean;
}

// Render modal for onboarding a new enterprise client, or editing an existing one
export const CreateClientModal: React.FC<CreateClientModalProps> = ({ isOpen, onClose, client = null, readOnly = false }) => {
  const { createClient, updateClient } = useData();
  const isEdit = !!client;
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyBusy, setKeyBusy] = useState(false);
  const [newRawKey, setNewRawKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [keyPrefix, setKeyPrefix] = useState('');

  // Issues a new Support Desk API key for this client; the raw value is shown once, then discarded
  const handleGenerateKey = async () => {
    if (!client) return;
    setKeyBusy(true);
    try {
      const data = await clientSupportKeyApi.generate(client.id || (client as any).dId);
      setNewRawKey(data.key);
      setKeyPrefix(data.prefix);
      setCopied(false);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to generate support key'));
    } finally {
      setKeyBusy(false);
    }
  };

  // Revokes the client's support key; their dashboard can't reach the ticket API again until a new one is issued
  const handleRevokeKey = async () => {
    if (!client) return;
    setKeyBusy(true);
    try {
      await clientSupportKeyApi.revoke(client.id || (client as any).dId);
      setNewRawKey('');
      setKeyPrefix('');
      toast.success('Support API key revoked');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to revoke support key'));
    } finally {
      setKeyBusy(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fill the form from the client being edited, or reset it for a new client
  useEffect(() => {
    if (!isOpen) return;
    setClientName(client?.client_name || '');
    setBusinessName(client?.business_name || '');
    setClientKey(client?.client_key || '');
    setPrimaryDomain(client?.primary_domain || '');
    setContactEmail(client?.contact_email || '');
    setContactPhone(client?.contact_phone || '');
    setContactWhatsapp(client?.contact_whatsapp || '');
    setNewRawKey('');
    setKeyPrefix(client?.support_key_prefix || '');
  }, [isOpen, client]);

  // Auto-generate client slug from business name
  const handleNameChange = (name: string) => {
    setBusinessName(name);
    if (!clientKey && !isEdit) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 16);
      if (slug) {
        setClientKey(slug);
      }
    }
  };

  // Validate and submit new client onboarding payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !clientName.trim() || !businessName.trim() || !clientKey.trim() || !contactEmail.trim() || !contactPhone.trim()) return;

    setLoading(true);
    try {
      const payload = {
        client_name: clientName.trim(),
        business_name: businessName.trim(),
        client_key: clientKey.trim().toLowerCase(),
        primary_domain: primaryDomain.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        contact_whatsapp: contactWhatsapp.trim(),
      };
      if (client) {
        await updateClient(client.id, payload);
      } else {
        await createClient({ ...payload, status: 'ACTIVE' as ClientStatus });
      }

      onClose();
      setClientName('');
      setBusinessName('');
      setClientKey('');
      setPrimaryDomain('');
      setContactEmail('');
      setContactPhone('');
      setContactWhatsapp('');
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
      title={readOnly ? 'Client Details' : isEdit ? 'Edit Client' : 'Onboard New Enterprise Client'}
      subtitle={readOnly ? 'Business, domain, and contact details' : isEdit ? 'Update business, domain, and contact details' : 'Register a new client with business, domain, and contact details'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={readOnly} className="min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Client Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g. Rahim Uddin"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Client Identifier Slug *
            </label>
            <input
              type="text"
              required
              value={clientKey}
              onChange={e => setClientKey(e.target.value.toLowerCase())}
              placeholder="e.g. acme"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Primary Domain Name (Optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={primaryDomain}
                onChange={e => setPrimaryDomain(e.target.value)}
                placeholder="e.g. acme.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contact Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+880 1700-000000"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              WhatsApp Number (Optional)
            </label>
            <div className="relative">
              <MessageCircle className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={contactWhatsapp}
                onChange={e => setContactWhatsapp(e.target.value)}
                placeholder="+880 1700-000000"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono shadow-2xs"
              />
            </div>
          </div>
        </div>
        </fieldset>

        {isEdit && !readOnly && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Support Desk Access</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              This key lets {businessName || 'this client'}&apos;s own dashboard submit and read its own support tickets. Give it to their developer to store
              server-side — never ship it in client-side JS.
            </p>

            {newRawKey ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                  <code className="flex-1 min-w-0 truncate text-[11px] font-mono text-amber-700 dark:text-amber-400">{newRawKey}</code>
                  <button type="button" onClick={handleCopyKey} className="shrink-0 p-1 text-amber-600 hover:text-amber-500 cursor-pointer" title="Copy">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Copy this now — it will not be shown again.</p>
              </div>
            ) : keyPrefix ? (
              <p className="text-[11px] font-mono text-slate-500">Active key: ••••••••{keyPrefix}••••••••</p>
            ) : (
              <p className="text-[11px] text-slate-500">No support key issued yet.</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={keyBusy}
                onClick={handleGenerateKey}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-md cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" /> {keyPrefix || newRawKey ? 'Regenerate Key' : 'Generate Key'}
              </button>
              {(keyPrefix || newRawKey) && (
                <button
                  type="button"
                  disabled={keyBusy}
                  onClick={handleRevokeKey}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-md cursor-pointer disabled:opacity-50"
                >
                  <ShieldOff className="w-3.5 h-3.5" /> Revoke
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && (
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            {loading ? (isEdit ? 'Saving...' : 'Registering Client...') : isEdit ? 'Save Changes' : 'Enroll & Initialize Client'}
          </button>
          )}
        </div>
      </form>
    </Modal>
  );
};
