import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, PlusCircle, Trash2, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { vendorsApi } from '@/services/purchasesApi';
import { apiErrorMessage } from '@/services/paymentsApi';

const EMPTY = { name: '', phone: '', email: '', address: '', notes: '' };

// Vendors stock is bought from: name and contact used on purchases and receipts
export const VendorsPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);

  // Loads every active vendor
  const load = async () => {
    setLoading(true);
    try {
      setRows(await vendorsApi.list());
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load vendors'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Creates or updates the vendor in the dialog
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { name: form.name, phone: form.phone, email: form.email, address: form.address, notes: form.notes };
      if (form.dId) await vendorsApi.update(form.dId, body);
      else await vendorsApi.create(body);
      toast.success('Vendor saved');
      setForm(null);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save vendor'));
    } finally {
      setSaving(false);
    }
  };

  // Hides a vendor; past purchases keep its name
  const remove = async () => {
    try {
      await vendorsApi.remove(removing.dId);
      toast.success('Vendor removed');
      setRemoving(null);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not remove vendor'));
    }
  };

  // Updates one field of the dialog form
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Truck className="h-6 w-6 text-primary" /> Vendors</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Who you buy stock from. The phone number is used to send purchase receipts on WhatsApp.</p>
        </div>
        <Button onClick={() => setForm({ ...EMPTY })}><PlusCircle className="mr-1.5 h-4 w-4" /> New Vendor</Button>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>}
              {!loading && rows.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No vendors yet.</TableCell></TableRow>}
              {rows.map((v) => (
                <TableRow key={v.dId}>
                  <TableCell className="font-semibold">{v.name}</TableCell>
                  <TableCell>{v.phone || '-'}</TableCell>
                  <TableCell>{v.email || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{v.address || '-'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setForm({ ...EMPTY, ...v })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setRemoving(v)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <form onSubmit={save} className="space-y-3">
              <DialogHeader>
                <DialogTitle>{form.dId ? 'Edit vendor' : 'New vendor'}</DialogTitle>
              </DialogHeader>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Name *" required className="text-xs" />
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone (01XXXXXXXXX)" className="text-xs" />
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Email" className="text-xs" />
              <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Address" className="text-xs" />
              <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Notes" className="text-xs" />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setForm(null)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        onConfirm={remove}
        title="Remove vendor?"
        description={`${removing?.name || ''} will be hidden from the list. Purchases already made keep the vendor name.`}
      />
    </div>
  );
};
