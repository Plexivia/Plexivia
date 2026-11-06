import React, { useState, useEffect, useMemo } from 'react';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { DatePicker } from '@/components/ui/date-picker';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Pencil,
  PlusCircle,
  Save,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AttachmentUploader } from '@/components/dashboard/accounts/AttachmentUploader';
import { toast } from 'sonner';
import { useData } from '@/context/DataContext';
import { getClientName, getClientProjects } from '@/components/dashboard/accounts/paymentSources';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useClientOptions } from '@/features/document-studio/components/common/useStudioLookups';
import { apiErrorMessage, businessesApi, paymentMethodsApi, paymentSourcesApi, paymentsApi } from '@/services/paymentsApi';
import { EMPTY_CHARGES, chargesToEditorValue } from '@/components/dashboard/accounts/ChargesEditor';

// Formats a numeric value into BDT currency string
const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return `৳${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Renders the Add / Edit Payment form page (API integration placeholder: connect payments, paymentTypes, members, users APIs)
export const AddNewPaymentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  // Set when the form is opened from a client row's "Add Payment" action
  const prefillClientId = searchParams.get('clientId') || '';

  const { clients } = useData();
  const clientOptions = useClientOptions();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [paymentSources, setPaymentSources] = useState([]);
  const [chargesValue, setChargesValue] = useState(EMPTY_CHARGES);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    paymentSourceId: '',
    clientId: '',
    projectId: '',
    projectName: '',
    businessId: '',
    customerName: '',
    invoiceId: '',
    amount: '',
    paidAmount: '',
    paymentMethod: '',
    paymentMethodId: '',
    trxId: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Completed',
    notes: '',
    attachments: [],
  });

  const availableMethods = useMemo(
    () => paymentMethods.filter((m) => m.status === 'Active' || m.id === formData.paymentMethodId),
    [paymentMethods, formData.paymentMethodId]
  );
  const selectedMethod = paymentMethods.find((m) => m.id === formData.paymentMethodId);
  const activeBusinesses = businesses.filter((b) => b.status === 'Active' || b.id === formData.businessId);

  const activeSources = useMemo(
    () => paymentSources.filter((s) => s.status === 'Active' || s.id === formData.paymentSourceId),
    [paymentSources, formData.paymentSourceId]
  );
  const selectedSource = paymentSources.find((s) => s.id === formData.paymentSourceId);
  const isClientSource = selectedSource?.linkType === 'client';
  const isBusinessSource = selectedSource?.linkType === 'business';
  const selectedBusiness = businesses.find((b) => b.id === formData.businessId);
  const selectedClient = (clients || []).find((c) => c.id === formData.clientId);
  const clientProjects = getClientProjects(selectedClient);

  // Load sources once; a new payment defaults to the built-in Client source
  useEffect(() => {
    paymentSourcesApi
      .list()
      .then((list) => {
        setPaymentSources(list);
        const clientSource = list.find((s) => s.system && s.linkType === 'client');
        setFormData((prev) => (prev.paymentSourceId || !clientSource ? prev : { ...prev, paymentSourceId: clientSource.id }));
      })
      .catch((error) => toast.error(apiErrorMessage(error, 'Failed to load payment sources')));
    paymentMethodsApi
      .list()
      .then((list) => {
        setPaymentMethods(list);
        // New payments start on the default method
        const fallback = list.find((m) => m.isDefault && m.status === 'Active');
        setFormData((prev) => (prev.paymentMethodId || !fallback || editId ? prev : { ...prev, paymentMethodId: fallback.id, paymentMethod: fallback.name }));
      })
      .catch((error) => toast.error(apiErrorMessage(error, 'Failed to load payment methods')));
    businessesApi
      .list()
      .then(setBusinesses)
      .catch((error) => toast.error(apiErrorMessage(error, 'Failed to load businesses')));
  }, [editId]);

  // Opened from a client row: select that client as soon as the directory is loaded
  useEffect(() => {
    if (!prefillClientId || editId) return;
    const client = (clients || []).find((c) => c.id === prefillClientId);
    if (!client) return;
    setFormData((prev) => (prev.clientId ? prev : { ...prev, clientId: client.id, customerName: getClientName(client) }));
  }, [prefillClientId, clients, editId]);

  useEffect(() => {
    if (!editId) return;
    paymentsApi
      .get(editId)
      .then((existing) => {
        setFormData({
          paymentSourceId: existing.paymentSourceId,
          clientId: existing.clientId || '',
          projectId: existing.projectId || '',
          projectName: existing.projectName || '',
          businessId: existing.businessId || '',
          customerName: existing.customerName || '',
          invoiceId: existing.invoiceId || '',
          amount: existing.amount !== undefined ? String(existing.amount) : '',
          paidAmount: existing.paidAmount !== undefined ? String(existing.paidAmount) : '',
          paymentMethod: existing.paymentMethod || existing.method || '',
          paymentMethodId: existing.paymentMethodId || '',
          trxId: existing.trxId || '',
          date: existing.date || new Date().toISOString().slice(0, 10),
          status: existing.status || 'Completed',
          notes: existing.notes || '',
          attachments: existing.attachments || [],
        });
        setChargesValue(chargesToEditorValue(existing.charges));
      })
      .catch((error) => toast.error(apiErrorMessage(error, 'Failed to load payment')));
  }, [editId]);

  const amountNum = Number(formData.amount) || 0;
  const paidAmountNum = Number(formData.paidAmount !== '' ? formData.paidAmount : formData.amount) || 0;
  // Charges are a share of the money received and come out of it
  // No charge calculation on payment transactions
  const charges = [];
  const chargeTotal = Math.round(charges.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;
  const netReceived = Math.round((paidAmountNum - chargeTotal) * 100) / 100;

  // Updates a single field in formData and synchronizes paidAmount when amount changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'amount' && prev.paidAmount === '') {
        updated.paidAmount = value;
      }
      return updated;
    });
  };

  // Switching source clears the payer fields, since client and free-text payers don't mix
  const handleSourceChange = (sourceId) => {
    setFormData((prev) => ({ ...prev, paymentSourceId: sourceId, clientId: '', projectId: '', projectName: '', businessId: '', customerName: '' }));
  };

  const handleBusinessChange = (businessId) => {
    const business = businesses.find((b) => b.id === businessId);
    setFormData((prev) => ({ ...prev, businessId, customerName: business?.name || '' }));
  };

  // A different method has different regular charges, so the picked one is reset
  const handleMethodChange = (methodId) => {
    const method = paymentMethods.find((m) => m.id === methodId);
    setFormData((prev) => ({ ...prev, paymentMethodId: methodId, paymentMethod: method?.name || '' }));
    setChargesValue((prev) => ({ ...prev, regular: 'none' }));
  };

  // Selecting a client fills the payer name and resets the project
  const handleClientChange = (clientId) => {
    const client = (clients || []).find((c) => c.id === clientId);
    setFormData((prev) => ({ ...prev, clientId, projectId: '', projectName: '', customerName: client ? getClientName(client) : '' }));
  };

  const handleProjectChange = (projectId) => {
    const project = clientProjects.find((p) => p.dId === projectId);
    setFormData((prev) => ({ ...prev, projectId, projectName: project?.name || '' }));
  };

  // Validates and submits the payment record (API integration placeholder: POST / PUT /api/v1/payments)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSource) {
      toast.error('Please select a payment source');
      return;
    }
    if (isClientSource && !formData.clientId) {
      toast.error('Please select a client');
      return;
    }
    if (isBusinessSource && !formData.businessId) {
      toast.error('Please select a business');
      return;
    }
    if (isClientSource && clientProjects.length > 0 && !formData.projectId) {
      toast.error('Please select the client project this payment is for');
      return;
    }
    if (!formData.customerName.trim()) {
      toast.error('Payer name is required');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (chargeTotal > paidAmountNum) {
      toast.error('Charges cannot be more than the received amount');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { ...formData, charges };
      if (editId) await paymentsApi.update(editId, payload);
      else await paymentsApi.create(payload);
      toast.success(editId ? 'Payment record updated' : 'Payment record saved');
      navigate('/accounts/payments');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to save payment'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Top page bar: title follows add / edit mode */}
      <HeaderTitle
        title={editId ? 'Edit Payment Record' : t('accounts.add_new_payment', 'Add New Payment')}
        subtitle="Record manual client settlements, POS transactions, or gateway collections."
        icon={editId ? Pencil : PlusCircle}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Payment Source & Payer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Payment Source <span className="text-red-500">*</span>
                  </label>
                  <Link to="/accounts/payments/sources" className="text-[11px] font-medium text-primary hover:underline">
                    Manage sources
                  </Link>
                </div>
                <Select value={formData.paymentSourceId} onValueChange={handleSourceChange}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Select payment source">{selectedSource?.name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {activeSources.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isClientSource ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Client <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={clientOptions}
                        value={formData.clientId}
                        onChange={handleClientChange}
                        placeholder="Search and choose a client"
                        searchPlaceholder="Search by client, business, phone or email…"
                        emptyMessage="No clients found. Onboard one from the Clients page."
                        buttonClassName="h-9 rounded-md"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Project {clientProjects.length > 0 && <span className="text-red-500">*</span>}
                      </label>
                      <SearchableSelect
                        options={clientProjects.map((proj) => ({ value: proj.dId, label: proj.name }))}
                        value={formData.projectId}
                        onChange={handleProjectChange}
                        disabled={!selectedClient || clientProjects.length === 0}
                        placeholder={!selectedClient ? 'Select a client first' : clientProjects.length === 0 ? 'This client has no projects' : 'Select a project'}
                        searchPlaceholder="Search projects…"
                        emptyMessage="No projects for this client"
                        buttonClassName="h-9 rounded-md"
                      />
                    </div>
                  </>
                ) : isBusinessSource ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">
                        Business <span className="text-red-500">*</span>
                      </label>
                      <Link to="/businesses" className="text-[11px] font-medium text-primary hover:underline">
                        Manage businesses
                      </Link>
                    </div>
                    <Select value={formData.businessId} onValueChange={handleBusinessChange}>
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Select a business">{selectedBusiness?.name}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {activeBusinesses.length > 0 ? (
                          activeBusinesses.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No businesses yet. Add one on the Businesses page.
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Payer Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder={selectedSource ? `e.g. ${selectedSource.name}` : 'Who paid'}
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Invoice ID
                  </label>
                  {/* Server-assigned serial (e.g. 02IN26001) — never typed or edited */}
                  <Input
                    readOnly
                    disabled
                    value={formData.invoiceId || 'Assigned on save'}
                    className="text-xs font-mono bg-muted/40 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {editId ? 'Issued invoice number, cannot be changed.' : 'Auto serial, assigned when you save.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Payment Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Order / Bill Amount (৳) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="text-xs font-semibold font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Received / Paid Amount (৳)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={formData.paidAmount}
                    onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                    className="text-xs font-semibold font-mono text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Payment Method</label>
                  <Select value={formData.paymentMethodId} onValueChange={handleMethodChange}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Payment Method">{selectedMethod?.name || formData.paymentMethod || undefined}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableMethods.length > 0 ? (
                        availableMethods.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No active payment methods found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Transaction ID (TrxID)</label>
                  <Input
                    placeholder="e.g. TRX9928374"
                    value={formData.trxId}
                    onChange={(e) => handleInputChange('trxId', e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Payment Date</label>
                  <DatePicker value={formData.date} onChange={(val) => handleInputChange('date', val)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => handleInputChange('status', v)}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed (Paid)</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Notes / Remarks</label>
                <Textarea
                  placeholder="Additional notes, POS counter info, or bank slip reference..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="text-xs min-h-[70px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Attachments (Slip / Receipt)</label>
                <AttachmentUploader
                  kind="payments"
                  value={formData.attachments}
                  onChange={(files) => handleInputChange('attachments', files)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <Card className="border-border/70 shadow-sm sticky top-20 bg-muted/10">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Payment Receipt Preview</span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px]">{selectedSource?.name || 'Payer'}:</span>
                <span className="font-bold text-foreground text-sm line-clamp-1">
                  {formData.customerName || 'Payer Name'}
                </span>
                {formData.projectName && (
                  <span className="text-[11px] text-muted-foreground block">Project: {formData.projectName}</span>
                )}
                <span className="text-muted-foreground font-mono text-[11px] block">
                  {formData.invoiceId || 'PX-INV-auto'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-card border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order Total:</span>
                  <span className="font-bold text-foreground font-mono">{formatCurrency(amountNum)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Collected Amount:</span>
                  <span className="font-bold text-foreground font-mono">{formatCurrency(paidAmountNum)}</span>
                </div>
                {chargeTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Charges:</span>
                    <span className="font-bold text-rose-600 font-mono">− {formatCurrency(chargeTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-muted-foreground">Net Received:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">{formatCurrency(netReceived)}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-muted-foreground text-[11px]">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <Badge variant="outline" className="text-[10px]">{formData.paymentMethod || '—'}</Badge>
                </div>
                {formData.trxId && (
                  <div className="flex justify-between">
                    <span>Trx ID:</span>
                    <span className="font-mono text-foreground">{formData.trxId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Date:</span>
                  <span className="font-medium text-foreground">{formData.date}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-[10px]">{formData.status}</Badge>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <Button
                  type="submit"
                  className="w-full text-xs gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSaving}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : editId ? 'Update Payment' : 'Save Payment Record'}</span>
                </Button>
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => navigate('/accounts/payments')}
                  className="w-full text-xs"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AddNewPaymentPage;
