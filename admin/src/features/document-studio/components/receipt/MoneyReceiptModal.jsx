import React, { useState, useEffect } from 'react';
import { X, Receipt, Check, Printer, ArrowLeft, Loader2, Sparkles, User, Phone, ShieldCheck, DollarSign, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { printDocument } from '@/lib/utils';
import { toast } from 'sonner';
import { MoneyReceiptPrintSlip } from './MoneyReceiptPrintSlip';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { BdPhoneInput } from '@/components/common/BdPhoneInput';
import { useClientLookup } from '../common/useClientLookup';
import { ExistingClientAlertModal } from '../common/ExistingClientAlertModal';
import { validateBdPhone } from '../common/phoneValidator';

const SERVICE_OPTIONS = [
  'Indian Visa Processing',
  'Passport Submission & Renewal',
  'Greece Work Permit Case',
  'North Macedonia Case',
  'Manpower Case File',
  'Air Ticket Booking',
  'Employment Contract Service',
  'Service Fee & Consultancy',
  'Other Service',
];

export function MoneyReceiptModal({
  isOpen,
  onClose,
  initialData = {},
  onSuccess,
  onCreated,
}) {
  const user = useAuth((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [detectedMatch, setDetectedMatch] = useState(null);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const { triggerLookup, resetLookup } = useClientLookup({
    onClientFound: (client, caseFile) => setDetectedMatch({ client, caseFile }),
  });

  const [formData, setFormData] = useState({
    clientName: initialData.clientName || '',
    clientPhone: initialData.clientPhone || '',
    passportNumber: initialData.passportNumber || '',
    serviceType: initialData.serviceType || 'Indian Visa Processing',
    amount: initialData.amount || '',
    amountInWords: initialData.amountInWords || '',
    paymentMethod: initialData.paymentMethod || 'Cash',
    purpose: initialData.purpose || '',
    createdByName: user?.name || 'Manager',
  });

  const handleYes = () => {
    if (!detectedMatch?.client) return;
    const c = detectedMatch.client;
    setFormData((prev) => ({
      ...prev,
      clientName: c.fullName || c.name || prev.clientName,
      clientPhone: c.phone || c.mobileNumber || prev.clientPhone,
      passportNumber: c.passportNumber || c.nidNumber || prev.passportNumber,
      clientId: c._id || c.did || prev.clientId,
      clientDid: c.did || c._id || prev.clientDid,
    }));
    toast.success(`"${c.fullName || c.name}" info auto-filled!`);
    setDetectedMatch(null);
  };

  const handleNo = () => {
    const val = detectedMatch?.client?.phone || formData.clientPhone || '';
    setFormData((prev) => ({ ...prev, clientPhone: '' }));
    resetLookup(val);
    setPhoneTouched(false);
    toast.info('Please enter a different phone number.');
    setDetectedMatch(null);
  };


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState(null);

  // Sync initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      setCreatedReceipt(null);
      setFormData({
        clientName: initialData.clientName || initialData.applicantName || initialData.fullName || initialData.name || '',
        clientPhone: initialData.clientPhone || initialData.phone || initialData.mobileNumber || '',
        passportNumber: initialData.passportNumber || '',
        serviceType: initialData.serviceType || 'Indian Visa Processing',
        purpose: initialData.purpose || initialData.remarks || '',
        amount: initialData.amount || initialData.totalAmount || initialData.fee || '',
        amountInWords: initialData.amountInWords || '',
        paymentMethod: initialData.paymentMethod || 'Cash',
        createdByName: user?.name || 'Manager',
        notes: initialData.notes || '',
        clientId: initialData.clientId || null,
        serviceRef: initialData.serviceRef || null,
      });
    }
  }, [isOpen, initialData, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (val) => {
    setFormData((prev) => ({ ...prev, clientPhone: val }));
    triggerLookup(val);
    if (phoneTouched) setPhoneTouched(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      toast.error('Please provide client name.');
      return;
    }

    const check = validateBdPhone(formData.clientPhone);
    if (!check.isValid) {
      setPhoneTouched(true);
      toast.error(`Client Phone: ${check.error}`);
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please provide a valid received amount.');
      return;
    }


    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      const res = await apiClient.post('/api/v1/client/receipts', payload);
      if (res.data?.success || res.data?.status === 'success') {
        const receipt = res.data.data;
        setCreatedReceipt(receipt);
        toast.success(`Payment Token #${receipt.receiptNo} created successfully!`);
        (onCreated || onSuccess)?.(receipt);
      } else {
        toast.error(res.data?.message || 'Failed to create receipt token.');
      }
    } catch (err) {
      console.error('Failed to create money receipt:', err);
      toast.error(err.response?.data?.message || 'Server error while creating token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: createdReceipt?.receiptNo || formData.receiptNo,
      docType: 'Money_Receipt',
      clientName: createdReceipt?.clientName || formData.clientName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-hidden">
      <div className="bg-white text-black border border-black/10 rounded-2xl shadow-2xl w-full max-w-4xl h-[70vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black/[0.02] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
                {createdReceipt ? 'Print & Preview Token' : 'Create New Payment Token & Money Receipt'}
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                  Internal Office Use
                </span>
              </h2>
              <p className="text-xs text-black/60">
                {createdReceipt 
                  ? 'Hand over this slip to cashier for seal and cash deposit confirmation.' 
                  : 'Manager issues this token slip for cashier seal and cash collection.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {createdReceipt ? (
            /* Print Preview Screen */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-3.5 rounded-xl text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>Token Issued Successfully! Token No: <strong className="font-mono text-base">{createdReceipt.receiptNo}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCreatedReceipt(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>New Token</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Token</span>
                  </button>
                </div>
              </div>

              {/* Printable Component Container */}
              <div className="border border-border rounded-xl p-2 bg-muted/20 overflow-x-auto">
                <MoneyReceiptPrintSlip data={createdReceipt} onPrint={handlePrint} />
              </div>
            </div>
          ) : (
            /* Token Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Client Details Section */}
              <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-primary">
                  <User className="w-4 h-4" />
                  1. Client Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Client Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="Enter passenger / client name"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <BdPhoneInput
                      value={formData.clientPhone}
                      required
                      onBlur={() => setPhoneTouched(true)}
                      onChange={handlePhoneChange}
                    />
                    {((phoneTouched || Boolean(formData.clientPhone)) && !validateBdPhone(formData.clientPhone || '').isValid) && (
                      <p className="text-[10px] text-rose-500 font-bold mt-1">
                        {validateBdPhone(formData.clientPhone || '').error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      placeholder="Enter passport number"
                      className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Service & Payment Amount Section */}
              <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-primary">
                  <DollarSign className="w-4 h-4" />
                  2. Service Details & Amount
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Service Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Received Amount (BDT) (BDT ) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">BDT </span>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        required
                        className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold text-foreground rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Received Amount in Words
                    </label>
                    <input
                      type="text"
                      name="amountInWords"
                      value={formData.amountInWords}
                      onChange={handleChange}
                      placeholder="Enter amount in words"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    >
                      <option value="Cash">Direct Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="bKash/Nagad">bKash / Nagad</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Description & Purpose
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      placeholder="Enter payment purpose / notes"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Creator & Internal Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Token Prepared By: <strong>{formData.createdByName}</strong></span>
                <span className="text-[11px] italic">* Saving will generate instant printable voucher token.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Token...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      <span>Create Token & Print</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

        {detectedMatch && (
          <ExistingClientAlertModal
            client={detectedMatch.client}
            caseFile={detectedMatch.caseFile}
            onYes={handleYes}
            onNo={handleNo}
          />
        )}
      </div>
    </div>
  );
}
