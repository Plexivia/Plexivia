import React, { useState } from 'react';
import {
  ReceiptText,
  User,
  Phone,
  CreditCard,
  FileText,
  Calendar,
  Clock,
  Printer,
  RefreshCw,
  Eye,
  Save,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { DatePicker } from '@/components/ui/date-picker';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';
import { ExistingClientSelector } from '@/components/common/ClientSelectorAndLineItems';

export function InvoiceForm({ data, onChange, onSubmit, onReset, isSubmitting = false, isLocked = false }) {
  const [detectedMatch, setDetectedMatch] = useState(null);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

  const handleClientChange = (field, value) => {
    onChange((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }));

    if (field === 'phone') {
      triggerLookup(value);
    }
  };

  const handleYes = () => {
    if (!detectedMatch?.client) return;
    const c = detectedMatch.client;
    onChange((prev) => ({
      ...prev,
      clientId: c._id || c.did || prev.clientId,
      clientDid: c.did || c._id || prev.clientDid,
      linkedCaseId: detectedMatch.caseFile?._id || prev.linkedCaseId || null,
      linkedCaseDid: detectedMatch.caseFile?.did || prev.linkedCaseDid || null,
      client: {
        ...prev.client,
        name: c.fullName || c.name || prev.client.name,
        phone: c.phone || c.mobileNumber || prev.client.phone,
        email: c.email || prev.client.email,
        address: c.presentAddress || c.permanentAddress || c.address || prev.client.address,
      },
    }));
    toast.success(`"${c.fullName || c.name}" info auto-filled!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || data.client?.phone || '';
    onChange((prev) => ({
      ...prev,
      client: { ...prev.client, phone: '' },
    }));
    resetLookup(val);
    setPhoneTouched(false);
    toast.info('Please enter a different phone number.');
    setDetectedMatch(null);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const phone = data.client?.phone || '';
    const check = validateBdPhone(phone);
    if (!check.isValid) {
      setPhoneTouched(true);
      toast.error(`Client Phone: ${check.error}`);
      return;
    }
    onSubmit();
  };


  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      title: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    onChange((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleUpdateItem = (id, field, value) => {
    onChange((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveItem = (id) => {
    onChange((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Calculations
  const items = data.items || [];
  const subtotal = items.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 1;
    const price = parseFloat(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);
  const taxRate = parseFloat(data.taxRate) || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">

      {/* Meta Bar: Invoice No, Dates & Payment Status */}
      <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-foreground">Invoice No.</label>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                Auto-generated
              </span>
            </div>
            <input
              type="text"
              value={data.invoiceNo || 'Auto-generated'}
              readOnly
              disabled
              className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl text-muted-foreground font-mono font-bold text-xs cursor-not-allowed select-none outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Issue Date</label>
            <DatePicker
              value={data.issueDate || ''}
              onChange={(val) => onChange({ ...data, issueDate: val })}
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Due Date</label>
            <DatePicker
              value={data.dueDate || ''}
              onChange={(val) => onChange({ ...data, dueDate: val })}
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Payment Status</label>
            <div className="grid grid-cols-3 gap-1 bg-background p-1 rounded-xl border border-border">
              {['Paid', 'Pending', 'Overdue'].map((st) => {
                const isSelected = data.paymentStatus === st;
                let activeStyle = 'bg-emerald-600 text-white font-bold shadow-xs';
                if (st === 'Pending') activeStyle = 'bg-amber-500 text-white font-bold shadow-xs';
                if (st === 'Overdue') activeStyle = 'bg-rose-600 text-white font-bold shadow-xs';

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onChange({ ...data, paymentStatus: st })}
                    className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer text-center ${
                      isSelected
                        ? activeStyle
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Client & Organization Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <User className="w-4 h-4 text-sky-200" />
          <span>1. Billed To (Client &amp; Organization Details)</span>
        </div>

        {/* Existing Client Selector */}
        <ExistingClientSelector
          isLocked={isLocked}
          lockedClient={data.client}
          selectedClientDid={data.caseDid}
          onSelectClient={(clientData) => {
            onChange((prev) => ({
              ...prev,
              caseNumber: clientData.caseNumber || prev.caseNumber,
              caseDid: clientData.caseDid || prev.caseDid,
              client: {
                ...prev.client,
                name: clientData.name || prev.client?.name,
                contactPerson: clientData.contactPerson || prev.client?.contactPerson,
                phone: clientData.phone || prev.client?.phone,
                email: clientData.email || prev.client?.email,
                address: clientData.address || prev.client?.address,
              },
            }));
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Client / Organization Name *</label>
            <input
              type="text"
              required
              disabled={isLocked}
              value={data.client?.name || ''}
              placeholder="Enter recipient / client name"
              onChange={(e) => handleClientChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-semibold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none disabled:opacity-70 disabled:bg-muted/40"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Contact Person (Attn)</label>
            <input
              type="text"
              disabled={isLocked}
              value={data.client?.contactPerson || ''}
              placeholder="Enter designation / company name"
              onChange={(e) => handleClientChange('contactPerson', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-sky-400/40 outline-none disabled:opacity-70 disabled:bg-muted/40"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">
              Phone / Mobile No. <span className="text-rose-500">*</span>
            </label>
            <BdPhoneInput
              value={data.client?.phone || ''}
              required
              disabled={isLocked}
              onBlur={() => setPhoneTouched(true)}
              onChange={(val) => {
                handleClientChange('phone', val);
                if (phoneTouched) setPhoneTouched(true);
              }}
            />
            {((phoneTouched || Boolean(data.client?.phone)) && !validateBdPhone(data.client?.phone || '').isValid) && (
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {validateBdPhone(data.client?.phone || '').error}
              </p>
            )}
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Email Address</label>
            <input
              type="email"
              disabled={isLocked}
              value={data.client?.email || ''}
              placeholder="Enter client email address"
              onChange={(e) => handleClientChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-sky-400/40 outline-none disabled:opacity-70 disabled:bg-muted/40"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-foreground mb-1">Billing Address</label>
            <input
              type="text"
              disabled={isLocked}
              value={data.client?.address || ''}
              placeholder="Enter client billing address"
              onChange={(e) => handleClientChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-sky-400/40 outline-none disabled:opacity-70 disabled:bg-muted/40"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Invoice Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-200" />
            <span>2. Invoice Line Items &amp; Charges</span>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-muted/20 border border-border p-3.5 rounded-xl space-y-2.5 text-xs transition-all hover:border-sky-400/50"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-sky-500/20 text-sky-700 flex items-center justify-center font-mono text-[10px]">
                    {idx + 1}
                  </span>
                  Item #{idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-4">
                  <label className="block font-bold text-foreground text-[11px] mb-1">Item Title *</label>
                  <input
                    type="text"
                    required
                    value={item.title || ''}
                    placeholder="Enter item description"
                    onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-foreground font-semibold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-bold text-foreground text-[11px] mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description || ''}
                    placeholder="Enter item notes / specifications"
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-foreground text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-foreground text-[11px] mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity !== undefined && item.quantity !== null ? item.quantity : 1}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value !== '' ? parseFloat(e.target.value) : 1)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-foreground text-[11px] mb-1">Unit Price (BDT) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={item.unitPrice || ''}
                    placeholder="0"
                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-foreground font-mono font-bold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Tax, Terms & Financial Totals */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <DollarSign className="w-4 h-4 text-sky-200" />
          <span>3. VAT, Payment Terms &amp; Grand Total</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-foreground mb-1">Tax / VAT Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={data.taxRate || ''}
                placeholder="0"
                onChange={(e) => onChange({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Payment Instructions &amp; Notes</label>
              <textarea
                rows={3}
                value={data.paymentTerms || ''}
                placeholder="Enter payment terms & instructions..."
                onChange={(e) => onChange({ ...data, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-sky-400/40 outline-none resize-none"
              />
            </div>
          </div>

          {/* Grand Total Breakdown Card */}
          <div className="bg-muted/30 border border-border p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-mono font-semibold text-foreground">
                  BDT {subtotal.toLocaleString('en-BD')}
                </span>
              </div>

              {taxRate > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>VAT ({taxRate}%):</span>
                  <span className="font-mono font-semibold text-foreground">
                    BDT {taxAmount.toLocaleString('en-BD')}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground block">
                  Grand Total (BDT)
                </span>
                <span className="text-xl font-black text-foreground font-mono">
                  BDT {grandTotal.toLocaleString('en-BD')}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                data.paymentStatus === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                  : data.paymentStatus === 'Pending'
                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-600 border border-rose-500/30'
              }`}>
                {data.paymentStatus || 'Paid'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
        >
          <Eye className="w-4 h-4 text-primary" />
          <span>Preview Invoice</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save & Generate Invoice'}</span>
        </button>
      </div>

      {detectedMatch && (
        <ExistingClientAlertModal
          client={detectedMatch.client}
          caseFile={detectedMatch.caseFile}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}
    </div>
  );
}

export default InvoiceForm;
