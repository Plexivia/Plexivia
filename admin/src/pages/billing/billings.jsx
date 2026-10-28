import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { EXPORT_BUTTON_CLASS } from '@/lib/export-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TableV2, TablePaginationV2, useRowSelection } from '@/components/table/versionTwo';
import { toast } from 'sonner';

// Renders the bills and invoices management page with status filtering and export (API integration placeholder: fetch and export invoices)
export const BillingsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const selection = useRowSelection();
  const selectedIds = selection.ids;

  const invoices = useMemo(() => [], []);
  const isLoading = false;
  const isError = false;
  const totalPages = 1;
  const totalCount = invoices.length;

  // Updates search query filter and resets pagination and selection
  const handleSearch = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
    selection.clear();
  };

  // Updates status filter and resets pagination and selection
  const handleStatusFilter = (v) => {
    setStatusFilter(v ?? 'All');
    setCurrentPage(1);
    selection.clear();
  };

  // Exports selected invoices (API integration placeholder: GET /api/v1/billings/export)
  const handleBulkExport = () => {
    toast.info(`Exporting ${selectedIds.length} invoice(s)...`);
  };

  // Returns status badge component based on invoice status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1" variant="outline">
            <CheckCircle2 className="h-3 w-3" />{t('orders.status_paid', 'Paid')}
          </Badge>
        );
      case 'Pending':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1" variant="outline">
            <Clock className="h-3 w-3" />{t('orders.status_pending', 'Pending')}
          </Badge>
        );
      case 'Failed':
        return (
          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 gap-1" variant="outline">
            <XCircle className="h-3 w-3" />{t('common.error', 'Failed')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const columns = [
    {
      key: 'invoiceId',
      header: t('orders.order_id', 'Invoice ID'),
      className: 'w-[160px]',
      render: (inv) => (
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{inv.invoiceId}</span>
        </span>
      ),
    },
    { key: 'customerName', header: t('orders.customer', 'Customer') },
    { key: 'date', header: t('common.date', 'Date'), className: 'w-[130px]' },
    { key: 'dueDate', header: t('common.time', 'Due Date'), className: 'w-[130px]' },
    {
      key: 'amount',
      header: t('common.amount', 'Amount'),
      className: 'w-[130px]',
      align: 'right',
      render: (inv) => <span className="font-semibold tabular-nums text-foreground">৳{Number(inv.amount || 0).toLocaleString()}</span>,
    },
    { key: 'status', header: t('common.status', 'Status'), className: 'w-[130px]', render: (inv) => getStatusBadge(inv.status) },
  ];

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.invoices', 'Invoices')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('admin.billing', 'Billing & Invoices')}</p>
        </div>
        <Button variant="outline" className={EXPORT_BUTTON_CLASS} onClick={handleBulkExport}>
          <Download className="size-4" />
          {t('common.export', 'Export')}
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search_placeholder', 'Search invoices...')}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                onClick={handleBulkExport}
                className={EXPORT_BUTTON_CLASS}
              >
                <Download className="size-4" />
                {t('common.export', 'Export')} ({selectedIds.length})
              </Button>
            )}
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('common.status', 'Status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">{t('common.all', 'All')}</SelectItem>
                <SelectItem value="Paid">{t('orders.status_paid', 'Paid')}</SelectItem>
                <SelectItem value="Pending">{t('orders.status_pending', 'Pending')}</SelectItem>
                <SelectItem value="Failed">{t('common.error', 'Failed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TableV2
          columns={columns}
          rows={invoices}
          isLoading={isLoading}
          error={isError ? t('common.error', 'Error loading invoices') : null}
          emptyText={t('common.no_data', 'No invoices found.')}
          selection={selection}
          rowActions={() => [{ label: t('common.export', 'Download'), icon: Download, onClick: handleBulkExport }]}
        />
      </div>

      <TablePaginationV2
        page={currentPage}
        totalPages={totalPages}
        total={totalCount}
        pageSize={pageSize}
        setPage={(p) => {
          setCurrentPage(p);
          selection.clear();
        }}
        setPageSize={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        shownCount={invoices.length}
      />
    </div>
  );
};

export default BillingsPage;
