import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Boxes, History, Truck, Plus, Pencil, SlidersHorizontal, Search, RefreshCw, Warehouse } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { StockItemDialog } from '@/components/dashboard/inventory/StockItemDialog';
import { inventoryApi, packBreakdown } from '@/services/inventoryApi';
import { apiErrorMessage } from '@/services/paymentsApi';
import { taka } from '@/services/purchasesApi';

const TABS = [
  { key: 'items', label: 'Stock Items', icon: Boxes },
  { key: 'movements', label: 'Stock History', icon: History },
  { key: 'receipts', label: 'Received Purchases', icon: Truck },
];

const STATUS_ITEMS = [
  { value: 'active', label: 'Active' },
  { value: 'low', label: 'Low stock' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all', label: 'All' },
];

const MOVEMENT_LABELS = {
  purchase_receive: { label: 'Purchase received', tone: 'text-emerald-600' },
  purchase_adjust: { label: 'Purchase corrected', tone: 'text-sky-600' },
  purchase_cancel: { label: 'Purchase cancelled', tone: 'text-red-600' },
  manual_add: { label: 'Added by hand', tone: 'text-emerald-600' },
  manual_remove: { label: 'Removed by hand', tone: 'text-red-600' },
  manual_set: { label: 'Recount', tone: 'text-sky-600' },
};

const ADJUST_MODES = [
  { value: 'add', label: 'Add' },
  { value: 'remove', label: 'Remove' },
  { value: 'set', label: 'Set exact count' },
];

const fmt = (v) => (v ? new Date(v).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '-');

// Small figure card at the top of the page
const Stat = ({ label, value, tone = '' }) => (
  <Card className="border-border/70 shadow-sm">
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
    </CardContent>
  </Card>
);

// Manual stock correction for one item (damage, loss, recount), in single units or packs
const AdjustDialog = ({ item, onClose, onSave, saving }) => {
  const [mode, setMode] = useState('add');
  const [pack, setPack] = useState('unit');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const unit = item?.unit || 'pcs';
  const packItems = [{ value: 'unit', label: unit }, ...(item?.packs || []).map((p, i) => ({ value: String(i), label: `${p.label} (${p.unitsPerPack})` }))];
  const per = pack === 'unit' ? 1 : Number(item?.packs?.[Number(pack)]?.unitsPerPack) || 1;
  const units = Math.round((Number(qty) || 0) * per);

  useEffect(() => {
    if (item) {
      setMode('add');
      setPack('unit');
      setQty('');
      setNote('');
    }
  }, [item]);

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust {item?.shortName}</DialogTitle>
          <DialogDescription>Now in stock: {item?.quantity ?? 0} {unit}. Purchases add stock by themselves; use this for damage, loss or a recount.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={mode} onValueChange={setMode} items={ADJUST_MODES}>
            <SelectTrigger className="w-full text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{ADJUST_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" className="flex-1 text-xs" />
            {mode !== 'set' && packItems.length > 1 && (
              <Select value={pack} onValueChange={setPack} items={packItems}>
                <SelectTrigger className="w-40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{packItems.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
          {mode !== 'set' && per > 1 && <p className="text-xs text-muted-foreground">= {units} {unit}</p>}
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason (optional)" maxLength={300} className="text-xs" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={saving || qty === '' || (mode !== 'set' && units <= 0)}
            onClick={() => onSave({ mode, quantity: mode === 'set' ? Math.round(Number(qty) || 0) : units, note })}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Stock items of the chosen store: list, add, edit and adjust
const ItemsTab = ({ store }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const [data, setData] = useState({ data: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [adjusting, setAdjusting] = useState(null);
  const [saving, setSaving] = useState(false);

  // Loads the list with the current filters
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError('');
      setData(await inventoryApi.items(store, { search: search.trim(), status }));
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load stock items'));
    } finally {
      setLoading(false);
    }
  }, [store, search, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  // Creates or updates the item in the dialog
  const save = async (body) => {
    setSaving(true);
    try {
      if (editing?.item) await inventoryApi.updateItem(store, editing.item.id, body);
      else await inventoryApi.createItem(store, body);
      toast.success('Stock item saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save the stock item'));
    } finally {
      setSaving(false);
    }
  };

  // Applies a manual stock correction
  const adjust = async (body) => {
    setSaving(true);
    try {
      await inventoryApi.adjustItem(store, adjusting.id, body);
      toast.success('Stock updated');
      setAdjusting(null);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update the stock'));
    } finally {
      setSaving(false);
    }
  };

  const rows = data.data || [];
  const summary = data.summary || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active items" value={summary.items ?? 0} />
        <Stat label="Units on hand" value={Number(summary.units || 0).toLocaleString()} />
        <Stat label="Stock value (avg cost)" value={taka(summary.value)} />
        <Stat label="Low stock" value={summary.low ?? 0} tone={summary.low ? 'text-amber-600' : ''} />
      </div>
      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="w-56 pl-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Short name or name" />
              </div>
              <Select value={status} onValueChange={setStatus} items={STATUS_ITEMS}>
                <SelectTrigger className="w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_ITEMS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={() => setEditing({ item: null })}><Plus className="mr-1 h-4 w-4" /> New stock item</Button>
          </div>
          {error && <p className="rounded-md bg-red-500/10 p-3 text-xs text-red-600">{error}</p>}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short name</TableHead>
                  <TableHead>Pack sizes</TableHead>
                  <TableHead className="text-right">In stock</TableHead>
                  <TableHead className="text-right">Avg cost</TableHead>
                  <TableHead className="text-right">Last cost</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>}
                {!loading && !error && rows.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No stock items yet. Add one, e.g. MO with 1 Packet = 10 pcs.</TableCell></TableRow>
                )}
                {rows.map((r) => (
                  <TableRow key={r.id} className={r.isActive ? '' : 'opacity-60'}>
                    <TableCell>
                      <div className="font-semibold">{r.shortName}</div>
                      {r.name && <div className="text-[11px] text-muted-foreground">{r.name}</div>}
                    </TableCell>
                    <TableCell className="text-xs">{r.packs.length ? r.packs.map((p) => `1 ${p.label} = ${p.unitsPerPack} ${r.unit}`).join(', ') : <span className="text-muted-foreground">single {r.unit} only</span>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.isActive && r.isLow && <Badge variant="outline" className="border-amber-500 text-amber-600">Low</Badge>}
                        <span className={`font-semibold ${r.quantity < 0 ? 'text-red-600' : ''}`}>{r.quantity} {r.unit}</span>
                      </div>
                      {packBreakdown(r.quantity, r.packs, r.unit) && <div className="text-[11px] text-muted-foreground">{packBreakdown(r.quantity, r.packs, r.unit)}</div>}
                    </TableCell>
                    <TableCell className="text-right">{taka(r.avgCost)}</TableCell>
                    <TableCell className="text-right">{taka(r.lastCost)}</TableCell>
                    <TableCell className="text-right">{taka(r.stockValue)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Adjust stock" onClick={() => setAdjusting(r)}><SlidersHorizontal className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit" onClick={() => setEditing({ item: r })}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <StockItemDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} item={editing?.item || null} onSave={save} saving={saving} />
      <AdjustDialog item={adjusting} onClose={() => setAdjusting(null)} onSave={adjust} saving={saving} />
    </div>
  );
};

// Paged list loader shared by the history and receipts tabs
const usePaged = (fetcher, deps) => {
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ data: [], pagination: null, loading: true, error: '' });
  useEffect(() => {
    setPage(1);
  }, deps);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fetcher(page)
      .then((r) => alive && setState({ data: r.data || [], pagination: r.pagination, loading: false, error: '' }))
      .catch((err) => alive && setState({ data: [], pagination: null, loading: false, error: apiErrorMessage(err, 'Could not load') }));
    return () => {
      alive = false;
    };
  }, [page, ...deps]);
  return { ...state, page, setPage };
};

