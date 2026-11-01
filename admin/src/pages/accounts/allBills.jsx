import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { TableV2, TablePaginationV2, useRowSelection } from '@/components/table/versionTwo';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Receipt,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  MoreHorizontal,
  Eye,
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
import { RecordQuickView, QuickViewSection, QuickViewLine } from '@/components/dashboard/accounts/RecordQuickView';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { DateRangeFilter } from '@/components/dashboard/accounts/DateRangeFilter';
import { AssetFilter, FilteredTotals, ALL_ASSETS, matchesAsset } from '@/components/dashboard/accounts/AssetFilter';
import { billsApi, apiErrorMessage } from '@/services/paymentsApi';
import { toast } from 'sonner';

// Formats a numeric value into BDT currency string
const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `৳${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Renders the All Bills management page (API integration placeholder: fetch, update, and delete bills)
export const AllBillsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [billTypeFilter, setBillTypeFilter] = useState('All');
  const [assetFilter, setAssetFilter] = useState(ALL_ASSETS);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '', preset: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const selection = useRowSelection();
  const selectedIds = selection.ids;
  const setSelectedIds = selection.setIds;

  const [viewBillTarget, setViewBillTarget] = useState(null);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [allBillings, setBillings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const totalPages = 1;

  const loadBills = useCallback(async () => {
    setIsLoading(true);
    try {
      setBillings(await billsApi.list());
      setIsError(false);
    } catch (error) {
      setIsError(true);
      toast.error(apiErrorMessage(error, 'Failed to load bills'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Bill types offered in the filter are the ones used on loaded bills
  const allBillTypes = useMemo(
    () => Array.from(new Set(allBillings.map((b) => b.billType).filter(Boolean))).map((name) => ({ id: name, name })),
    [allBillings]
  );

  // Search, status, type, asset and date filters run on the loaded list
  const billings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allBillings.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (billTypeFilter !== 'All' && b.billType !== billTypeFilter) return false;
      if (!matchesAsset(assetFilter, b.projectId)) return false;
      if (dateRange.startDate && b.billingDate < dateRange.startDate) return false;
      if (dateRange.endDate && b.billingDate > dateRange.endDate) return false;
      if (!q) return true;
      return [b.title, b.did, b.vendor, b.projectName, b.billType].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [allBillings, searchQuery, statusFilter, billTypeFilter, assetFilter, dateRange]);

  const summary = useMemo(() => {
    const totalBilled = billings.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);
    const totalPaid = billings.reduce((acc, b) => acc + (Number(b.paidAmount) || 0), 0);
    const totalPending = billings.reduce((acc, b) => acc + (Number(b.pendingAmount) || 0), 0);
    return { totalBilled, totalPaid, totalPending };
  }, [billings]);

  // Updates search query filter and resets pagination and selection
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Updates bill status filter and resets pagination and selection
  const handleStatusFilter = (v) => {
    setStatusFilter(v || 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Updates bill category filter and resets pagination and selection
  const handleBillTypeFilter = (v) => {
    setBillTypeFilter(v || 'All');
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

  // Returns status badge element for a given bill status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1" variant="outline">
            <CheckCircle2 className="h-3 w-3" /> Paid
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
      case 'Returned':
        return (
          <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 gap-1" variant="outline">
            <CheckCircle2 className="h-3 w-3" /> Returned
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


  // Toggles selection of all bills on the current page
  const handleSelectAll = (checked) => {
    if (checked) {
      const pageIds = billings.map((b) => b.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    } else {
      const pageIds = billings.map((b) => b.id);
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    }
  };

  // Runs an API call for every selected bill and reports how many failed
  const runForSelected = async (fn) => {
    const ids = [...selectedIds];
    const results = await Promise.allSettled(ids.map(fn));
    return { total: ids.length, failed: results.filter((r) => r.status === 'rejected').length };
  };

  // Updates status for all selected bills
  const handleBulkStatusChange = async (targetStatus) => {
    if (!targetStatus || targetStatus === 'placeholder') return;
    const { total, failed } = await runForSelected((id) => billsApi.updateStatus(id, targetStatus));
    if (failed) toast.error(`${failed} of ${total} bills could not be updated`);
    else toast.success(`Updated ${total} bills to status "${targetStatus}"`);
    setSelectedIds([]);
    loadBills();
  };

  // Deletes all selected bill records
  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const { total, failed } = await runForSelected((id) => billsApi.remove(id));
      if (failed) toast.error(`${failed} of ${total} bills could not be deleted`);
      else toast.success(`Deleted ${total} bills`);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      loadBills();
    } finally {
      setIsDeleting(false);
    }
  };

  // Deletes a single target bill record
  const handleSingleDelete = async () => {
    if (!singleDeleteTarget) return;
    setIsDeleting(true);
    try {
      await billsApi.remove(singleDeleteTarget.id);
      toast.success(`Bill ${singleDeleteTarget.did || singleDeleteTarget.title} deleted`);
      setSingleDeleteTarget(null);
      loadBills();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to delete bill'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'did',
      header: 'Bill Ref / DID',
      className: 'w-[150px]',
      render: (b) => (
        <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{b.did || b.invoiceId}</span>
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Title / Payee',
      render: (b) => (
        <>
          <span className="block truncate text-xs font-semibold text-foreground">{b.title}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{b.vendor || b.customerName}</span>
        </>
      ),
    },
    {
      key: 'asset',
      header: 'Asset',
      className: 'w-[150px]',
      render: (b) => <span className="block truncate text-xs text-muted-foreground">{b.projectName || 'Plexivia'}</span>,
    },
    {
      key: 'billType',
      header: 'Type',
      className: 'w-[150px]',
      render: (b) => (
        <Badge
          variant="outline"
          className={`text-[11px] font-medium ${
            b.billType === 'Investment Return'
              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
              : 'bg-muted/40'
          }`}
        >
          {b.billType}
        </Badge>
      ),
    },
    {
      key: 'billingDate',
      header: 'Billing Date',
      className: 'w-[120px]',
      render: (b) => <span className="text-xs text-muted-foreground">{b.billingDate || b.date}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      className: 'w-[120px]',
      render: (b) => <span className="text-xs text-muted-foreground">{b.dueDate || '—'}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      className: 'w-[150px]',
      align: 'right',
      render: (b) => (
        <>
          <span className="block text-xs font-bold tabular-nums text-foreground">{formatCurrency(b.totalAmount)}</span>
          {b.feeAmount > 0 && (
            <span className="block truncate text-[10px] text-muted-foreground">
              Bill {formatCurrency(b.billAmount)} + charge {formatCurrency(b.feeAmount)}
            </span>
          )}
        </>
      ),
    },
    {
      key: 'paid',
      header: 'Paid / Pending',
      className: 'w-[150px]',
      render: (b) => (
        <span className="text-xs">
          <span className="font-semibold text-emerald-600">{formatCurrency(b.paidAmount)}</span>
          {b.pendingAmount > 0 && (
            <span className="ml-1 text-[10px] text-muted-foreground">({formatCurrency(b.pendingAmount)} due)</span>
          )}
        </span>
      ),
    },
    { key: 'status', header: 'Status', className: 'w-[120px]', render: (b) => getStatusBadge(b.status) },
  ];

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {t('accounts.all_bills_title', 'All Bills')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {t('accounts.all_bills_subtitle', 'Manage company invoices, vendor expenses, utilities, and operational costs.')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            asChild
            className="h-9 text-xs gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/accounts/bills/new">
              <PlusCircle className="w-4 h-4" />
              <span>{t('accounts.add_bill_btn', 'Add New Bill')}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Billed</p>
            <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">{formatCurrency(summary.totalBilled)}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Paid Volume</p>
            <p className="text-xl font-bold tracking-tight text-emerald-600 mt-0.5">{formatCurrency(summary.totalPaid)}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Pending Dues</p>
            <p className="text-xl font-bold tracking-tight text-amber-600 mt-0.5">{formatCurrency(summary.totalPending)}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b bg-muted/20 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search_placeholder', 'Search by title, DID, vendor...')}
              className="pl-9 h-9 text-xs"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length === 0 ? (
              <>
                <AssetFilter value={assetFilter} onChange={handleAssetFilter} />

                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="h-9 text-xs w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                    <SelectItem value="Active">Active (Unpaid)</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={billTypeFilter} onValueChange={handleBillTypeFilter}>
                  <SelectTrigger className="h-9 text-xs w-[150px]">
                    <SelectValue placeholder="Bill Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    {allBillTypes.map((bt) => (
                      <SelectItem key={bt.id} value={bt.name}>
                        {bt.name}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="Paid">Mark as Paid</SelectItem>
                    <SelectItem value="Pending">Mark as Pending</SelectItem>
                    <SelectItem value="Partial">Mark as Partial</SelectItem>
                    <SelectItem value="Returned">Mark as Returned</SelectItem>
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
          rows={billings}
          isLoading={isLoading}
          error={isError ? 'Failed to load bills data. Please click refresh.' : null}
          emptyText='No bills found matching your filter criteria.'
          selection={selection}
          onRowClick={(b) => setViewBillTarget(b)}
          rowActions={(b) => [
            { label: 'View Details', icon: Eye, onClick: () => setViewBillTarget(b) },
            { label: 'Edit Bill', icon: Edit, onClick: () => navigate(`/accounts/bills/new?edit=${b.id}`) },
            { label: 'Delete Bill', icon: Trash2, destructive: true, separatorBefore: true, onClick: () => setSingleDeleteTarget(b) },
          ]}
        />

        <FilteredTotals
          count={billings.length}
          items={[
            { label: 'Billed', value: formatCurrency(summary.totalBilled) },
            { label: 'Paid', value: formatCurrency(summary.totalPaid), className: 'text-emerald-600' },
            { label: 'Due', value: formatCurrency(summary.totalPending), className: 'text-amber-600' },
          ]}
        />

        <TablePaginationV2
          className="rounded-none border-0 border-t"
          page={currentPage}
          totalPages={totalPages}
          total={billings.length}
          pageSize={pageSize}
          setPage={(p) => {
            setCurrentPage(p);
            selection.clear();
          }}
          setPageSize={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          shownCount={billings.length}
        />
      </div>

      <RecordQuickView
        open={!!viewBillTarget}
        onClose={() => setViewBillTarget(null)}
        title={viewBillTarget?.title || 'Bill'}
        description={viewBillTarget?.did || viewBillTarget?.id}
        printLabel="Print Slip"
        defaultPhone={viewBillTarget?.payeePhone}
        defaultEmail={viewBillTarget?.payeeEmail}
        onEdit={() => {
          const id = viewBillTarget?.id;
          setViewBillTarget(null);
          navigate(`/accounts/bills/new?edit=${id}`);
        }}
        editLabel="Edit Bill"
        slip={
          viewBillTarget && {
            heading: 'Bill Slip',
            reference: viewBillTarget.did || viewBillTarget.id,
            rows: [
              { label: 'Title / Payee', value: viewBillTarget.title },
              { label: 'Asset', value: viewBillTarget.projectName || 'Plexivia' },
              { label: 'Vendor', value: viewBillTarget.vendor },
              { label: 'Bill Type', value: viewBillTarget.billType },
              ...(viewBillTarget.lineItems || []).map((li) => ({
                label: li.quantity ? `${li.label} (${li.quantity})` : li.label,
                value: formatCurrency(li.amount),
              })),
              { label: 'Investor', value: viewBillTarget.investorName },
              { label: 'Billing Date', value: viewBillTarget.billingDate || viewBillTarget.date },
              { label: 'Due Date', value: viewBillTarget.dueDate || 'Immediate' },
              { label: 'Payment Method', value: viewBillTarget.billingMethod },
              { label: 'Status', value: viewBillTarget.status },
            ],
            totals: [
              ...(viewBillTarget.feeAmount > 0
                ? [
                    { label: 'Bill Amount', value: formatCurrency(viewBillTarget.billAmount) },
                    { label: 'Payment Charge', value: formatCurrency(viewBillTarget.feeAmount) },
                  ]
                : []),
              { label: 'Paid', value: formatCurrency(viewBillTarget.paidAmount) },
              { label: 'Pending', value: formatCurrency(viewBillTarget.pendingAmount) },
              { label: 'Total', value: formatCurrency(viewBillTarget.totalAmount) },
            ],
            notes: viewBillTarget.notes,
          }
        }
      >
        {viewBillTarget && (
          <>
          <QuickViewSection title="Details">
            <QuickViewLine label="Asset" value={viewBillTarget.projectName || 'Plexivia'} />
            <QuickViewLine label="Vendor" value={viewBillTarget.vendor} />
            <QuickViewLine label="Bill Type" value={viewBillTarget.billType} />
            {viewBillTarget.investorName && <QuickViewLine label="Investor" value={viewBillTarget.investorName} />}
            <QuickViewLine label="Billing Date" value={viewBillTarget.billingDate || viewBillTarget.date} />
            <QuickViewLine label="Due Date" value={viewBillTarget.dueDate || 'Immediate'} />
            <QuickViewLine label="Payment Method" value={viewBillTarget.billingMethod} />
            <QuickViewLine label="Status" value={getStatusBadge(viewBillTarget.status)} />
          </QuickViewSection>
          {viewBillTarget.lineItems?.length > 0 && (
            <QuickViewSection title="Breakdown">
              {viewBillTarget.lineItems.map((li) => (
                <QuickViewLine
                  key={li.label}
                  label={li.quantity ? `${li.label} (${li.quantity})` : li.label}
                  value={formatCurrency(li.amount)}
                />
              ))}
            </QuickViewSection>
          )}
          <QuickViewSection title="Amount">
            {viewBillTarget.feeAmount > 0 && (
              <>
                <QuickViewLine label="Bill Amount" value={formatCurrency(viewBillTarget.billAmount)} />
                <QuickViewLine
                  label={`Payment Charge${viewBillTarget.paymentFee?.name ? ` (${viewBillTarget.paymentFee.name})` : ''}`}
                  value={formatCurrency(viewBillTarget.feeAmount)}
                />
              </>
            )}
            <QuickViewLine label="Total Deducted" value={formatCurrency(viewBillTarget.totalAmount)} className="font-semibold" />
            <QuickViewLine label="Paid So Far" value={<span className="text-emerald-600">{formatCurrency(viewBillTarget.paidAmount)}</span>} />
            <QuickViewLine label="Outstanding" value={<span className="text-amber-600">{formatCurrency(viewBillTarget.pendingAmount)}</span>} className="border-t pt-2" />
          </QuickViewSection>
          {viewBillTarget.attachments?.length > 0 && (
            <QuickViewSection title="Attachments">
              {viewBillTarget.attachments.map((file) => (
                <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.name || file.url.split('/').pop()}</span>
                </a>
              ))}
            </QuickViewSection>
          )}
          {viewBillTarget.notes && (
            <QuickViewSection title="Notes">
              <p className="whitespace-pre-wrap text-muted-foreground">{viewBillTarget.notes}</p>
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
        title="Delete Selected Bills"
        description={`Delete the ${selectedIds.length} selected bills? They are deactivated and hidden, not permanently removed.`}
      />

      <ConfirmDeleteDialog
        open={!!singleDeleteTarget}
        onOpenChange={(open) => !open && setSingleDeleteTarget(null)}
        onConfirm={handleSingleDelete}
        isDeleting={isDeleting}
        title="Delete Bill"
        description={`Are you sure you want to delete bill "${singleDeleteTarget?.title}" (${singleDeleteTarget?.did || singleDeleteTarget?.id})?`}
      />
    </div>
  );
};

export default AllBillsPage;
