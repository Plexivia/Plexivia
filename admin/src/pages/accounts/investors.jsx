import React, { useState, useMemo } from 'react';
import { TableV2, TablePaginationV2, useRowSelection } from '@/components/table/versionTwo';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  PlusCircle,
  Search,
  UserCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Edit,
  Trash2,
  Mail,
  Phone,
  Landmark,
  CornerDownLeft,
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
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { DateRangeFilter } from '@/components/dashboard/accounts/DateRangeFilter';
import { ReturnInvestmentModal } from '@/components/dashboard/accounts/ReturnInvestmentModal';
import { toast } from 'sonner';
import { formatDate } from '@/utils/dateHelper';

// Formats a numeric value into BDT currency string
const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `৳${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Renders the Investors Directory page (API integration placeholder: fetch, create, update, and delete investors)
export const InvestorsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '', preset: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnTargetInvestorId, setReturnTargetInvestorId] = useState('');
  const [modalOption, setModalOption] = useState('existing');
  const [editingInvestor, setEditingInvestor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [investorForm, setInvestorForm] = useState({
    name: '',
    type: 'Individual',
    email: '',
    phone: '',
    status: 'Active',
    notes: '',
    totalInvested: '',
    totalReturned: '',
    userId: null,
  });

  const [investors, setInvestors] = useState([]);
  const allInvestments = useMemo(() => [], []);
  const membersList = useMemo(() => [], []);
  const usersList = useMemo(() => [], []);
  const isLoading = false;
  const isAdding = false;
  const isUpdating = false;
  const isDeleting = false;
  const totalPages = 1;

  const portfolioStats = useMemo(() => {
    const stats = {};
    allInvestments.forEach((inv) => {
      const invId = inv.investorId;
      if (!stats[invId]) {
        stats[invId] = { count: 0, taken: 0, returned: 0 };
      }
      stats[invId].count += 1;
      stats[invId].taken += Number(inv.takenAmount) || 0;
      stats[invId].returned += Number(inv.returnedAmount) || 0;
    });
    return stats;
  }, [allInvestments]);

  const totalCapitalInvested = useMemo(() => {
    return investors.reduce((acc, curr) => {
      const live = portfolioStats[curr.id]?.taken;
      return acc + (live !== undefined ? live : Number(curr.totalInvested) || 0);
    }, 0);
  }, [investors, portfolioStats]);

  // Opens modal dialog to add a new investor
  const handleOpenAdd = () => {
    setEditingInvestor(null);
    setModalOption('existing');
    setInvestorForm({
      name: '',
      type: 'Individual',
      email: '',
      phone: '',
      status: 'Active',
      notes: '',
      totalInvested: '',
      totalReturned: '',
      userId: null,
    });
    setAddModalOpen(true);
  };

  // Opens modal dialog populated with an existing investor profile for editing
  const handleOpenEdit = (inv) => {
    setEditingInvestor(inv);
    setInvestorForm({
      name: inv.name || '',
      type: inv.type || 'Individual',
      email: inv.email || '',
      phone: inv.phone || '',
      status: inv.status || 'Active',
      notes: inv.notes || '',
      totalInvested: inv.totalInvested !== undefined ? String(inv.totalInvested) : '',
      totalReturned: inv.totalReturned !== undefined ? String(inv.totalReturned) : '',
      userId: inv.userId || null,
    });
    setAddModalOpen(true);
  };

  // Populates investor form fields from a selected system user or member
  const handleSelectUserOrMember = (id) => {
    const user = usersList.find((u) => u.id === id);
    if (user) {
      setInvestorForm((prev) => ({
        ...prev,
        name: user.name || user.email.split('@')[0],
        email: user.email || '',
        phone: user.phone || '',
        type: 'Individual',
        userId: user.id,
      }));
      return;
    }
    const member = membersList.find((m) => m.id === id);
    if (member) {
      setInvestorForm((prev) => ({
        ...prev,
        name: member.name || 'Member',
        email: member.email || '',
        phone: member.phone || '',
        type: 'Individual',
        userId: member.id,
      }));
    }
  };

  // Validates and saves a new or updated investor profile (API integration placeholder: POST/PUT /api/v1/investors)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!investorForm.name.trim()) {
      toast.error('Investor name is required');
      return;
    }

    if (editingInvestor) {
      setInvestors((prev) =>
        prev.map((inv) => (inv.id === editingInvestor.id ? { ...inv, ...investorForm } : inv))
      );
      toast.success('Investor profile updated');
    } else {
      setInvestors((prev) => [
        ...prev,
        { id: `inv-${Date.now()}`, createdAt: new Date().toISOString(), ...investorForm },
      ]);
      toast.success('Investor profile created');
    }
    setAddModalOpen(false);
  };

  // Deletes the selected investor profile (API integration placeholder: DELETE /api/v1/investors/:id)
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setInvestors((prev) => prev.filter((inv) => inv.id !== deleteTarget.id));
    toast.success('Investor deleted');
    setDeleteTarget(null);
  };

  // Live invested / returned / net totals for an investor row
  const getInvestorTotals = (inv) => {
    const live = portfolioStats[inv.id];
    const invested = live !== undefined ? live.taken : Number(inv.totalInvested) || 0;
    const returned = live !== undefined ? live.returned : Number(inv.totalReturned) || 0;
    return { invested, returned, netBalance: Math.max(0, invested - returned) };
  };

  const columns = [
    {
      key: 'name',
      header: 'Investor Name',
      render: (inv) => (
        <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-foreground">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-xs font-bold text-purple-600">
            {inv.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate">{inv.name}</span>
            {inv.notes && <span className="block truncate text-[10px] font-normal text-muted-foreground">{inv.notes}</span>}
          </span>
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      className: 'w-[120px]',
      render: (inv) => (
        <Badge variant="outline" className="text-[11px] bg-muted/40 font-medium">
          {inv.type}
        </Badge>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      className: 'w-[200px]',
      render: (inv) => (
        <span className="block space-y-0.5 text-xs text-muted-foreground">
          {inv.phone && <span className="flex items-center gap-1 truncate"><Phone className="size-3 shrink-0" /> {inv.phone}</span>}
          {inv.email && <span className="flex items-center gap-1 truncate"><Mail className="size-3 shrink-0" /> {inv.email}</span>}
        </span>
      ),
    },
    {
      key: 'invested',
      header: 'Total Invested',
      className: 'w-[130px]',
      align: 'right',
      render: (inv) => <span className="font-mono text-xs font-bold tabular-nums text-foreground">{formatCurrency(getInvestorTotals(inv).invested)}</span>,
    },
    {
      key: 'returned',
      header: 'Total Returned',
      className: 'w-[130px]',
      align: 'right',
      render: (inv) => <span className="font-mono text-xs font-semibold tabular-nums text-emerald-600">{formatCurrency(getInvestorTotals(inv).returned)}</span>,
    },
    {
      key: 'net',
      header: 'Net Active Balance',
      className: 'w-[150px]',
      align: 'right',
      render: (inv) => <span className="font-mono text-xs font-bold tabular-nums text-purple-600">{formatCurrency(getInvestorTotals(inv).netBalance)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[110px]',
      render: (inv) => {
        const isActive = inv.status === 'Active';
        return (
          <Badge
            variant="outline"
            className={isActive ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-muted text-muted-foreground'}
          >
            {isActive ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
            {inv.status}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Joined Date',
      className: 'w-[120px]',
      render: (inv) => <span className="text-xs text-muted-foreground">{inv.createdAt ? formatDate(inv.createdAt) : '—'}</span>,
    },
  ];

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {t('accounts.investors_title', 'Investors Directory')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {t('accounts.investors_subtitle', 'Manage angel investors, institutional partners, and stakeholder capital profiles.')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => {
              setReturnTargetInvestorId('');
              setReturnModalOpen(true);
            }}
            variant="outline"
            className="h-9 text-xs gap-1.5 shadow-sm border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
          >
            <CornerDownLeft className="w-4 h-4" />
            <span>{t('accounts.return_investment_btn', 'Return Investment')}</span>
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="h-9 text-xs gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('accounts.add_investor_btn', 'Add Investor')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Registered Investors</p>
            <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">{investors.length} Investors</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Active Partners</p>
            <p className="text-xl font-bold tracking-tight text-emerald-600 mt-0.5">
              {investors.filter((i) => i.status === 'Active').length} Active
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Cumulative Capital Invested</p>
            <p className="text-xl font-bold tracking-tight text-primary mt-0.5">{formatCurrency(totalCapitalInvested)}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Landmark className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b bg-muted/20 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search investors by name, email, phone..."
              className="pl-9 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v || 'All');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Investor Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Organization">Organization</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v || 'All');
                setCurrentPage(1);
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
              }}
            />
          </div>
        </div>

        <TableV2
          columns={columns}
          rows={investors}
          isLoading={isLoading}
          error={false ? 'Failed to load investors.' : null}
          emptyText='No investors found matching your query.'
          onRowClick={(inv) => handleOpenEdit(inv)}
          rowActions={(inv) => [
            {
              label: 'Record Return',
              icon: CornerDownLeft,
              onClick: () => {
                setReturnTargetInvestorId(inv.id);
                setReturnModalOpen(true);
              },
            },
            { label: 'View Investments', icon: TrendingUp, onClick: () => navigate(`/accounts/investments?investorId=${inv.id}`) },
            { label: 'Edit Investor', icon: Edit, onClick: () => handleOpenEdit(inv) },
            { label: 'Delete Investor', icon: Trash2, destructive: true, separatorBefore: true, onClick: () => setDeleteTarget(inv) },
          ]}
        />

        <TablePaginationV2
          className="rounded-none border-0 border-t"
          page={currentPage}
          totalPages={totalPages}
          total={investors.length}
          pageSize={pageSize}
          setPage={(p) => {
            setCurrentPage(p);
          }}
          setPageSize={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          shownCount={investors.length}
        />
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              {editingInvestor ? 'Edit Investor Profile' : 'Add New Investor'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Register an angel investor, stakeholder, or institutional partner.
            </DialogDescription>
          </DialogHeader>

          {!editingInvestor && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border">
              <button
                type="button"
                onClick={() => setModalOption('existing')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalOption === 'existing'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                Option 1: Existing User / Member
              </button>
              <button
                type="button"
                onClick={() => setModalOption('manual')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalOption === 'manual'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Edit className="w-3.5 h-3.5 text-primary" />
                Option 2: Manual Entry
              </button>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 py-1 text-xs">
            {!editingInvestor && modalOption === 'existing' && (
              <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border">
                <label className="font-semibold text-foreground">
                  Select Registered User or Customer Member
                </label>
                <Select onValueChange={handleSelectUserOrMember}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Search and select existing user/member..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group-users" disabled className="font-bold text-[11px] text-muted-foreground">
                      -- System Users --
                    </SelectItem>
                    {usersList.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.role} - {u.email})
                      </SelectItem>
                    ))}
                    <SelectItem value="group-members" disabled className="font-bold text-[11px] text-muted-foreground">
                      -- Customer Directory --
                    </SelectItem>
                    {membersList.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name || 'Member'} ({m.phone || m.email || m.did})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Full Name / Organization <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Sabbir Hossain / Apex VC"
                  value={investorForm.name}
                  onChange={(e) => setInvestorForm({ ...investorForm, name: e.target.value })}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Investor Type</label>
                <Select
                  value={investorForm.type}
                  onValueChange={(v) => setInvestorForm({ ...investorForm, type: v })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual Investor</SelectItem>
                    <SelectItem value="Organization">Organization / VC</SelectItem>
                    <SelectItem value="Partner">Business Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Contact Phone</label>
                <Input
                  placeholder="e.g. 01711-XXXXXX"
                  value={investorForm.phone}
                  onChange={(e) => setInvestorForm({ ...investorForm, phone: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="e.g. investor@domain.com"
                  value={investorForm.email}
                  onChange={(e) => setInvestorForm({ ...investorForm, email: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Status</label>
              <Select
                value={investorForm.status}
                onValueChange={(v) => setInvestorForm({ ...investorForm, status: v })}
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

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Notes / Investment Strategy</label>
              <Textarea
                placeholder="Details on equity stake, dividend terms, or partnership notes..."
                value={investorForm.notes}
                onChange={(e) => setInvestorForm({ ...investorForm, notes: e.target.value })}
                className="text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="cancel" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isAdding || isUpdating}>
                {isAdding || isUpdating ? 'Saving...' : editingInvestor ? 'Update Profile' : 'Save Investor'}
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
        title="Delete Investor"
        description={`Are you sure you want to delete investor profile "${deleteTarget?.name}"?`}
      />

      <ReturnInvestmentModal
        open={returnModalOpen}
        onOpenChange={(open) => {
          setReturnModalOpen(open);
          if (!open) setReturnTargetInvestorId('');
        }}
        defaultInvestorId={returnTargetInvestorId}
        onSuccess={() => {
          setReturnTargetInvestorId('');
        }}
      />
    </div>
  );
};

export default InvestorsPage;
