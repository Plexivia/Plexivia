import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Search,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  DollarSign,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useClientOptions, clientToStudioFields } from '@/features/document-studio/components/common/useStudioLookups';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Export 1: ExistingClientSelector
 * Picks a client from this dashboard's own Clients directory and autofills the
 * document form. Searchable, because the list grows with every onboarding.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function ExistingClientSelector({
  onSelectClient,
  selectedClientDid = '',
  isLocked = false,
  lockedClient = null,
  className = '',
}) {
  const clientOptions = useClientOptions();
  const [selectedDid, setSelectedDid] = useState(selectedClientDid || '');

  useEffect(() => {
    setSelectedDid(selectedClientDid || '');
  }, [selectedClientDid]);

  const handleSelect = (value, option) => {
    setSelectedDid(value);
    if (!value || !option?.client) return;

    const fields = clientToStudioFields(option.client);
    if (onSelectClient) {
      onSelectClient({
        did: fields.clientId,
        clientId: fields.clientId,
        // Kept for the forms that still read the case-file field names
        caseDid: fields.clientId,
        caseNumber: fields.clientKey,
        name: fields.clientName,
        contactPerson: fields.contactPerson || fields.clientName,
        phone: fields.phone,
        email: fields.email,
        address: fields.address,
        rawClient: option.client,
      });
    }

    toast.info(`Autofilled details for ${fields.clientName}`);
  };

  if (isLocked && lockedClient) {
    const displayName = lockedClient.name || lockedClient.fullName || lockedClient.applicantName || 'Linked Client';
    const displayCase = lockedClient.caseNumber || lockedClient.caseRef || '';
    return (
      <div className={`p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-3 text-xs ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Lock className="size-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
              Linked Client Dossier (Locked)
            </span>
            <p className="font-bold text-foreground text-xs truncate">
              {displayName} {displayCase ? `• #${displayCase}` : ''}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">
          Verified Dossier
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 bg-muted/30 border border-border rounded-xl space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Select Client
        </label>
        <span className="text-[10px] text-muted-foreground font-medium">Autofills all client inputs</span>
      </div>

      <SearchableSelect
        options={clientOptions}
        value={selectedDid}
        onChange={handleSelect}
        disabled={isLocked}
        placeholder="Search and choose a client"
        searchPlaceholder="Search by client, business, phone or email…"
        emptyMessage="No clients found. Onboard one from the Clients page."
        renderLeading={() => <User className="size-3.5 shrink-0 text-muted-foreground" />}
      />
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Export 2: LineItemsManager
 * Standardized line items table component with quantities, unit prices,
 * auto line-totals, VAT rate, and grand total calculations.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function LineItemsManager({
  items = [],
  onItemsChange,
  taxRate = 0,
  onTaxRateChange = null,
  currency = 'BDT',
  isLocked = false,
  className = '',
}) {
  const handleAddItem = () => {
    if (isLocked) return;
    const newId = `item-${Date.now()}`;
    const next = [
      ...items,
      { id: newId, title: '', description: '', quantity: 1, unitPrice: '' },
    ];
    if (onItemsChange) onItemsChange(next);
  };

  const handleRemoveItem = (id) => {
    if (isLocked || items.length <= 1) return;
    const next = items.filter((it) => it.id !== id);
    if (onItemsChange) onItemsChange(next);
  };

  const handleItemChange = (id, field, value) => {
    if (isLocked) return;
    const next = items.map((it) => (it.id === id ? { ...it, [field]: value } : it));
    if (onItemsChange) onItemsChange(next);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 1;
    const price = parseFloat(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const numTaxRate = parseFloat(taxRate) || 0;
  const taxAmount = (subtotal * numTaxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-1.5 border-b border-black/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-black/80 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Invoice Line Items &amp; Charges ({items.length})
        </h3>
        {!isLocked && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddItem}
            className="h-7 text-xs font-bold px-2.5 border-black/15 text-black hover:bg-black/5 gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const qty = parseFloat(item.quantity) || 1;
          const price = parseFloat(item.unitPrice) || 0;
          const lineTotal = qty * price;

          return (
            <div
              key={item.id || idx}
              className="p-3 bg-black/[0.02] border border-black/10 rounded-xl space-y-2 text-xs transition-all hover:border-black/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-black flex items-center gap-1.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-[10px]">
                    {idx + 1}
                  </span>
                  Item #{idx + 1}
                </span>
                {!isLocked && items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    placeholder="Service Title (e.g. Saudi Visa Processing Charge) *"
                    value={item.title || ''}
                    disabled={isLocked}
                    onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-black/15 rounded-lg text-black font-semibold focus:outline-none focus:border-primary disabled:opacity-60"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity ?? 1}
                    disabled={isLocked}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/15 rounded-lg text-black text-center focus:outline-none focus:border-primary font-mono disabled:opacity-60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Price (BDT) *"
                    value={item.unitPrice ?? ''}
                    disabled={isLocked}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-black/15 rounded-lg text-black text-right focus:outline-none focus:border-primary font-mono font-bold disabled:opacity-60"
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-end px-2 font-mono font-black text-black">
                  {currency} {lineTotal.toLocaleString('en-BD')}
                </div>
              </div>

              {/* Optional Description */}
              <div>
                <input
                  type="text"
                  placeholder="Additional Item Description / Scope of Work (optional)"
                  value={item.description || ''}
                  disabled={isLocked}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  className="w-full px-3 py-1 text-[11px] bg-white border border-black/10 rounded-lg text-black/80 focus:outline-none focus:border-primary disabled:opacity-60"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tax & Totals Bar */}
      <div className="p-4 bg-black/[0.03] border border-black/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-black/60">Subtotal ({items.length} item{items.length > 1 ? 's' : ''}):</span>
            <span className="font-mono font-bold text-black">{currency} {subtotal.toLocaleString('en-BD')}</span>
          </div>

          {onTaxRateChange && (
            <div className="flex items-center gap-2">
              <span className="text-black/60">Tax / VAT Rate:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  disabled={isLocked}
                  onChange={(e) => onTaxRateChange(e.target.value)}
                  className="w-16 px-2 py-0.5 text-xs bg-white border border-black/15 rounded text-center font-mono font-bold focus:outline-none focus:border-primary disabled:opacity-60"
                />
                <span className="text-black/60">%</span>
              </div>
              {taxAmount > 0 && (
                <span className="font-mono text-black font-semibold">
                  (+{currency} {taxAmount.toLocaleString('en-BD')})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-black/60 block">
            Grand Total
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-primary">
            {currency} {grandTotal.toLocaleString('en-BD')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default {
  ExistingClientSelector,
  LineItemsManager,
};
