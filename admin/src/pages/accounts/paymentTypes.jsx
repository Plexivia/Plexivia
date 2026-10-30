import React, { useState, useMemo } from 'react';
import { TableV2, TablePaginationV2, useRowSelection } from '@/components/table/versionTwo';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  Building2,
  Smartphone,
  Banknote,
  SlidersHorizontal,
  Info,
  Layers,
  Sparkles,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { DateRangeFilter } from '@/components/dashboard/accounts/DateRangeFilter';
import { toast } from 'sonner';
import { PaymentFeesEditor, cleanFees, formatFeeRate } from '@/components/dashboard/accounts/PaymentFeesEditor';

const CATEGORY_OPTIONS = [
  { value: 'mfs', label: 'MFS / Mobile Wallet', icon: Smartphone, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
  { value: 'bank', label: 'Bank Account', icon: Landmark, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { value: 'cash', label: 'Cash / COD', icon: Banknote, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'card', label: 'Card / POS Terminal', icon: CreditCard, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { value: 'gateway', label: 'Online Gateway', icon: Sparkles, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { value: 'other', label: 'Other Method', icon: Layers, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
];

const INITIAL_FORM = {
  name: '',
  category: 'mfs',
  provider: 'bKash',
  accountNumber: '',
  accountName: '',
  accountType: 'Personal',
  branchName: '',
  routingNumber: '',
  chargePercent: 0,
  hasFees: false,
  fees: [],
  instructions: '',
  description: '',
  status: 'Active',
  isDefault: false,
};

// Renders the Payment Methods and Types management page (API integration placeholder: fetch, create, update, delete payment methods)
export const PaymentTypesPage = () => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '', preset: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [copiedId, setCopiedId] = useState(null);
  const selection = useRowSelection();
  const selectedIds = selection.ids;
  const setSelectedIds = selection.setIds;

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingMethod, setViewingMethod] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [paymentTypes, setPaymentTypes] = useState([]);
  const allPayments = useMemo(() => [], []);
  const isLoading = false;
  const isAdding = false;
  const isUpdating = false;
  const isDeleting = false;
  const isBulkDeleting = false;
  const totalPages = 1;

  const typeStats = useMemo(() => {
    const counts = {};
    const volumes = {};
    allPayments.forEach((p) => {
      const type = p.paymentMethod || p.method || 'General';
      counts[type] = (counts[type] || 0) + 1;
      volumes[type] = (volumes[type] || 0) + (Number(p.amount || p.totalAmount || p.paidAmount) || 0);
    });
    return { counts, volumes };
  }, [allPayments]);

  const summaryStats = useMemo(() => {
    const total = paymentTypes.length;
    const active = paymentTypes.filter((item) => item.status === 'Active').length;
    const mfs = paymentTypes.filter((item) => item.category === 'mfs').length;
    const bank = paymentTypes.filter((item) => item.category === 'bank').length;
    const totalVolume = Object.values(typeStats.volumes).reduce((acc, v) => acc + v, 0);
    return { total, active, mfs, bank, totalVolume };
  }, [paymentTypes, typeStats]);


  // Toggles selection state for all payment methods on the current page
  const handleSelectAll = (checked) => {
    if (checked) {
      const pageIds = paymentTypes.map((item) => item.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    } else {
      const pageIds = paymentTypes.map((item) => item.id);
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    }
  };

  // Updates status for all selected payment methods (API integration placeholder: PATCH /api/v1/payment-types/bulk)
  const handleBulkStatusChange = async (targetStatus) => {
    if (!targetStatus || targetStatus === 'placeholder' || selectedIds.length === 0) return;
    setPaymentTypes((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: targetStatus } : item))
    );
    toast.success(`Updated ${selectedIds.length} payment method(s) to ${targetStatus}`);
    setSelectedIds([]);
  };

  // Deletes all selected payment methods (API integration placeholder: DELETE /api/v1/payment-types/bulk)
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setPaymentTypes((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    toast.success(`Deleted ${selectedIds.length} payment method(s)`);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  // Copies account number text to clipboard
  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Opens modal dialog to create a new payment method
  const handleOpenAdd = () => {
    setEditingType(null);
    setTypeForm(INITIAL_FORM);
    setModalOpen(true);
  };

  // Opens modal dialog populated with an existing payment method for editing
  const handleOpenEdit = (type) => {
    setEditingType(type);
    setTypeForm({
      name: type.name || '',
      category: type.category || 'mfs',
      provider: type.provider || '',
      accountNumber: type.accountNumber || '',
      accountName: type.accountName || '',
      accountType: type.accountType || 'Personal',
      branchName: type.branchName || '',
      routingNumber: type.routingNumber || '',
      chargePercent: type.chargePercent ?? 0,
      hasFees: (type.fees || []).length > 0,
      fees: (type.fees || []).map((fee) => ({ ...fee })),
      instructions: type.instructions || '',
      description: type.description || '',
      status: type.status || 'Active',
      isDefault: Boolean(type.isDefault),
    });
    setModalOpen(true);
  };

  // Opens modal dialog showing full payment method details
  const handleOpenDetails = (type) => {
    setViewingMethod(type);
    setDetailsModalOpen(true);
  };

  // Validates and saves a new or edited payment method (API integration placeholder: POST/PUT /api/v1/payment-types)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!typeForm.name.trim()) {
      toast.error('Payment method name is required');
      return;
    }

    const fees = typeForm.hasFees ? cleanFees(typeForm.fees) : [];
    if (typeForm.hasFees && fees.length === 0) {
      toast.error('Enter a name for at least one fee, or untick "Add charge / fee"');
      return;
    }
    if (typeForm.hasFees && !String(typeForm.fees?.[0]?.name || '').trim()) {
      toast.error('The first fee row needs a name');
      return;
    }

    const { hasFees, ...formFields } = typeForm;
    const payload = {
      ...formFields,
      fees,
      chargePercent: fees[0]?.percent || 0,
      chargeFixed: fees[0]?.fixed || 0,
    };

    if (editingType) {
      setPaymentTypes((prev) =>
        prev.map((item) => (item.id === editingType.id ? { ...item, ...payload } : item))
      );
      toast.success('Payment method updated');
    } else {
      setPaymentTypes((prev) => [...prev, { id: `pm-${Date.now()}`, ...payload }]);
      toast.success('Payment method created');
    }
    setModalOpen(false);
  };

  // Deletes a single payment method record (API integration placeholder: DELETE /api/v1/payment-types/:id)
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setPaymentTypes((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    toast.success('Payment method deleted');
    setDeleteTarget(null);
  };

  // Returns styled category badge with icon for the given category key
  const getCategoryBadge = (categoryKey) => {
    const config = CATEGORY_OPTIONS.find((c) => c.value === categoryKey) || CATEGORY_OPTIONS[0];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`text-[11px] font-medium gap-1 px-2 py-0.5 border ${config.color}`}>
        <Icon className="w-3 h-3 inline" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const columns = [
    {
      key: 'name',
      header: 'Payment Method',
      className: 'w-[230px]',
      render: (type) => (
        <span className="flex min-w-0 items-center gap-2.5 text-xs">
          <span className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
            {type.category === 'bank' ? (
              <Landmark className="w-3.5 h-3.5" />
            ) : type.category === 'cash' ? (
              <Banknote className="w-3.5 h-3.5" />
            ) : type.category === 'mfs' ? (
              <Smartphone className="w-3.5 h-3.5" />
            ) : (
              <CreditCard className="w-3.5 h-3.5" />
            )}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-foreground">{type.name}</span>
              {type.isDefault && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border border-primary/20">
                  Default
                </Badge>
              )}
            </span>
            {type.provider && (
              <span className="block truncate text-[11px] text-muted-foreground">
                Provider: <span className="font-medium text-foreground/80">{type.provider}</span>
              </span>
            )}
          </span>
        </span>
      ),
    },
    { key: 'category', header: 'Category', className: 'w-[130px]', render: (type) => getCategoryBadge(type.category) },
    {
      key: 'account',
      header: 'Account / Wallet Details',
      stopClick: true,
      render: (type) =>
        type.accountNumber ? (
          <span className="block space-y-0.5 text-xs">
            <span className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
              <span className="truncate">{type.accountNumber}</span>
              <button
                type="button"
                onClick={() => handleCopy(type.accountNumber, type.id)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                title="Copy Account Number"
              >
                {copiedId === type.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </span>
            {type.accountName && (
              <span className="block truncate text-[11px] text-muted-foreground">
                Holder: <span className="text-foreground/80">{type.accountName}</span> ({type.accountType || 'Personal'})
              </span>
            )}
            {type.branchName && (
              <span className="block truncate text-[10px] text-muted-foreground/80">
                Branch: {type.branchName} {type.routingNumber ? `• Routing: ${type.routingNumber}` : ''}
              </span>
            )}
          </span>
        ) : (
          <span className="text-[11px] italic text-muted-foreground/50">No account details</span>
        ),
    },
    {
      key: 'fees',
      header: 'Charge Fee',
      className: 'w-[160px]',
      render: (type) =>
        (type.fees || []).length > 0 ? (
          <span className="flex flex-wrap gap-1">
            {type.fees.map((fee) => (
              <Badge key={fee.name} variant="outline" className="text-[11px] font-mono text-amber-600 border-amber-500/30 bg-amber-500/5">
                {fee.name}: {formatFeeRate(fee)}
              </Badge>
            ))}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">No fees</span>
        ),
    },
    {
      key: 'linked',
      header: 'Linked Payments',
      className: 'w-[130px]',
      render: (type) => {
        const linkedCount = typeStats.counts[type.name] || 0;
        return (
          <Badge variant="outline" className="text-[11px] font-mono px-2 py-0.5">
            {linkedCount} {linkedCount === 1 ? 'txn' : 'txns'}
          </Badge>
        );
      },
    },
    {
      key: 'volume',
      header: 'Total Volume',
      className: 'w-[140px]',
      align: 'right',
      render: (type) => (
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          ৳{(typeStats.volumes[type.name] || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[110px]',
      render: (type) => (
        <Badge
          variant={type.status === 'Active' ? 'default' : 'secondary'}
          className={
            type.status === 'Active'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium'
              : 'bg-muted text-muted-foreground text-[11px]'
          }
        >
          {type.status === 'Active' ? <CheckCircle2 className="w-3 h-3 mr-1 inline" /> : <XCircle className="w-3 h-3 mr-1 inline" />}
          {type.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {t('accounts.payment_methods_title', 'Payment Methods & Types')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {t('accounts.payment_methods_subtitle', 'Configure, add, edit, and manage payment methods, bank accounts, and wallet details.')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleOpenAdd}
            className="h-9 text-xs gap-1.5 shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('accounts.add_payment_method_btn', 'Add Payment Method')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Methods</p>
              <p className="text-xl font-bold tracking-tight text-foreground">{summaryStats.total}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Active Methods</p>
              <p className="text-xl font-bold tracking-tight text-emerald-600">{summaryStats.active}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">MFS & Wallets</p>
              <p className="text-xl font-bold tracking-tight text-pink-600">{summaryStats.mfs}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-600 border border-pink-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Bank Accounts</p>
              <p className="text-xl font-bold tracking-tight text-blue-600">{summaryStats.bank}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <Landmark className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b bg-muted/20 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, account no, provider..."
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
                  value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v || 'All');
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-[150px]">
                    <span className="truncate">
                      Category: {categoryFilter === 'All' ? 'All' : (CATEGORY_OPTIONS.find((c) => c.value === categoryFilter)?.label || categoryFilter)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="mfs">MFS / Wallet</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="cash">Cash / COD</SelectItem>
                    <SelectItem value="card">Card / POS</SelectItem>
                    <SelectItem value="gateway">Gateway</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v || 'All');
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-[130px]">
                    <span className="truncate">Status: {statusFilter}</span>
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
                  <SelectTrigger className="h-9 text-xs w-[140px] border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
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
          rows={paymentTypes}
          isLoading={isLoading}
          error={false ? 'Failed to load payment methods.' : null}
          emptyText={<div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <div className="p-3 bg-muted/40 rounded-full">
                <CreditCard className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-sm font-semibold text-foreground">No payment methods found</p>
              <p className="text-xs max-w-sm whitespace-normal">
                Add payment methods such as bKash Personal, Nagad Merchant, BRAC Bank, or Cash on Delivery to organize and track your receipts.
              </p>
              <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2 text-xs gap-1.5 cursor-pointer">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add First Payment Method</span>
              </Button>
            </div>}
          selection={selection}
          onRowClick={(type) => handleOpenDetails(type)}
          rowActions={(type) => [
            { label: 'View Full Details', icon: Eye, onClick: () => handleOpenDetails(type) },
            { label: 'Edit', icon: Edit, onClick: () => handleOpenEdit(type) },
            { label: 'Delete', icon: Trash2, destructive: true, separatorBefore: true, onClick: () => setDeleteTarget(type) },
          ]}
        />

        <TablePaginationV2
          className="rounded-none border-0 border-t"
          page={currentPage}
          totalPages={totalPages}
          total={paymentTypes.length}
          pageSize={pageSize}
          setPage={(p) => {
            setCurrentPage(p);
            selection.clear();
          }}
          setPageSize={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          shownCount={paymentTypes.length}
        />
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                {editingType ? 'Edit Payment Method' : 'Add New Payment Method'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure account numbers, bank details, and payment instructions for this method.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <div className="bg-muted/30 p-3 rounded-lg border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                  General Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Method Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. bKash Personal, BRAC Bank"
                      value={typeForm.name}
                      onChange={(e) => setTypeForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Category</label>
                    <Select
                      value={typeForm.category}
                      onValueChange={(v) => setTypeForm((prev) => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Provider / Bank Name</label>
                    <Input
                      placeholder="e.g. bKash, Nagad, BRAC Bank, City Bank"
                      value={typeForm.provider}
                      onChange={(e) => setTypeForm((prev) => ({ ...prev, provider: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-amber-500" />
                  Charges & Fees
                </h4>
                <PaymentFeesEditor
                  enabled={typeForm.hasFees}
                  onEnabledChange={(hasFees) => setTypeForm((prev) => ({ ...prev, hasFees }))}
                  fees={typeForm.fees}
                  onChange={(fees) => setTypeForm((prev) => ({ ...prev, fees }))}
                />
              </div>

              <div className="bg-muted/30 p-3 rounded-lg border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  Account & Banking Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Account / Wallet Mobile No.
                    </label>
                    <Input
                      placeholder="e.g. 01712345678 or 150120XXXXXX"
                      value={typeForm.accountNumber}
                      onChange={(e) => setTypeForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Account Holder Name</label>
                    <Input
                      placeholder="e.g. Plexivia Ltd / Md. Name"
                      value={typeForm.accountName}
                      onChange={(e) => setTypeForm((prev) => ({ ...prev, accountName: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Account Type</label>
                    <Select
                      value={typeForm.accountType}
                      onValueChange={(v) => setTypeForm((prev) => ({ ...prev, accountType: v }))}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Merchant">Merchant</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                        <SelectItem value="Current">Current Account</SelectItem>
                        <SelectItem value="Savings">Savings Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Branch Name</label>
                    <Input
                      placeholder="e.g. Banani Branch"
                      value={typeForm.branchName}
                      onChange={(e) => setTypeForm((prev) => ({ ...prev, branchName: e.target.value }))}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Routing No.</label>
                    <Input
                      placeholder="e.g. 060261234"
                      value={typeForm.routingNumber}
                      onChange={(e) => setTypeForm((prev) => ({ ...prev, routingNumber: e.target.value }))}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  Payment Instructions / Notes for Customer & Staff
                </label>
                <Textarea
                  placeholder="e.g. Please Send Money (Personal) to this number and provide your Transaction ID (TrxID) in the reference box."
                  value={typeForm.instructions}
                  onChange={(e) => setTypeForm((prev) => ({ ...prev, instructions: e.target.value }))}
                  className="text-xs min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <Select
                    value={typeForm.status}
                    onValueChange={(v) => setTypeForm((prev) => ({ ...prev, status: v }))}
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

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isDefaultMethodCheck"
                    checked={typeForm.isDefault}
                    onChange={(e) => setTypeForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isDefaultMethodCheck" className="text-xs font-medium text-foreground cursor-pointer select-none">
                    Set as Default Method
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
              <Button
                type="button"
                variant="cancel"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isAdding || isUpdating}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                {isAdding || isUpdating ? 'Saving...' : editingType ? 'Update Method' : 'Create Method'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          {viewingMethod && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-foreground">
                      {viewingMethod.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Payment method profile and account details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-lg border">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-semibold capitalize text-foreground mt-0.5">{viewingMethod.category || 'MFS'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Provider:</span>
                    <p className="font-semibold text-foreground mt-0.5">{viewingMethod.provider || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-semibold text-emerald-600 mt-0.5">{viewingMethod.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Charges & Fees:</span>
                    {(viewingMethod.fees || []).length > 0 ? (
                      viewingMethod.fees.map((fee) => (
                        <p key={fee.name} className="font-semibold text-amber-600 mt-0.5">
                          {fee.name}: {formatFeeRate(fee)}
                        </p>
                      ))
                    ) : (
                      <p className="font-semibold text-muted-foreground mt-0.5">No fees</p>
                    )}
                  </div>
                </div>

                {viewingMethod.accountNumber && (
                  <div className="bg-muted/30 p-3 rounded-lg border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Account / Wallet Number:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] gap-1 cursor-pointer"
                        onClick={() => handleCopy(viewingMethod.accountNumber, viewingMethod.id)}
                      >
                        {copiedId === viewingMethod.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </Button>
                    </div>
                    <p className="font-mono text-base font-bold text-foreground">{viewingMethod.accountNumber}</p>
                    {viewingMethod.accountName && (
                      <p className="text-muted-foreground">
                        Account Holder: <span className="font-medium text-foreground">{viewingMethod.accountName}</span> ({viewingMethod.accountType || 'Personal'})
                      </p>
                    )}
                    {viewingMethod.branchName && (
                      <p className="text-muted-foreground">
                        Branch: <span className="font-medium text-foreground">{viewingMethod.branchName}</span>
                        {viewingMethod.routingNumber ? ` (Routing: ${viewingMethod.routingNumber})` : ''}
                      </p>
                    )}
                  </div>
                )}

                {viewingMethod.instructions && (
                  <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-amber-900 dark:text-amber-200">
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Instructions:
                    </p>
                    <p className="text-xs whitespace-pre-wrap">{viewingMethod.instructions}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleOpenEdit(viewingMethod);
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  Edit Details
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Payment Method?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Linked payment records will retain their history.`}
        isDeleting={isDeleting}
      />

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title="Delete Selected Payment Methods?"
        description={`Are you sure you want to delete ${selectedIds.length} selected payment method(s)? Linked payment records will retain their history.`}
        isDeleting={isBulkDeleting}
      />
    </div>
  );
};

export const PaymentMethodsPage = PaymentTypesPage;
export default PaymentTypesPage;
