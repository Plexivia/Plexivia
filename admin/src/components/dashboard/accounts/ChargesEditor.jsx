import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateFeeAmount, formatFeeRate } from '@/components/dashboard/accounts/PaymentFeesEditor';

export const EMPTY_CHARGES = { regular: 'none', extras: [] };

const taka = (n) => `৳${(Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Applied charges for the API: the method's chosen regular charge plus every named extra charge
export const buildCharges = (method, value, baseAmount) => {
  const out = [];
  const regular = (method?.fees || []).find((f) => f.name === value?.regular);
  if (regular) out.push({ ...regular, kind: 'regular', amount: calculateFeeAmount(regular, baseAmount) });
  for (const extra of value?.extras || []) {
    const charge = { name: String(extra.name || '').trim(), percent: Number(extra.percent) || 0, fixed: Number(extra.fixed) || 0 };
    if (charge.name && (charge.percent > 0 || charge.fixed > 0)) out.push({ ...charge, kind: 'extra', amount: calculateFeeAmount(charge, baseAmount) });
  }
  return out;
};

// Saved charges -> editor state (the regular one is matched back to the method's fee by name)
export const chargesToEditorValue = (charges) => ({
  regular: (charges || []).find((c) => c.kind === 'regular')?.name || 'none',
  extras: (charges || [])
    .filter((c) => c.kind !== 'regular')
    .map((c) => ({ name: c.name, percent: c.percent ? String(c.percent) : '', fixed: c.fixed ? String(c.fixed) : '' })),
});

/**
 * Regular charge (one of the payment method's fees) plus any number of extra charges.
 * mode 'deduct' (payments: taken out of the received money) or 'add' (bills: added to the cost).
 */
export const ChargesEditor = ({ method, baseAmount, value, onChange, mode = 'deduct' }) => {
  const fees = method?.fees || [];
  const extras = value?.extras || [];
  const charges = buildCharges(method, value, baseAmount);
  const total = Math.round(charges.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;
  const selectedRegular = fees.find((f) => f.name === value?.regular);
  const regularLabel = !method
    ? 'Select a payment method first'
    : selectedRegular
      ? `${selectedRegular.name} (${formatFeeRate(selectedRegular)})`
      : 'No charge';

  const setExtra = (index, field, v) => onChange({ ...value, extras: extras.map((e, i) => (i === index ? { ...e, [field]: v } : e)) });
  const addExtra = () => onChange({ ...value, extras: [...extras, { name: '', percent: '', fixed: '' }] });
  const removeExtra = (index) => onChange({ ...value, extras: extras.filter((_, i) => i !== index) });

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3.5 text-xs">
      <div className="space-y-1.5">
        <label className="font-semibold text-foreground">Regular Charge</label>
        <Select value={value?.regular || 'none'} onValueChange={(v) => onChange({ ...value, regular: v })} disabled={!method}>
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="No charge">{regularLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No charge</SelectItem>
            {fees.map((fee) => (
              <SelectItem key={fee.name} value={fee.name}>
                {fee.name} ({formatFeeRate(fee)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {method && fees.length === 0 && (
          <p className="text-[11px] text-muted-foreground">{method.name} has no regular charges. Add them on the Payment Methods page.</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-foreground">Extra Charges</label>
          <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={addExtra}>
            <Plus className="size-3" /> Add extra charge
          </Button>
        </div>
        {extras.map((extra, index) => (
          <div key={index} className="grid grid-cols-[1fr_80px_80px_auto] gap-2">
            <Input placeholder="Charge name" value={extra.name} onChange={(e) => setExtra(index, 'name', e.target.value)} className="h-8 text-xs" />
            <Input type="number" min="0" step="any" placeholder="%" value={extra.percent} onChange={(e) => setExtra(index, 'percent', e.target.value)} className="h-8 text-xs" />
            <Input type="number" min="0" step="any" placeholder="৳" value={extra.fixed} onChange={(e) => setExtra(index, 'fixed', e.target.value)} className="h-8 text-xs" />
            <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => removeExtra(index)} title="Remove">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {charges.length > 0 && (
        <div className="space-y-1 border-t pt-2 text-[11px]">
          {charges.map((c) => (
            <div key={`${c.kind}-${c.name}`} className="flex justify-between text-muted-foreground">
              <span>
                {c.name} ({formatFeeRate(c)}){c.kind === 'extra' ? ' · extra' : ''}
              </span>
              <span className="tabular-nums">{taka(c.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-foreground">
            <span>{mode === 'deduct' ? 'Total charges (deducted)' : 'Total charges (added)'}</span>
            <span className="tabular-nums">{taka(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
