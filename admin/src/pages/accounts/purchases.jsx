import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle, Search, RefreshCw, PackageCheck, Ban, Wallet, CheckCircle2, AlertTriangle, Clock, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RecordQuickView, QuickViewSection, QuickViewLine } from '@/components/dashboard/accounts/RecordQuickView';
import { purchasesApi, purchaseSlip, lineText, taka } from '@/services/purchasesApi';
import { paymentMethodsApi, apiErrorMessage } from '@/services/paymentsApi';

const STATUS_STYLE = {
  DRAFT: 'border-slate-400 text-slate-600',
  ORDERED: 'border-sky-500 text-sky-600',
  RECEIVED: 'border-emerald-500 text-emerald-600',
  CANCELLED: 'border-red-500 text-red-600',
};
const STATUS_ITEMS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ORDERED', label: 'Ordered' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'CANCELLED', label: 'Cancelled' },
];
const PAY_STYLE = { PENDING: 'text-red-600', PARTIAL: 'text-amber-600', PAID: 'text-emerald-600' };

// Stock sync badge: synced / waiting / failed with Surokkha
const SyncBadge = ({ sync }) => {
  if (!sync || sync.status === 'none') return <span className="text-xs text-muted-foreground">-</span>;
  if (sync.status === 'synced') return <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Stock synced</span>;
  if (sync.status === 'pending') return <span className="inline-flex items-center gap-1 text-xs text-sky-600"><Clock className="h-3.5 w-3.5" />Waiting</span>;
  return <span className="inline-flex items-center gap-1 text-xs text-red-600" title={sync.last_error}><AlertTriangle className="h-3.5 w-3.5" />Sync failed</span>;
};

// Small figure card at the top of the page
const Stat = ({ label, value, tone = '' }) => (
  <Card className="border-border/70 shadow-sm">
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
    </CardContent>
  </Card>
);

