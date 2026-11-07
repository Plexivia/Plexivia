import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { TableV2, TablePaginationV2, useRowSelection } from '@/components/table/versionTwo';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  MoreHorizontal,
  Eye,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RecordQuickView, QuickViewSection, QuickViewLine, formatLongDate } from '@/components/dashboard/accounts/RecordQuickView';

// Amount actually received for a payment row
const settledAmount = (p) => p.paidAmount || (p.status === 'Completed' ? p.amount : 0);

import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { DateRangeFilter } from '@/components/dashboard/accounts/DateRangeFilter';
import { AssetFilter, FilteredTotals, ALL_ASSETS, matchesAsset } from '@/components/dashboard/accounts/AssetFilter';
import { toast } from 'sonner';
import { apiErrorMessage, paymentsApi } from '@/services/paymentsApi';
import apiService from '@/services/api';

const METHOD_COLORS = {
  bKash: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
  Nagad: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  Cash: 'bg-green-500/10 text-green-600 border-green-500/30',
  Card: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'Bank Transfer': 'bg-purple-500/10 text-purple-600 border-purple-500/30',
};

// Formats a numeric value into BDT currency string
const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `৳${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Renders the All Payments management page (API integration placeholder: fetch, update, and delete payments)
export const AllPaymentsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [assetFilter, setAssetFilter] = useState(ALL_ASSETS);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '', preset: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const selection = useRowSelection();
  const selectedIds = selection.ids;
  const setSelectedIds = selection.setIds;

  const [viewPaymentTarget, setViewPaymentTarget] = useState(null);
  // Client phone/email for the quick view's WhatsApp and Email actions
  const [clientContacts, setClientContacts] = useState({});
  useEffect(() => {
    apiService.getClients().then((list) => {
      const map = {};
      (list || []).forEach((c) => {
        const phone = (Array.isArray(c.phone) ? c.phone.find(Boolean) : c.phone) || c.contact_phone || c.contact_whatsapp || '';
        const email = c.email || c.contact_email || '';
        [c.id, c.dId, c._id].filter(Boolean).forEach((key) => (map[key] = { phone, email }));
      });
      setClientContacts(map);
    });
  }, []);
  const viewContact = clientContacts[viewPaymentTarget?.clientId] || {};
  const [singleDeleteTarget, setSingleDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [allPayments, setAllPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const totalPages = 1;

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      setAllPayments(await paymentsApi.list());
      setIsError(false);
    } catch (error) {
      setIsError(true);
      toast.error(apiErrorMessage(error, 'Failed to load payments'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Search, status, method, asset and date filters run on the loaded list
  const payments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPayments.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (methodFilter !== 'All' && p.method !== methodFilter) return false;
      if (!matchesAsset(assetFilter, p.projectId)) return false;
      if (dateRange.startDate && p.date < dateRange.startDate) return false;
      if (dateRange.endDate && p.date > dateRange.endDate) return false;
      if (!q) return true;
      return [p.customerName, p.invoiceId, p.trxId, p.projectName, p.paymentSource, p.paymentNumber]
        .some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [allPayments, searchQuery, statusFilter, methodFilter, assetFilter, dateRange]);

  const summary = useMemo(() => {
    // Partial payments count their received part as collected and the remainder as pending
    const totalCollected = payments
      .filter((p) => p.status === 'Completed' || p.status === 'Paid' || p.status === 'Partial')
      .reduce((acc, p) => acc + (Number(p.paidAmount ?? p.amount) || 0), 0);
    const totalPending = payments.reduce((acc, p) => {
      if (p.status === 'Pending') return acc + (Number(p.amount) || 0);
      if (p.status === 'Partial') return acc + Math.max(0, (Number(p.amount) || 0) - (Number(p.paidAmount) || 0));
      return acc;
    }, 0);
    const totalFailed = payments
      .filter((p) => p.status === 'Failed')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    return { totalCollected, totalPending, totalFailed };
  }, [payments]);

  // Updates search query filter and resets pagination and selection
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Updates payment status filter and resets pagination and selection
  const handleStatusFilter = (v) => {
    setStatusFilter(v || 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Updates payment method filter and resets pagination and selection
  const handleMethodFilter = (v) => {
    setMethodFilter(v || 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Updates asset filter and resets pagination and selection
  const handleAssetFilter = (v) => {
    setAssetFilter(v);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Updates date range filter and resets pagination and selection
  const handleRangeChange = (range) => {
    setDateRange(range);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Returns status badge component based on payment status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1" variant="outline">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'Pending':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1" variant="outline">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'Partial':
        return (
          <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 gap-1" variant="outline">
            <AlertCircle className="h-3 w-3" /> Partial
          </Badge>
        );
      case 'Failed':
        return (
          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 gap-1" variant="outline">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground gap-1" variant="outline">
            {status || 'Active'}
          </Badge>
        );
    }
  };

  // Returns method badge component styled by payment method name
  const getMethodBadge = (method) => {
    const cls = METHOD_COLORS[method] || 'bg-muted text-muted-foreground';
    return <Badge className={`${cls} gap-1 font-medium text-[11px]`} variant="outline">{method}</Badge>;
  };


  // Toggles selection state for all payments on the current page
  const handleSelectAll = (checked) => {
    if (checked) {
      const pageIds = payments.map((p) => p.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    } else {
      const pageIds = payments.map((p) => p.id);
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    }
  };

  // Runs one API call per selected payment and reports how many failed
  const runForSelected = async (action) => {
    const ids = [...selectedIds];
    const results = await Promise.allSettled(ids.map(action));
    return { total: ids.length, failed: results.filter((r) => r.status === 'rejected').length };
  };

  // Performs bulk status update on selected payments
  const handleBulkStatusChange = async (targetStatus) => {
    if (!targetStatus || targetStatus === 'placeholder') return;
    const { total, failed } = await runForSelected((id) => paymentsApi.updateStatus(id, targetStatus));
    if (failed) toast.error(`${failed} of ${total} payments could not be updated`);
    else toast.success(`Updated ${total} payments to status "${targetStatus}"`);
    setSelectedIds([]);
    loadPayments();
  };

  // Performs bulk deletion of selected payments 
  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const { total, failed } = await runForSelected((id) => paymentsApi.remove(id));
      if (failed) toast.error(`${failed} of ${total} payments could not be deleted`);
      else toast.success(`Deleted ${total} payments`);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      loadPayments();
    } catch {
      toast.error('Failed to delete selected payments');
    } finally {
      setIsDeleting(false);
    }
  };

  // Deletes a single payment record
  const handleSingleDelete = async () => {
    if (!singleDeleteTarget) return;
    setIsDeleting(true);
    try {
      await paymentsApi.remove(singleDeleteTarget.id);
      toast.success(`Payment ${singleDeleteTarget.paymentNumber || singleDeleteTarget.id} deleted`);
      setSingleDeleteTarget(null);
      loadPayments();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to delete payment'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'invoiceId',
      header: 'Invoice / Trx ID',
      className: 'w-[160px]',
      render: (p) => (
        <>
          <span className="block truncate font-mono text-xs font-semibold text-foreground">{p.invoiceId || p.paymentNumber}</span>
          {p.trxId && <span className="block truncate font-mono text-[10px] text-muted-foreground">{p.trxId}</span>}
        </>
      ),
    },
    {
      key: 'customerName',
      header: 'Received From',
      className: 'min-w-[200px]',
      render: (p) => {
        // Who the money came from: the business, or the client (with their project)
        const from = p.businessName || p.customerName || '—';
        const kind = p.businessName ? 'Business' : p.clientId ? 'Client' : p.paymentSource;
        const extra = p.businessName ? '' : p.projectName;
        return (
          <>
            <span className="block truncate text-xs font-semibold text-foreground">{from}</span>
            {(kind || extra) && (
              <span className="block truncate text-[11px] text-muted-foreground">
                {[kind, extra].filter(Boolean).join(' · ')}
              </span>
            )}
          </>
        );
      },
    },
    { key: 'method', header: 'Method', className: 'w-[120px]', render: (p) => getMethodBadge(p.method || p.paymentMethod) },
    {
      key: 'date',
      header: 'Payment Date',
      className: 'w-[120px]',
      render: (p) => <span className="text-xs text-muted-foreground">{p.date}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'w-[130px]',
      align: 'right',
      render: (p) => <span className="text-xs font-bold tabular-nums text-foreground">{formatCurrency(p.amount)}</span>,
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      className: 'w-[130px]',
      align: 'right',
      render: (p) => (
        <span className="text-xs font-semibold tabular-nums text-emerald-600">
          {formatCurrency(p.paidAmount || (p.status === 'Completed' ? p.amount : 0))}
        </span>
      ),
    },
    { key: 'status', header: 'Status', className: 'w-[120px]', render: (p) => getStatusBadge(p.status) },
  ];

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {t('accounts.all_payments_title', 'All Payments')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {t('accounts.all_payments_subtitle', 'Track all incoming client transactions and payment settlements.')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            asChild
            className="h-9 text-xs gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/accounts/payments/new">
              <PlusCircle className="w-4 h-4" />
              <span>{t('accounts.add_payment_btn', 'Add New Payment')}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Collected</p>
            <p className="text-xl font-bold tracking-tight text-emerald-600 mt-0.5">{formatCurrency(summary.totalCollected)}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Pending Approvals</p>
            <p className="text-xl font-bold tracking-tight text-amber-600 mt-0.5">{formatCurrency(summary.totalPending)}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Failed Transactions</p>
            <p className="text-xl font-bold tracking-tight text-red-600 mt-0.5">{formatCurrency(summary.totalFailed)}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
            <XCircle className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b bg-muted/20 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, invoice, TrxID..."
              className="pl-9 h-9 text-xs"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length === 0 ? (
              <>
                <AssetFilter value={assetFilter} onChange={handleAssetFilter} />

                <Select value={methodFilter} onValueChange={handleMethodFilter}>
                  <SelectTrigger className="h-9 text-xs w-[150px]">
                    <span className="truncate">Method: {methodFilter === 'All' ? 'All' : methodFilter}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Methods</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="bKash">bKash</SelectItem>
                    <SelectItem value="Nagad">Nagad</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="h-9 text-xs w-[150px]">
                    <span className="truncate">Status: {statusFilter === 'All' ? 'All' : statusFilter}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Completed">Completed (Paid)</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <DateRangeFilter
                  value={dateRange.preset}
                  onChange={handleRangeChange}
                />
              </>
            ) : (
              <>
                <span className="text-xs font-semibold text-muted-foreground mr-1">
                  {selectedIds.length} selected:
                </span>
                <Select value="placeholder" onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="h-9 text-xs w-[140px] border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
                    <SelectValue placeholder="Bulk Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled className="hidden">Bulk Status</SelectItem>
                    <SelectItem value="Completed">Mark as Completed</SelectItem>
                    <SelectItem value="Pending">Mark as Pending</SelectItem>
                    <SelectItem value="Failed">Mark as Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setBulkDeleteOpen(true)}
                  className="h-9 w-9 shrink-0"
                  title="Delete Selected"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <TableV2
          columns={columns}
          rows={payments}
          isLoading={isLoading}
          error={isError ? 'Failed to load payments data. Please click refresh.' : null}
          emptyText='No payments found matching your filter criteria.'
          selection={selection}
          onRowClick={(p) => setViewPaymentTarget(p)}
          rowActions={(p) => [
            { label: 'View Details', icon: Eye, onClick: () => setViewPaymentTarget(p) },
            { label: 'Edit Payment', icon: Edit, onClick: () => navigate(`/accounts/payments/new?edit=${p.id}`) },
            { label: 'Delete Payment', icon: Trash2, destructive: true, separatorBefore: true, onClick: () => setSingleDeleteTarget(p) },
          ]}
        />

        <FilteredTotals
          count={payments.length}
          items={[
            { label: 'Bill / Order', value: formatCurrency(payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)) },
            { label: 'Received', value: formatCurrency(summary.totalCollected), className: 'text-emerald-600' },
            { label: 'Pending', value: formatCurrency(summary.totalPending), className: 'text-amber-600' },
          ]}
        />

        <TablePaginationV2
          className="rounded-none border-0 border-t"
          page={currentPage}
          totalPages={totalPages}
          total={payments.length}
          pageSize={pageSize}
          setPage={(p) => {
            setCurrentPage(p);
            selection.clear();
          }}
          setPageSize={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          shownCount={payments.length}
        />
      </div>

      <RecordQuickView
        open={!!viewPaymentTarget}
        onClose={() => setViewPaymentTarget(null)}
        title={viewPaymentTarget?.customerName || 'Payment'}
        description={viewPaymentTarget?.invoiceId || viewPaymentTarget?.id}
        printLabel="Print Receipt"
        defaultPhone={viewPaymentTarget?.customerPhone || viewContact.phone}
        defaultEmail={viewPaymentTarget?.customerEmail || viewContact.email}
        onEdit={() => {
          const id = viewPaymentTarget?.id;
          setViewPaymentTarget(null);
          navigate(`/accounts/payments/new?edit=${id}`);
        }}
        editLabel="Edit Payment"
        slip={
          viewPaymentTarget && {
            heading: 'Money Receipt',
            reference: viewPaymentTarget.invoiceId || viewPaymentTarget.id,
            rows: [
              { label: 'Received From', value: viewPaymentTarget.customerName },
              { label: 'Payment Source', value: viewPaymentTarget.paymentSource },
              { label: 'Project', value: viewPaymentTarget.projectName },
              { label: 'Date', value: formatLongDate(viewPaymentTarget.date) },
              { label: 'Payment Method', value: viewPaymentTarget.method || viewPaymentTarget.paymentMethod },
              { label: 'Transaction ID', value: viewPaymentTarget.trxId },
              { label: 'Status', value: viewPaymentTarget.status },
            ],
            totals: [
              { label: 'Total Bill / Order', value: formatCurrency(viewPaymentTarget.amount) },
              { label: 'Amount Received', value: formatCurrency(settledAmount(viewPaymentTarget)) },
            ],
            notes: viewPaymentTarget.notes,
          }
        }
      >
        {viewPaymentTarget && (
          <>
          {/* Summary: amount received with method and status chips */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount Received</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-600">{formatCurrency(settledAmount(viewPaymentTarget))}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {getMethodBadge(viewPaymentTarget.method || viewPaymentTarget.paymentMethod)}
              {getStatusBadge(viewPaymentTarget.status)}
              <span className="text-xs text-muted-foreground">{formatLongDate(viewPaymentTarget.date)}</span>
            </div>
          </div>

          <QuickViewSection title="Details">
            <QuickViewLine label="Received From" value={viewPaymentTarget.customerName || '—'} />
            {viewPaymentTarget.paymentSource && <QuickViewLine label="Payment Source" value={viewPaymentTarget.paymentSource} />}
            {viewPaymentTarget.projectName && <QuickViewLine label="Project" value={viewPaymentTarget.projectName} />}
            <QuickViewLine label="Date" value={formatLongDate(viewPaymentTarget.date)} />
            <QuickViewLine label="Payment Method" value={getMethodBadge(viewPaymentTarget.method || viewPaymentTarget.paymentMethod)} />
            <QuickViewLine label="Status" value={getStatusBadge(viewPaymentTarget.status)} />
            {viewPaymentTarget.trxId && <QuickViewLine label="Transaction ID" value={<span className="font-mono">{viewPaymentTarget.trxId}</span>} />}
          </QuickViewSection>

          <QuickViewSection title="Amount">
            <QuickViewLine label="Total Bill / Order" value={formatCurrency(viewPaymentTarget.amount)} />
            <QuickViewLine label="Amount Received" value={<span className="font-bold text-emerald-600">{formatCurrency(settledAmount(viewPaymentTarget))}</span>} />
          </QuickViewSection>
          {viewPaymentTarget.attachments?.length > 0 && (
            <QuickViewSection title="Attachments">
              {viewPaymentTarget.attachments.map((file) => (
                <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-sm text-primary hover:underline truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.name || file.url.split('/').pop()}</span>
                </a>
              ))}
            </QuickViewSection>
          )}
          {viewPaymentTarget.notes && (
            <QuickViewSection title="Notes">
              <p className="whitespace-pre-wrap px-3 py-2.5 text-sm leading-relaxed text-foreground">{viewPaymentTarget.notes}</p>
            </QuickViewSection>
          )}
          </>
        )}
      </RecordQuickView>

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
        title="Delete Selected Payments"
        description={`Are you sure you want to delete the ${selectedIds.length} selected payment records?`}
      />

      <ConfirmDeleteDialog
        open={!!singleDeleteTarget}
        onOpenChange={(open) => !open && setSingleDeleteTarget(null)}
        onConfirm={handleSingleDelete}
        isDeleting={isDeleting}
        title="Delete Payment Record"
        description={`Are you sure you want to delete payment ${singleDeleteTarget?.invoiceId || singleDeleteTarget?.id}?`}
      />
    </div>
  );
};

export default AllPaymentsPage;
