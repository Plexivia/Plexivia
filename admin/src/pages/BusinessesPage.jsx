import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Edit,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { toast } from 'sonner';
import { apiErrorMessage, businessesApi, BUSINESS_FIELDS } from '@/services/paymentsApi';

const EMPTY_FORM = { ...Object.fromEntries(BUSINESS_FIELDS.map((k) => [k, ''])), status: 'Active' };

// Form layout: [field, label, placeholder, type]
const FIELD_GROUPS = [
  {
    title: 'Business',
    fields: [
      ['name', 'Business Name *', 'e.g. Surokkha Store'],
      ['legal_name', 'Legal / Registered Name', 'e.g. Surokkha Trading Ltd.'],
      ['business_type', 'Business Type', 'e.g. E-commerce, Agency, Restaurant'],
      ['owner_name', 'Owner / Contact Person', 'e.g. Md. Ikram'],
    ],
  },
  {
    title: 'Contact',
    fields: [
      ['phone', 'Phone', '01XXXXXXXXX', 'tel'],
      ['email', 'Email', 'hello@business.com', 'email'],
      ['website', 'Website', 'https://business.com', 'url'],
      ['address', 'Address', 'House, road, area, city'],
    ],
  },
  {
    title: 'Integration',
    fields: [
      ['admin_dashboard_url', 'Admin Dashboard URL', 'https://admin.business.com', 'url'],
      ['frontend_url', 'Frontend / Storefront URL', 'https://business.com', 'url'],
      ['logo_url', 'Logo URL', 'https://…/logo.png', 'url'],
    ],
  },
  {
    title: 'Legal',
    fields: [
      ['trade_license', 'Trade License No.', ''],
      ['tin', 'TIN', ''],
      ['bin', 'BIN / VAT Reg.', ''],
    ],
  },
];

const LinkLine = ({ icon: Icon, href, children }) =>
  href ? (
    <a href={href} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1.5 text-primary hover:underline">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
      <ExternalLink className="size-3 shrink-0 opacity-60" />
    </a>
  ) : null;

const InfoLine = ({ icon: Icon, children }) =>
  children ? (
    <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  ) : null;

// Owner's own businesses: full profile, integration links, and the source for business payments
export const BusinessesPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setBusinesses(await businessesApi.list());
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to load businesses'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) =>
      [b.name, b.legal_name, b.business_type, b.owner_name, b.phone, b.email].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [businesses, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ ...EMPTY_FORM, ...b });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Business name is required');
      return;
    }
    setIsSaving(true);
    try {
      if (editing) await businessesApi.update(editing.id, form);
      else await businessesApi.create(form);
      toast.success(editing ? 'Business updated' : 'Business added');
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to save business'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await businessesApi.remove(deleteTarget.id);
      toast.success('Business deleted');
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to delete business'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Businesses</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Your own businesses with their dashboards and storefronts. Pick one as the source when recording a payment.
            </p>
          </div>
        </div>
        <Button onClick={openAdd} className="h-9 text-xs gap-1.5">
          <PlusCircle className="w-4 h-4" /> Add Business
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search businesses..." className="pl-9 h-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading businesses…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {businesses.length === 0 ? 'No businesses yet. Add your first business to start recording its payments.' : 'No businesses match your search.'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((b) => (
            <div key={b.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                  {b.logo_url ? <img src={b.logo_url} alt="" className="size-full object-contain" /> : <Briefcase className="size-5 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground">{b.name}</h3>
                    {b.status !== 'Active' && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{[b.business_type, b.legal_name].filter(Boolean).join(' · ') || '—'}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(b)} title="Edit">
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteTarget(b)} title="Delete">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-1.5 text-xs">
                <InfoLine icon={Phone}>{b.phone}</InfoLine>
                <InfoLine icon={Mail}>{b.email}</InfoLine>
                <InfoLine icon={MapPin}>{b.address}</InfoLine>
                <LinkLine icon={LayoutDashboard} href={b.admin_dashboard_url}>Admin dashboard</LinkLine>
                <LinkLine icon={Globe} href={b.frontend_url || b.website}>{b.frontend_url ? 'Storefront' : 'Website'}</LinkLine>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={(open) => !isSaving && setModalOpen(open)}>
        <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Briefcase className="w-4 h-4 text-primary" />
              {editing ? 'Edit Business' : 'Add Business'}
            </DialogTitle>
            <DialogDescription className="text-xs">Everything about this business in one place.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {FIELD_GROUPS.map((group) => (
              <section key={group.title} className="space-y-2.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.fields.map(([key, label, placeholder, type]) => (
                    <div key={key} className="space-y-1.5">
                      <label className="font-semibold text-foreground">{label}</label>
                      <Input
                        type={type || 'text'}
                        value={form[key]}
                        placeholder={placeholder}
                        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="text-xs"
                        required={key === 'name'}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Notes</label>
                <Textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="min-h-[70px] text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm((prev) => ({ ...prev, status: v }))}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="cancel" size="sm" onClick={() => setModalOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : editing ? 'Update Business' : 'Save Business'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Are you sure you want to delete this business?"
        description={`"${deleteTarget?.name}" will be deactivated and hidden. Payments already recorded from it keep its name.`}
      />
    </div>
  );
};

export default BusinessesPage;
