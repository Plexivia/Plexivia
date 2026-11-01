import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TableV2, TablePaginationV2, useRowSelection } from '@/components/table/versionTwo';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Lock,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { DateRangeFilter } from '@/components/dashboard/accounts/DateRangeFilter';
import { toast } from 'sonner';
import { formatDate } from '@/utils/dateHelper';
import { SOURCE_LINK_TYPES, getSourceLinkLabel } from '@/components/dashboard/accounts/paymentSources';
import { apiErrorMessage, paymentSourcesApi } from '@/services/paymentsApi';

const EMPTY_FORM = { name: '', description: '', linkType: 'none', status: 'Active' };

// Renders the Payment Sources management page (API integration placeholder: fetch, create, update, and delete payment sources)
export const PaymentSourcesPage = () => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '', preset: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const selection = useRowSelection();
  const selectedIds = selection.ids;
  const setSelectedIds = selection.setIds;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [sourceForm, setSourceForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const totalPages = 1;

  const loadSources = useCallback(async () => {
    setIsLoading(true);
    try {
      setSources(await paymentSourcesApi.list());
      setLoadError(null);
    } catch (error) {
      setLoadError(apiErrorMessage(error, 'Failed to load payment sources.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const visibleSources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sources.filter(
      (s) =>
        (statusFilter === 'All' || s.status === statusFilter) &&
        (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
    );
  }, [sources, searchQuery, statusFilter]);

  const editableSelection = () => sources.filter((s) => selectedIds.includes(s.id) && !s.system);

  // Updates status for all selected sources except the built-in one
  const handleBulkStatusChange = async (targetStatus) => {
    if (!targetStatus || targetStatus === 'placeholder' || selectedIds.length === 0) return;
    const targets = editableSelection();
    const results = await Promise.allSettled(targets.map((s) => paymentSourcesApi.update(s.id, { ...s, status: targetStatus })));
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed) toast.error(`${failed} of ${targets.length} sources could not be updated`);
    else toast.success(`Updated ${targets.length} payment sources to "${targetStatus}"`);
    setSelectedIds([]);
    loadSources();
  };

  // Deletes all selected sources except the built-in one
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const targets = editableSelection();
      const results = await Promise.allSettled(targets.map((s) => paymentSourcesApi.remove(s.id)));
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed) toast.error(`${failed} of ${targets.length} sources could not be deleted`);
      else toast.success(`Deleted ${targets.length} payment sources`);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      loadSources();
    } finally {
      setIsDeleting(false);
    }
  };

  // Opens modal dialog to add a new payment source
  const handleOpenAdd = () => {
    setEditingSource(null);
    setSourceForm(EMPTY_FORM);
    setModalOpen(true);
  };

  // Opens modal dialog pre-populated with an existing source for editing
  const handleOpenEdit = (source) => {
    setEditingSource(source);
    setSourceForm({
      name: source.name || '',
      description: source.description || '',
      linkType: source.linkType || 'none',
      status: source.status || 'Active',
    });
    setModalOpen(true);
  };

  // Saves a new or edited payment source (API integration placeholder: POST / PUT /api/v1/payment-sources)
  const handleSave = async (e) => {
    e.preventDefault();
    const name = sourceForm.name.trim();
    if (!name) {
      toast.error('Source name is required');
      return;
    }
    if (sources.some((s) => s.id !== editingSource?.id && s.name.trim().toLowerCase() === name.toLowerCase())) {
      toast.error('A payment source with this name already exists');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSource) {
        // The server ignores everything but the description for the built-in Client source
        await paymentSourcesApi.update(editingSource.id, { ...sourceForm, name });
        toast.success('Payment source updated');
      } else {
        await paymentSourcesApi.create({ ...sourceForm, name });
        toast.success('Payment source created');
      }
      setModalOpen(false);
      loadSources();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to save payment source'));
    } finally {
      setIsSaving(false);
    }
  };

  // Deletes a single payment source; the built-in Client source cannot be deleted
  const handleDelete = async () => {
    if (!deleteTarget || deleteTarget.system) return;
    setIsDeleting(true);
    try {
      await paymentSourcesApi.remove(deleteTarget.id);
      toast.success('Payment source deleted');
      setDeleteTarget(null);
      loadSources();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to delete payment source'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Source Name',
      className: 'w-[200px]',
      render: (source) => (
        <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <span className="size-2 shrink-0 rounded-full bg-primary" />
          <span className="truncate">{source.name}</span>
          {source.system && <Lock className="size-3 shrink-0 text-muted-foreground" aria-label="Built-in" />}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (source) => <span className="block truncate text-xs text-muted-foreground">{source.description || '—'}</span>,
    },
    {
      key: 'linkType',
      header: 'Payer Selection',
      className: 'w-[150px]',
      render: (source) => (
        <Badge
          variant="outline"
          className={source.linkType === 'client' ? 'text-[11px] bg-sky-500/10 text-sky-600 border-sky-500/30' : 'text-[11px] bg-muted/40'}
        >
          {getSourceLinkLabel(source.linkType)}
        </Badge>
      ),
    },
    {
      key: 'linkedPaymentsCount',
      header: 'Payments',
      className: 'w-[110px]',
      render: (source) => (
        <Badge variant="outline" className="text-[11px] bg-muted/40">
          {source.linkedPaymentsCount || 0} payments
        </Badge>
      ),
    },
    {
      key: 'totalReceived',
      header: 'Total Received',
      className: 'w-[140px]',
      align: 'right',
      render: (source) => (
        <span className="font-mono text-xs font-bold tabular-nums text-foreground">৳{(source.totalReceived || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[120px]',
      render: (source) => {
        const isActive = source.status === 'Active';
        return (
          <Badge
            variant="outline"
            className={isActive ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-muted text-muted-foreground'}
          >
            {isActive ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
            {source.status}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      className: 'w-[130px]',
      render: (source) => <span className="text-xs text-muted-foreground">{source.createdAt ? formatDate(source.createdAt) : '—'}</span>,
    },
  ];

  const activeHint = SOURCE_LINK_TYPES.find((lt) => lt.value === sourceForm.linkType)?.hint;

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {t('accounts.payment_sources_title', 'Payment Sources')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {t('accounts.payment_sources_subtitle', 'Define where incoming payments come from: clients, your own businesses, investors, or anyone else.')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleOpenAdd}
            className="h-9 text-xs gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('accounts.add_payment_source_btn', 'Add Payment Source')}</span>
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b bg-muted/20 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payment sources..."
              className="pl-9 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
                setSelectedIds([]);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length === 0 ? (
              <>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v || 'All');
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <DateRangeFilter
                  value={dateRange.preset}
                  onChange={(range) => {
                    setDateRange(range);
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                />
              </>
            ) : (
              <>
                <span className="text-xs font-semibold text-muted-foreground mr-1">
                  {selectedIds.length} selected:
                </span>
                <Select value="placeholder" onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="h-9 text-xs w-[140px] border-primary/30 bg-primary/5 text-primary">
                    <SelectValue placeholder="Bulk Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled className="hidden">
                      Bulk Status
                    </SelectItem>
                    <SelectItem value="Active">Mark as Active</SelectItem>
                    <SelectItem value="Inactive">Mark as Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setBulkDeleteOpen(true)}
                  className="h-9 w-9 shrink-0 cursor-pointer"
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
          rows={visibleSources}
          isLoading={isLoading}
          error={loadError}
          emptyText="No payment sources found matching your query."
          selection={selection}
          onRowClick={(source) => handleOpenEdit(source)}
          rowActions={(source) => [
            { label: 'Edit Source', icon: Edit, onClick: () => handleOpenEdit(source) },
            ...(source.system
              ? []
              : [{ label: 'Delete Source', icon: Trash2, destructive: true, separatorBefore: true, onClick: () => setDeleteTarget(source) }]),
          ]}
        />

        <TablePaginationV2
          className="rounded-none border-0 border-t"
          page={currentPage}
          totalPages={totalPages}
          total={visibleSources.length}
          pageSize={pageSize}
          setPage={(p) => {
            setCurrentPage(p);
            selection.clear();
          }}
          setPageSize={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          shownCount={visibleSources.length}
        />
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              {editingSource ? 'Edit Payment Source' : 'Create New Payment Source'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingSource?.system
                ? 'Client is a built-in source: payments from it are linked to a client and project. Only the description can change.'
                : 'A source tells who a payment came from, e.g. a client, your own business, or an investor.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Source Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Plexivia Ltd, Investor, Loan"
                value={sourceForm.name}
                onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                className="text-xs"
                disabled={editingSource?.system}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Description</label>
              <Input
                placeholder="Brief description of this source..."
                value={sourceForm.description}
                onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Payer Selection</label>
              <Select
                value={sourceForm.linkType}
                onValueChange={(v) => setSourceForm({ ...sourceForm, linkType: v })}
                disabled={editingSource?.system}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Payer selection">{getSourceLinkLabel(sourceForm.linkType)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_LINK_TYPES.map((lt) => (
                    <SelectItem key={lt.value} value={lt.value}>
                      {lt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeHint && <p className="text-[11px] text-muted-foreground">{activeHint}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Status</label>
              <Select
                value={sourceForm.status}
                onValueChange={(v) => setSourceForm({ ...sourceForm, status: v })}
                disabled={editingSource?.system}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="cancel" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingSource ? 'Update Source' : 'Save Source'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Payment Source"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Existing payments from this source will remain intact.`}
      />

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
        title={`Delete ${selectedIds.length} Selected Sources?`}
        description="The built-in Client source is always kept. Existing payments from the deleted sources will remain intact."
      />
    </div>
  );
};

export default PaymentSourcesPage;
