import React, { useMemo, useState } from 'react';
import { TableV2, TablePaginationV2, useRowSelection } from '@/components/table/versionTwo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, CheckCircle2, XCircle, Clock, Trash2, MoreHorizontal } from 'lucide-react';
import { EXPORT_BUTTON_CLASS } from '@/lib/export-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

const METHOD_COLORS = {
  bKash: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
  Nagad: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  Cash: 'bg-green-500/10 text-green-600 border-green-500/30',
  Card: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

// Returns badge component corresponding to payment status
const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1" variant="outline">
          <CheckCircle2 className="h-3 w-3" />Completed
        </Badge>
      );
    case 'Pending':
      return (
        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1" variant="outline">
          <Clock className="h-3 w-3" />Pending
        </Badge>
      );
    case 'Failed':
      return (
        <Badge className="bg-red-500/15 text-red-600 border-red-500/30 gap-1" variant="outline">
          <XCircle className="h-3 w-3" />Failed
        </Badge>
      );
    default:
      return null;
  }
};

// Returns badge component corresponding to payment method
const getMethodBadge = (method) => {
  const cls = METHOD_COLORS[method] ?? 'bg-muted text-muted-foreground';
  return <Badge className={`${cls} gap-1`} variant="outline">{method}</Badge>;
};

// Renders the payments transaction management page (API integration placeholder: fetch, bulk update, and delete payment records)
export const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const selection = useRowSelection();
  const selectedIds = selection.ids;
  const setSelectedIds = selection.setIds;
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState(null);
  const [isSingleDeleting, setIsSingleDeleting] = useState(false);

  const [payments, setPayments] = useState([]);
  const isLoading = false;
  const isError = false;
  const totalPages = 1;

  const { totalCollected, totalPending, totalFailed } = useMemo(() => {
    const collected = payments
      .filter((p) => p.status === 'Completed')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const pending = payments
      .filter((p) => p.status === 'Pending')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const failed = payments
      .filter((p) => p.status === 'Failed')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    return { totalCollected: collected, totalPending: pending, totalFailed: failed };
  }, [payments]);

  // Updates search query filter and resets pagination and selection
  const handleSearch = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Updates payment method filter and resets pagination and selection
  const handleMethodFilter = (v) => {
    setMethodFilter(v ?? 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Updates payment status filter and resets pagination and selection
  const handleStatusFilter = (v) => {
    setStatusFilter(v ?? 'All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Exports selected payment records (API integration placeholder: GET /api/v1/payments/export)
  const handleBulkExport = () => {
    toast.info(`Exporting ${selectedIds.length} payments...`);
  };

  // Performs bulk status change on selected payments (API integration placeholder: POST /api/v1/payments/bulk-update)
  const handleBulkStatusChange = async (targetStatus) => {
    if (!targetStatus || targetStatus === 'placeholder') return;
    setPayments((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: targetStatus } : p))
    );
    toast.success(`Updated ${selectedIds.length} payments to status "${targetStatus}".`);
    setSelectedIds([]);
  };

  // Performs bulk deletion of selected payment records (API integration placeholder: POST /api/v1/payments/bulk-delete)
  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      setPayments((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      toast.success(`Successfully deleted ${selectedIds.length} selected payment records.`);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Deletes a single payment record (API integration placeholder: DELETE /api/v1/payments/:id)
  const handleSingleDelete = async () => {
    if (!singleDeleteTarget) return;
    setIsSingleDeleting(true);
    try {
      setPayments((prev) => prev.filter((p) => p.id !== singleDeleteTarget.id));
      toast.success(`Payment record ${singleDeleteTarget.invoiceId} deleted successfully.`);
      setSingleDeleteTarget(null);
    } finally {
      setIsSingleDeleting(false);
    }
  };


  const columns = [
    {
      key: 'invoiceId',
      header: 'Invoice',
      className: 'w-[150px]',
      render: (p) => <span className="block truncate font-mono text-xs text-muted-foreground">{p.invoiceId}</span>,
    },
    { key: 'customerName', header: 'Customer' },
    { key: 'method', header: 'Method', className: 'w-[120px]', render: (p) => getMethodBadge(p.method) },
    { key: 'date', header: 'Date', className: 'w-[130px]' },
    {
      key: 'amount',
      header: 'Amount',
      className: 'w-[130px]',
      align: 'right',
      render: (p) => <span className="font-semibold tabular-nums text-foreground">৳{Number(p.amount || 0).toLocaleString()}</span>,
    },
    { key: 'status', header: 'Status', className: 'w-[130px]', render: (p) => getStatusBadge(p.status) },
  ];

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all payment transactions</p>
        </div>
        <Button variant="outline" className={EXPORT_BUTTON_CLASS} onClick={handleBulkExport}>
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-card border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-xl font-bold">৳{totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-xl font-bold">৳{totalPending.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-xl font-bold">৳{totalFailed.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-muted/30 items-center justify-between">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, payment ID or invoice..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            {selectedIds.length === 0 ? (
              <>
                <Select value={methodFilter} onValueChange={handleMethodFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Methods</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="bKash">bKash</SelectItem>
                    <SelectItem value="Nagad">Nagad</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap mr-1">
                  {selectedIds.length} selected:
                </span>
                <Button
                  variant="outline"
                  onClick={handleBulkExport}
                  className={EXPORT_BUTTON_CLASS}
                >
                  <Download className="size-4" />
                  Export
                </Button>
                <Select value="placeholder" onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="w-[140px] h-9 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    <SelectValue placeholder="Bulk Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled className="hidden">Bulk Status</SelectItem>
                    <SelectItem value="Completed">Completed (Paid)</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setBulkDeleteOpen(true)}
                  className="h-9 w-9 flex items-center justify-center shrink-0"
                  title={`Delete Selected (${selectedIds.length})`}
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
          error={isError ? 'Failed to load payments. Please refresh the page.' : null}
          emptyText='No payments found.'
          selection={selection}
          rowActions={(p) => [{ label: 'Delete Payment', icon: Trash2, destructive: true, onClick: () => setSingleDeleteTarget({ id: p.id, invoiceId: p.invoiceId }) }]}
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

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkDeleting}
        title="Delete Selected Payments"
        description={`Are you sure you want to permanently delete the ${selectedIds.length} selected payment records? This action cannot be undone.`}
      />

      <ConfirmDeleteDialog
        open={!!singleDeleteTarget}
        onOpenChange={(open) => !open && setSingleDeleteTarget(null)}
        onConfirm={handleSingleDelete}
        isDeleting={isSingleDeleting}
        title="Delete Payment Record"
        description={`Are you sure you want to delete payment record ${singleDeleteTarget?.invoiceId ?? ''}?`}
      />
    </div>
  );
};

export default PaymentsPage;