// Product purchases: list, quick view with print / WhatsApp / email, receive, pay, cancel and stock resync
export const PurchasesPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [view, setView] = useState(null);
  const [busy, setBusy] = useState('');
  const [methods, setMethods] = useState([]);
  const [payForm, setPayForm] = useState(null);
  const [cancelReason, setCancelReason] = useState(null);

  // Reloads the list (and the open record) from the server
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await purchasesApi.list({ status });
      setRows(data);
      const openId = params.get('open');
      if (openId) {
        setView(data.find((p) => p.dId === openId) || null);
        setParams({}, { replace: true });
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not load purchases'));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    paymentMethodsApi.list().then((m) => setMethods(m.filter((x) => x.status !== 'Inactive'))).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((p) => [p.purchase_number, p.vendor_name, ...p.lines.map((l) => l.short_name)].some((v) => String(v || '').toLowerCase().includes(term)));
  }, [rows, q]);

  const stats = useMemo(() => {
    const open = rows.filter((p) => p.status !== 'CANCELLED' && p.status !== 'DRAFT');
    return {
      total: open.reduce((s, p) => s + p.total, 0),
      due: open.reduce((s, p) => s + Math.max(0, p.total - p.paid_amount), 0),
      ordered: rows.filter((p) => p.status === 'ORDERED').length,
      failed: rows.filter((p) => p.sync?.status === 'failed').length,
    };
  }, [rows]);

  // Runs one action on the open purchase and refreshes it in place
  const act = async (key, fn, okText) => {
    setBusy(key);
    try {
      const updated = await fn();
      setRows((rs) => rs.map((r) => (r.dId === updated.dId ? updated : r)));
      setView(updated);
      if (updated.sync?.status === 'failed') toast.warning(`Saved, but Surokkha stock was not updated: ${updated.sync.last_error || 'sync failed'}`);
      else toast.success(okText);
      return updated;
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Action failed'));
      return null;
    } finally {
      setBusy('');
    }
  };

  // Retries every pending / failed stock sync now
  const retryAll = async () => {
    setBusy('all');
    try {
      const r = await purchasesApi.resyncAll();
      toast.success(`Synced ${r.synced} of ${r.tried}`);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Retry failed'));
    } finally {
      setBusy('');
    }
  };

  // Compares the open purchase with what Surokkha holds
  const checkSync = async () => {
    try {
      const r = await purchasesApi.syncCheck(view.dId);
      if (r.in_sync) toast.success('Surokkha stock matches this purchase');
      else toast.warning(`Mismatch on ${r.differences.length} item(s). Use Resync stock to fix.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not reach Surokkha'));
    }
  };

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-primary" /> Purchases</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Stock bought for Surokkha. Each purchase keeps a Product Purchase bill and the Surokkha inventory in step.</p>
        </div>
        <div className="flex gap-2">
          {stats.failed > 0 && (
            <Button variant="outline" onClick={retryAll} disabled={busy === 'all'}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${busy === 'all' ? 'animate-spin' : ''}`} /> Retry {stats.failed} failed sync
            </Button>
          )}
          <Button onClick={() => navigate('/accounts/purchases/new')}><PlusCircle className="mr-1.5 h-4 w-4" /> New Purchase</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Purchased (ordered + received)" value={taka(stats.total)} />
        <Stat label="Due to vendors" value={taka(stats.due)} tone={stats.due > 0 ? 'text-red-600' : ''} />
        <Stat label="Ordered, not received" value={stats.ordered} />
        <Stat label="Stock sync failed" value={stats.failed} tone={stats.failed ? 'text-red-600' : ''} />
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="w-64 pl-8 text-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number, vendor or item" />
            </div>
            <Select value={status} onValueChange={setStatus} items={STATUS_ITEMS}>
              <SelectTrigger className="w-40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_ITEMS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purchase</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>}
                {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No purchases yet.</TableCell></TableRow>}
                {filtered.map((p) => (
                  <TableRow key={p.dId} className="cursor-pointer" onClick={() => setView(p)}>
                    <TableCell>
                      <div className="font-semibold">{p.purchase_number}</div>
                      <div className="text-[11px] text-muted-foreground">{String(p.order_date).slice(0, 10)}</div>
                    </TableCell>
                    <TableCell>{p.vendor_name}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs" title={p.lines.map(lineText).join(', ')}>{p.lines.map((l) => l.short_name).join(', ')}</TableCell>
                    <TableCell className="text-right font-semibold">{taka(p.total)}</TableCell>
                    <TableCell className={`text-right text-xs ${PAY_STYLE[p.payment_status] || ''}`}>{taka(p.paid_amount)}</TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_STYLE[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell><SyncBadge sync={p.sync} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RecordQuickView
        open={!!view}
        onClose={() => { setView(null); setPayForm(null); setCancelReason(null); }}
        title={view ? `${view.purchase_number} · ${view.vendor_name}` : 'Purchase'}
        description={view ? `${view.status} · ${view.payment_status}${view.bill_number ? ` · Bill ${view.bill_number}` : ''}` : ''}
        printLabel="Print Receipt"
        defaultPhone={view?.vendor_phone}
        defaultEmail={view?.vendor_email}
        onEdit={view && view.status !== 'CANCELLED' ? () => navigate(`/accounts/purchases/new?edit=${view.dId}`) : undefined}
        editLabel="Edit"
        slip={purchaseSlip(view)}
      >
        {view && (
          <>
            <div className="flex flex-wrap gap-2">
              {(view.status === 'DRAFT' || view.status === 'ORDERED') && (
                <Button size="sm" disabled={!!busy} onClick={() => act('receive', () => purchasesApi.receive(view.dId), 'Received: stock added in Surokkha')}>
                  <PackageCheck className="mr-1 h-4 w-4" /> Mark received
                </Button>
              )}
              {view.status !== 'CANCELLED' && view.payment_status !== 'PAID' && (
                <Button size="sm" variant="outline" disabled={!!busy} onClick={() => setPayForm({ payment_method_id: '', amount: String(Math.round((view.total - view.paid_amount) * 100) / 100), transaction_reference: '' })}>
                  <Wallet className="mr-1 h-4 w-4" /> Add payment
                </Button>
              )}
              {(view.status === 'RECEIVED' || (view.sync?.version || 0) > 0) && (
                <>
                  <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act('resync', () => purchasesApi.resync(view.dId), 'Stock resynced')}>
                    <RefreshCw className={`mr-1 h-4 w-4 ${busy === 'resync' ? 'animate-spin' : ''}`} /> Resync stock
                  </Button>
                  <Button size="sm" variant="ghost" onClick={checkSync}>Check</Button>
                </>
              )}
              {view.status !== 'CANCELLED' && (
                <Button size="sm" variant="ghost" className="text-red-600" disabled={!!busy} onClick={() => setCancelReason('')}>
                  <Ban className="mr-1 h-4 w-4" /> Cancel
                </Button>
              )}
            </div>

            {payForm && (
              <form
                className="grid grid-cols-2 gap-2 rounded-xl border p-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!payForm.payment_method_id) return toast.error('Choose a method');
                  const ok = await act('pay', () => purchasesApi.addPayment(view.dId, { ...payForm, amount: Number(payForm.amount) }), 'Payment added; bill updated');
                  if (ok) setPayForm(null);
                }}
              >
                <Select value={payForm.payment_method_id} onValueChange={(v) => setPayForm((f) => ({ ...f, payment_method_id: v }))} items={methods.map((m) => ({ value: m.id, label: m.name }))}>
                  <SelectTrigger className="w-full text-xs"><SelectValue placeholder="Method" /></SelectTrigger>
                  <SelectContent>{methods.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" min={0} step="any" className="text-xs" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} />
                <Input className="col-span-2 text-xs" placeholder="TrxID / reference" value={payForm.transaction_reference} onChange={(e) => setPayForm((f) => ({ ...f, transaction_reference: e.target.value }))} />
                <Button type="button" variant="outline" size="sm" onClick={() => setPayForm(null)}>Close</Button>
                <Button type="submit" size="sm" disabled={busy === 'pay'}>{busy === 'pay' ? 'Saving…' : 'Save payment'}</Button>
              </form>
            )}

            {cancelReason !== null && (
              <form
                className="space-y-2 rounded-xl border border-red-500/40 p-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await act('cancel', () => purchasesApi.cancel(view.dId, cancelReason), 'Purchase cancelled');
                  if (ok) setCancelReason(null);
                }}
              >
                <p className="text-xs">
                  Cancelling removes the bill from the books{view.status === 'RECEIVED' ? ' and takes the received units back out of Surokkha stock' : ''}. This cannot be undone.
                </p>
                <Input className="text-xs" placeholder="Reason (optional)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setCancelReason(null)}>Keep</Button>
                  <Button type="submit" size="sm" className="bg-red-600 text-white hover:bg-red-700" disabled={busy === 'cancel'}>{busy === 'cancel' ? 'Cancelling…' : 'Cancel purchase'}</Button>
                </div>
              </form>
            )}

            {view.sync?.status === 'failed' && (
              <p className="rounded-md bg-red-500/10 p-3 text-xs text-red-600">Surokkha stock not updated: {view.sync.last_error}. It retries every 15 minutes, or use Resync stock.</p>
            )}

            <QuickViewSection title="Items">
              {view.lines.map((l, i) => (
                <QuickViewLine key={i} label={`${lineText(l)} @ ${taka(l.pack_price)}`} value={taka(l.total)} />
              ))}
              {view.shipping > 0 && <QuickViewLine label="Shipping / carrying" value={taka(view.shipping)} />}
              {view.discount > 0 && <QuickViewLine label="Discount" value={`-${taka(view.discount)}`} />}
              <QuickViewLine label="Total" value={taka(view.total)} className="font-bold" />
            </QuickViewSection>

            <QuickViewSection title="Payments">
              {view.payments.length === 0 && <QuickViewLine label="No payments yet" value="" />}
              {view.payments.map((x) => (
                <QuickViewLine key={x.dId} label={`${String(x.paid_at).slice(0, 10)} · ${x.method}${x.transaction_reference ? ` (${x.transaction_reference})` : ''}`} value={taka(x.amount)} />
              ))}
              <QuickViewLine label="Due" value={taka(Math.max(0, view.total - view.paid_amount))} className={view.total > view.paid_amount ? 'text-red-600' : ''} />
            </QuickViewSection>

            <QuickViewSection title="Details">
              <QuickViewLine label="Vendor phone" value={view.vendor_phone || '-'} />
              <QuickViewLine label="Order date" value={String(view.order_date).slice(0, 10)} />
              <QuickViewLine label="Received" value={view.received_date ? String(view.received_date).slice(0, 10) : '-'} />
              <QuickViewLine label="Bill" value={view.bill_number || '-'} />
              <QuickViewLine label="Stock sync" value={<SyncBadge sync={view.sync} />} />
              {view.notes && <QuickViewLine label="Notes" value={view.notes} />}
            </QuickViewSection>
          </>
        )}
      </RecordQuickView>
    </div>
  );
};