// Previous / next buttons under a paged table
const Pager = ({ page, setPage, pagination }) =>
  pagination && pagination.pages > 1 ? (
    <div className="flex items-center justify-end gap-2 pt-3">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
      <span className="text-xs text-muted-foreground">Page {page} of {pagination.pages}</span>
      <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</Button>
    </div>
  ) : null;

// Every stock change of the chosen store, newest first
const MovementsTab = ({ store }) => {
  const [q, setQ] = useState('');
  const list = usePaged((page) => inventoryApi.movements(store, { page, limit: 50, q: q.trim() }), [store, q]);
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="relative w-fit">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="w-64 pl-8 text-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Item, note or purchase" />
        </div>
        {list.error && <p className="rounded-md bg-red-500/10 p-3 text-xs text-red-600">{list.error}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Change</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Before → After</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.loading && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>}
              {!list.loading && list.data.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No stock changes yet.</TableCell></TableRow>}
              {list.data.map((r) => {
                const meta = MOVEMENT_LABELS[r.type] || { label: r.type, tone: '' };
                return (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-xs">{fmt(r.createdAt)}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className={`text-xs ${meta.tone}`}>{meta.label}</TableCell>
                    <TableCell className={`text-right font-semibold ${r.delta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{r.delta > 0 ? `+${r.delta}` : r.delta}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{r.before} → {r.after}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs" title={r.note}>{r.note}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.createdBy}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <Pager page={list.page} setPage={list.setPage} pagination={list.pagination} />
      </CardContent>
    </Card>
  );
};

// Purchases the store has received (as applied to its stock), with their lines
const ReceiptsTab = ({ store }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const list = usePaged((page) => inventoryApi.receipts(store, { page, limit: 25, q: q.trim() }), [store, q]);
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="relative w-fit">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="w-64 pl-8 text-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Purchase no, vendor or item" />
        </div>
        {list.error && <p className="rounded-md bg-red-500/10 p-3 text-xs text-red-600">{list.error}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.loading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>}
              {!list.loading && list.data.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No purchases received yet.</TableCell></TableRow>}
              {list.data.map((r) => (
                <Fragment key={r.id}>
                  <TableRow className="cursor-pointer" onClick={() => setOpen(open === r.id ? null : r.id)}>
                    <TableCell className="font-medium">{r.purchaseNumber || r.externalRef}</TableCell>
                    <TableCell>{r.vendorName || '-'}</TableCell>
                    <TableCell className="text-xs">{r.receivedAt ? String(r.receivedAt).slice(0, 10) : '-'}</TableCell>
                    <TableCell className="text-right">{r.totalUnits}</TableCell>
                    <TableCell className="text-right">{taka(r.totalCost)}</TableCell>
                    <TableCell>
                      {r.status === 'cancelled'
                        ? <Badge variant="outline" className="border-red-500 text-red-600">Cancelled</Badge>
                        : <Badge variant="outline" className="border-emerald-500 text-emerald-600">In stock</Badge>}
                    </TableCell>
                  </TableRow>
                  {open === r.id && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={6} className="text-xs">
                        {r.lines.map((l, i) => (
                          <div key={i} className="flex justify-between py-0.5">
                            <span>{l.shortName} · {l.unitsPerPack > 1 ? `${l.packs} ${l.packLabel || 'pack'} × ${l.unitsPerPack}` : `${l.units}`} = {l.units} units @ {taka(l.unitCost)}</span>
                            <span className="font-semibold">{taka(l.total)}</span>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pager page={list.page} setPage={list.setPage} pagination={list.pagination} />
      </CardContent>
    </Card>
  );
};

// Inventory of connected e-commerce stores (Surokkha and any store added later), managed from Plexivia
export const InventoryPage = () => {
  const [stores, setStores] = useState([]);
  const [store, setStore] = useState('');
  const [tab, setTab] = useState('items');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    inventoryApi
      .stores()
      .then((rows) => {
        setStores(rows);
        const first = rows.find((s) => s.connected);
        if (first) setStore(first.key);
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Could not load stores')))
      .finally(() => setLoading(false));
  }, []);

  const connected = useMemo(() => stores.filter((s) => s.connected), [stores]);

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Warehouse className="h-6 w-6 text-primary" /> Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Stock counted in single units for each connected e-commerce store. Purchases add stock; costs come from purchases.</p>
        </div>
        <div className="flex items-center gap-2">
          {connected.length > 0 && (
            <Select value={store} onValueChange={setStore} items={connected.map((s) => ({ value: s.key, label: s.name }))}>
              <SelectTrigger className="w-48 text-xs"><SelectValue placeholder="Store" /></SelectTrigger>
              <SelectContent>{connected.map((s) => <SelectItem key={s.key} value={s.key}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Button variant="outline" size="icon" title="Reload" onClick={() => setReloadKey((k) => k + 1)}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && connected.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No e-commerce store is connected yet. Connect one in Settings → Integrations (API URL and sync key).</CardContent></Card>
      )}

      {store && (
        <>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Button key={t.key} size="sm" variant={tab === t.key ? 'default' : 'outline'} onClick={() => setTab(t.key)}>
                <t.icon className="mr-1.5 h-4 w-4" /> {t.label}
              </Button>
            ))}
          </div>
          <div key={`${store}-${tab}-${reloadKey}`}>
            {tab === 'items' && <ItemsTab store={store} />}
            {tab === 'movements' && <MovementsTab store={store} />}
            {tab === 'receipts' && <ReceiptsTab store={store} />}
          </div>
        </>
      )}
    </div>
  );
};
