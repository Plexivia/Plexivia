import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, PackagePlus, Plus, Trash2, Truck, Wallet, RefreshCw, Save, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { purchasesApi, vendorsApi, taka } from '@/services/purchasesApi';
import { paymentMethodsApi, apiErrorMessage } from '@/services/paymentsApi';

const NEW_VENDOR = '__new__';
const UNIT = 'unit';
const today = () => new Date().toISOString().slice(0, 10);
const emptyLine = () => ({ key: Math.random().toString(36).slice(2), stock_item_id: '', pack: UNIT, packs: '', pack_price: '' });
const emptyPayment = () => ({ key: Math.random().toString(36).slice(2), payment_method_id: '', amount: '', transaction_reference: '', paid_at: today() });

// Pack choice for a line: the item's pack sizes plus single units
const packOptions = (item) => [{ value: UNIT, label: item?.unit || 'pcs', unitsPerPack: 1 }, ...(item?.packs || []).map((p, i) => ({ value: String(i), label: p.label, unitsPerPack: p.unitsPerPack }))];

// Units per pack for the chosen pack option
const perPackOf = (item, pack) => packOptions(item).find((o) => o.value === pack)?.unitsPerPack || 1;

// Turns a saved purchase line back into editor state, matching its pack size to the item's options
const toEditorLine = (l, items) => {
  const item = items.find((i) => i.id === l.stock_item_id);
  const match = packOptions(item).find((o) => o.unitsPerPack === l.units_per_pack && (o.value === UNIT || o.label === l.pack_label));
  return {
    key: Math.random().toString(36).slice(2),
    stock_item_id: l.stock_item_id,
    pack: match?.value ?? UNIT,
    packs: String(match ? l.packs : l.units),
    pack_price: String(match ? l.pack_price : l.unit_cost),
  };
};

