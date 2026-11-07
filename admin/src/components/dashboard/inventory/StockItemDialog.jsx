import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UNIT_OPTIONS } from '@/services/inventoryApi';

// Capitalizes the first letter of every word, leaving the rest as typed (KN95 stays KN95)
const titleCase = (v) => v.replace(/(^|\s)(\S)/g, (m, sp, ch) => sp + ch.toUpperCase());

const EMPTY = { shortName: '', name: '', unit: 'pcs', reorderLevel: 0, notes: '', isActive: true, packs: [{ label: 'Packet', unitsPerPack: 10 }], openingQuantity: 0, openingCost: 0 };

// Form state for an item: unknown units fall back to pcs so a bad old value can be fixed with one save
const toForm = (item) =>
  item
    ? { ...EMPTY, ...item, unit: UNIT_OPTIONS.some((u) => u.value === item.unit) ? item.unit : 'pcs', packs: item.packs?.length ? item.packs : [] }
    : { ...EMPTY };

// Add / edit dialog for one stock item and its pack sizes; onSave gets the API body
export const StockItemDialog = ({ open, onOpenChange, item, onSave, saving }) => {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(toForm(item));
  }, [open, item]);

  // Updates one field
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  // Updates one pack size row
  const setPack = (i, k, v) => setForm((f) => ({ ...f, packs: f.packs.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)) }));

  // Builds the API body; opening stock only applies to a new item
  const submit = (e) => {
    e.preventDefault();
    const body = {
      shortName: form.shortName,
      name: form.name,
      unit: form.unit,
      reorderLevel: Number(form.reorderLevel) || 0,
      notes: form.notes,
      isActive: form.isActive,
      packs: form.packs.map((p) => ({ label: p.label, unitsPerPack: Number(p.unitsPerPack) })),
    };
    if (!item) {
      body.openingQuantity = Number(form.openingQuantity) || 0;
      body.openingCost = Number(form.openingCost) || 0;
    }
    onSave(body);
  };

  const unit = form.unit || 'pcs';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{item ? `Edit ${item.shortName}` : 'New stock item'}</DialogTitle>
            <DialogDescription>
              Stock is counted in single {unit}. Pack sizes say how many {unit} one packet / box adds. Prices come from purchases.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Short name *</label>
              <Input value={form.shortName} onChange={(e) => set('shortName', e.target.value.toUpperCase())} placeholder="MO" maxLength={40} required className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Counted in</label>
              <Select value={form.unit} onValueChange={(v) => set('unit', v)} items={UNIT_OPTIONS}>
                <SelectTrigger className="w-full text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{UNIT_OPTIONS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold">Full name</label>
              <Input value={form.name} onChange={(e) => set('name', titleCase(e.target.value))} placeholder="Medicated Oil 10ml" className="text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Pack sizes</label>
              <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setForm((f) => ({ ...f, packs: [...f.packs, { label: '', unitsPerPack: '' }] }))}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add size
              </Button>
            </div>
            {form.packs.length === 0 && <p className="text-xs text-muted-foreground">No pack sizes: purchases are entered in single {unit}.</p>}
            {form.packs.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">1</span>
                <Input className="flex-1 text-xs" value={p.label} onChange={(e) => setPack(i, 'label', e.target.value)} placeholder="Packet / Box / Carton" />
                <span className="text-xs text-muted-foreground">=</span>
                <Input className="w-20 text-xs" type="number" min={1} step={1} value={p.unitsPerPack} onChange={(e) => setPack(i, 'unitsPerPack', e.target.value)} />
                <span className="w-10 text-xs text-muted-foreground">{unit}</span>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setForm((f) => ({ ...f, packs: f.packs.filter((_, idx) => idx !== i) }))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Warn when stock is at or below ({unit})</label>
              <Input type="number" min={0} value={form.reorderLevel} onChange={(e) => set('reorderLevel', e.target.value)} className="text-xs" />
            </div>
            {item ? (
              <div className="flex items-end gap-2 pb-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
                <span className="text-xs">Active (offered in purchases)</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Already in hand ({unit})</label>
                <Input type="number" min={0} value={form.openingQuantity} onChange={(e) => set('openingQuantity', e.target.value)} className="text-xs" />
              </div>
            )}
            {!item && Number(form.openingQuantity) > 0 && (
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold">Cost per {unit} of that stock (optional)</label>
                <Input type="number" min={0} step="any" value={form.openingCost} onChange={(e) => set('openingCost', e.target.value)} className="text-xs" />
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold">Notes</label>
              <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="text-xs" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