// Create or edit a product purchase: vendor, items in packs or units, payments, then save / order / receive
export const PurchaseEditorPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');

  const [items, setItems] = useState([]);
  const [itemsError, setItemsError] = useState('');
  const [vendors, setVendors] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);

  const [vendorId, setVendorId] = useState('');
  const [newVendor, setNewVendor] = useState({ name: '', phone: '' });
  const [orderDate, setOrderDate] = useState(today());
  const [lines, setLines] = useState([emptyLine()]);
  const [payments, setPayments] = useState([]);
  const [discount, setDiscount] = useState('');
  const [shipping, setShipping] = useState('');
  const [notes, setNotes] = useState('');

  // Loads Surokkha's live stock items for the item picker
  const loadItems = async () => {
    try {
      setItemsError('');
      const data = await purchasesApi.stockItems();
      setItems(data);
      return data;
    } catch (err) {
      setItemsError(apiErrorMessage(err, 'Could not load stock items from Surokkha'));
      return [];
    }
  };

  useEffect(() => {
    // Loads items, vendors, payment methods and (when editing) the purchase itself
    const boot = async () => {
      const [stock, vendorList, methodList] = await Promise.all([
        loadItems(),
        vendorsApi.list().catch(() => []),
        paymentMethodsApi.list().catch(() => []),
      ]);
      setVendors(vendorList);
      setMethods(methodList.filter((m) => m.status !== 'Inactive'));
      if (editId) {
        try {
          const p = await purchasesApi.get(editId);
          setExisting(p);
          setVendorId(p.vendor_dId || NEW_VENDOR);
          if (!p.vendor_dId) setNewVendor({ name: p.vendor_name, phone: p.vendor_phone || '' });
          setOrderDate(String(p.order_date || '').slice(0, 10) || today());
          setLines(p.lines.map((l) => toEditorLine(l, stock)));
          setDiscount(p.discount ? String(p.discount) : '');
          setShipping(p.shipping ? String(p.shipping) : '');
          setNotes(p.notes || '');
        } catch (err) {
          toast.error(apiErrorMessage(err, 'Purchase not found'));
          navigate('/accounts/purchases');
        }
      }
      setLoading(false);
    };
    boot();
  }, [editId]);

  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const computed = useMemo(() => {
    const rows = lines.map((l) => {
      const item = itemById.get(l.stock_item_id);
      const perPack = perPackOf(item, l.pack);
      const qty = Number(l.packs) || 0;
      const price = Number(l.pack_price) || 0;
      const units = Math.round(qty * perPack);
      const total = Math.round(qty * price * 100) / 100;
      return { ...l, item, perPack, units, total, unitCost: units ? total / units : 0 };
    });
    const subtotal = rows.reduce((s, r) => s + r.total, 0);
    const total = Math.max(0, subtotal - (Number(discount) || 0) + (Number(shipping) || 0));
    const newPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const paid = (existing?.paid_amount || 0) + newPaid;
    return { rows, subtotal, total, paid, due: Math.max(0, total - paid) };
  }, [lines, itemById, discount, shipping, payments, existing]);

  // Patches one item line
  const setLine = (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  // Patches one new payment row
  const setPayment = (key, patch) => setPayments((ps) => ps.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  // API body from the form; units per pack come from the chosen pack size
  const buildBody = (status) => {
    const body = {
      order_date: orderDate,
      lines: computed.rows
        .filter((r) => r.stock_item_id)
        .map((r) => ({
          stock_item_id: r.stock_item_id,
          short_name: r.item?.shortName,
          pack_label: r.pack === UNIT ? '' : packOptions(r.item).find((o) => o.value === r.pack)?.label,
          units_per_pack: r.perPack,
          packs: Number(r.packs),
          pack_price: Number(r.pack_price) || 0,
        })),
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      notes,
    };
    if (status) body.status = status;
    if (vendorId && vendorId !== NEW_VENDOR) body.vendor_id = vendorId;
    else body.vendor_name = newVendor.name;
    return body;
  };

  // New payment rows that have an amount
  const validPayments = () => payments.filter((p) => Number(p.amount) > 0);

  // Validates, saves (creating a new vendor first if needed) and reports the stock sync result
  const submit = async (status) => {
    if (!vendorId || (vendorId === NEW_VENDOR && !newVendor.name.trim())) return toast.error('Choose or add a vendor');
    if (!computed.rows.some((r) => r.stock_item_id && r.units > 0)) return toast.error('Add at least one item with a quantity');
    if (validPayments().some((p) => !p.payment_method_id)) return toast.error('Choose a method for each payment');
    if (computed.paid > computed.total + 0.009) return toast.error('Paid amount is more than the total');
    setSaving(true);
    try {
      const body = buildBody(status);
      if (vendorId === NEW_VENDOR) {
        const v = await vendorsApi.create({ name: newVendor.name, phone: newVendor.phone });
        setVendors((vs) => [...vs, v]);
        setVendorId(v.dId);
        delete body.vendor_name;
        body.vendor_id = v.dId;
      }
      let saved;
      if (existing) {
        saved = await purchasesApi.update(existing.dId, body);
        for (const p of validPayments()) saved = await purchasesApi.addPayment(existing.dId, { ...p, amount: Number(p.amount) });
      } else {
        body.payments = validPayments().map((p) => ({ ...p, amount: Number(p.amount) }));
        saved = await purchasesApi.create(body);
      }
      if (saved.sync?.status === 'failed') toast.warning(`Saved, but Surokkha stock was not updated yet: ${saved.sync.last_error || 'sync failed'}. It retries automatically.`);
      else if (saved.status === 'RECEIVED') toast.success(`${saved.purchase_number} saved and stock updated in Surokkha`);
      else toast.success(`${saved.purchase_number} saved`);
      navigate(`/accounts/purchases?open=${saved.dId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save the purchase'));
    } finally {
      setSaving(false);
    }
  };

  const isReceived = existing?.status === 'RECEIVED';

  // Item picker choices, keeping a saved line's item visible even if Surokkha no longer lists it
  const itemChoices = (r) => [
    ...items.map((i) => ({ value: i.id, label: `${i.shortName}${i.name ? ` · ${i.name}` : ''} (${i.quantity} ${i.unit})` })),
    ...(r.stock_item_id && !r.item ? [{ value: r.stock_item_id, label: existing?.lines.find((l) => l.stock_item_id === r.stock_item_id)?.short_name || 'Unknown item' }] : []),
  ];

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/accounts/purchases')} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{existing ? `Edit ${existing.purchase_number}` : 'New Purchase'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              What you bought, from whom and at what price. Receiving it adds the units to Surokkha inventory; a Product Purchase bill is kept in step.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Vendor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Vendor <span className="text-red-500">*</span></label>
                <Select value={vendorId} onValueChange={setVendorId} items={[...vendors.map((v) => ({ value: v.dId, label: `${v.name}${v.phone ? ` · ${v.phone}` : ''}` })), { value: NEW_VENDOR, label: '+ New vendor' }]}>
                  <SelectTrigger className="w-full text-xs"><SelectValue placeholder="Choose vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.dId} value={v.dId}>{v.name}{v.phone ? ` · ${v.phone}` : ''}</SelectItem>
                    ))}
                    <SelectItem value={NEW_VENDOR}>+ New vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Order date</label>
                <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="text-xs" />
              </div>
              {vendorId === NEW_VENDOR && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Vendor name <span className="text-red-500">*</span></label>
                    <Input value={newVendor.name} onChange={(e) => setNewVendor((v) => ({ ...v, name: e.target.value }))} className="text-xs" placeholder="e.g. Rahim Traders" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Phone (for WhatsApp)</label>
                    <Input value={newVendor.phone} onChange={(e) => setNewVendor((v) => ({ ...v, phone: e.target.value }))} className="text-xs" placeholder="01XXXXXXXXX" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-primary" /> Items
              </CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={loadItems} className="h-7 text-xs">
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reload from Surokkha
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {itemsError && <p className="rounded-md bg-red-500/10 p-3 text-xs text-red-600">{itemsError}</p>}
              {!itemsError && items.length === 0 && (
                <p className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-700">No stock items in Surokkha yet. Add them in Surokkha → Inventory first (short name + pack sizes).</p>
              )}
              <div className="hidden md:grid grid-cols-12 gap-2 text-[11px] font-semibold text-muted-foreground">
                <div className="col-span-4">Item</div>
                <div className="col-span-2">Bought as</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price each</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {computed.rows.map((r) => (
                <div key={r.key} className="grid grid-cols-12 gap-2 items-start rounded-lg border p-2 md:border-0 md:p-0">
                  <div className="col-span-12 md:col-span-4">
                    <Select value={r.stock_item_id} onValueChange={(v) => setLine(r.key, { stock_item_id: v, pack: itemById.get(v)?.packs?.length ? '0' : UNIT })} items={itemChoices(r)}>
                      <SelectTrigger className="w-full text-xs"><SelectValue placeholder="Stock item" /></SelectTrigger>
                      <SelectContent>
                        {items.map((i) => (
                          <SelectItem key={i.id} value={i.id}>{i.shortName}{i.name ? ` · ${i.name}` : ''} ({i.quantity} {i.unit})</SelectItem>
                        ))}
                        {r.stock_item_id && !r.item && <SelectItem value={r.stock_item_id}>{existing?.lines.find((l) => l.stock_item_id === r.stock_item_id)?.short_name || 'Unknown item'}</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Select value={r.pack} onValueChange={(v) => setLine(r.key, { pack: v })} items={packOptions(r.item).map((o) => ({ value: o.value, label: o.value === UNIT ? o.label : `${o.label} (${o.unitsPerPack})` }))}>
                      <SelectTrigger className="w-full text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {packOptions(r.item).map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.value === UNIT ? o.label : `${o.label} (${o.unitsPerPack})`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input type="number" min={0} step="any" value={r.packs} onChange={(e) => setLine(r.key, { packs: e.target.value })} className="text-xs" placeholder="0" />
                    {r.perPack > 1 && r.units > 0 && <p className="mt-0.5 text-[10px] text-muted-foreground">= {r.units} {r.item?.unit || 'pcs'}</p>}
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Input type="number" min={0} step="any" value={r.pack_price} onChange={(e) => setLine(r.key, { pack_price: e.target.value })} className="text-xs" placeholder="0" />
                    {r.units > 0 && r.total > 0 && <p className="mt-0.5 text-[10px] text-muted-foreground">{taka(r.unitCost)} / {r.item?.unit || 'pcs'}</p>}
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                    <span className="text-sm font-semibold">{taka(r.total)}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((l) => l.key !== r.key))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setLines((ls) => [...ls, emptyLine()])} className="text-xs">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add item
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" /> {existing ? 'Add payments' : 'Payments made'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {existing?.payments?.length > 0 && (
                <div className="space-y-1 rounded-md bg-muted/40 p-3 text-xs">
                  {existing.payments.map((p) => (
                    <div key={p.dId} className="flex justify-between">
                      <span>{String(p.paid_at).slice(0, 10)} · {p.method}{p.transaction_reference ? ` (${p.transaction_reference})` : ''}</span>
                      <span className="font-semibold">{taka(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {payments.map((p) => (
                <div key={p.key} className="grid grid-cols-12 gap-2">
                  <div className="col-span-6 md:col-span-3">
                    <Select value={p.payment_method_id} onValueChange={(v) => setPayment(p.key, { payment_method_id: v })} items={methods.map((m) => ({ value: m.id, label: m.name }))}>
                      <SelectTrigger className="w-full text-xs"><SelectValue placeholder="Method" /></SelectTrigger>
                      <SelectContent>
                        {methods.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input className="col-span-6 md:col-span-2 text-xs" type="number" min={0} step="any" placeholder="Amount" value={p.amount} onChange={(e) => setPayment(p.key, { amount: e.target.value })} />
                  <Input className="col-span-6 md:col-span-3 text-xs" placeholder="TrxID / reference" value={p.transaction_reference} onChange={(e) => setPayment(p.key, { transaction_reference: e.target.value })} />
                  <Input className="col-span-5 md:col-span-3 text-xs" type="date" value={p.paid_at} onChange={(e) => setPayment(p.key, { paid_at: e.target.value })} />
                  <Button type="button" variant="ghost" size="icon" className="col-span-1 h-9 w-9" onClick={() => setPayments((ps) => ps.filter((x) => x.key !== p.key))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setPayments((ps) => [...ps, { ...emptyPayment(), amount: computed.due ? String(Math.round(computed.due * 100) / 100) : '' }])} className="text-xs">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add payment
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <Card className="border-border/70 shadow-sm lg:sticky lg:top-4">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{taka(computed.subtotal)}</span></div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Shipping / carrying</span>
                <Input type="number" min={0} step="any" value={shipping} onChange={(e) => setShipping(e.target.value)} className="h-8 w-28 text-right text-xs" placeholder="0" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Discount</span>
                <Input type="number" min={0} step="any" value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-8 w-28 text-right text-xs" placeholder="0" />
              </div>
              <div className="flex justify-between border-t pt-3 font-bold"><span>Total</span><span>{taka(computed.total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>{taka(computed.paid)}</span></div>
              <div className="flex justify-between font-semibold"><span>Due</span><span className={computed.due > 0 ? 'text-red-600' : 'text-emerald-600'}>{taka(computed.due)}</span></div>
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold">Notes</label>
                <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="text-xs" placeholder="Anything to remember about this purchase" />
              </div>
              <div className="space-y-2 pt-2">
                {!isReceived && (
                  <Button className="w-full" disabled={saving} onClick={() => submit('RECEIVED')}>
                    <PackageCheck className="mr-1.5 h-4 w-4" /> {saving ? 'Saving…' : 'Save & receive into stock'}
                  </Button>
                )}
                {isReceived && (
                  <Button className="w-full" disabled={saving} onClick={() => submit()}>
                    <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving…' : 'Save changes (stock updates)'}
                  </Button>
                )}
                {!isReceived && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" disabled={saving} onClick={() => submit('ORDERED')}>Save as ordered</Button>
                    <Button variant="outline" disabled={saving} onClick={() => submit('DRAFT')}>Save draft</Button>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Draft: nothing in the books. Ordered: bill added, stock not yet. Received: bill added and units go into Surokkha inventory.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
