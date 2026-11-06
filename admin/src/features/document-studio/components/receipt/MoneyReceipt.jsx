import React, { useState, useEffect } from 'react';
import { MoneyReceiptForm } from './MoneyReceiptForm';
import { MoneyReceiptPreview } from './MoneyReceiptPreview';
import { getDefaultMoneyReceiptData, generateReceiptNo, numberToWords } from './sampleData';
import { Download, RefreshCw, Share2, Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { studioDocumentsApi } from '@/services/settingsApi';
import { paymentsApi, paymentSourcesApi, paymentMethodsApi } from '@/services/paymentsApi';
import { printDocument, downloadDocumentDirect } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function MoneyReceipt({ initialData = null, isLocked = false, onSavedSuccess }) {
  const [data, setData] = useState(() => {
    const defaultData = getDefaultMoneyReceiptData();
    const initAmt = initialData?.amount ? parseFloat(initialData.amount) : defaultData.amount;
    return {
      ...defaultData,
      ...(initialData || {}),
      amount: initAmt,
      amountInWords: initAmt ? numberToWords(initAmt) : defaultData.amountInWords,
    };
  });
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  // Reported by the receipt-number field: 'available' | 'taken' | 'checking' | ...
  const [numberState, setNumberState] = useState('idle');

  useEffect(() => {
    if (initialData) {
      const initAmt = initialData.amount ? parseFloat(initialData.amount) : undefined;
      setData((prev) => ({
        ...prev,
        ...initialData,
        clientName: initialData.clientName || initialData.client?.name || prev.clientName,
        phone: initialData.phone || initialData.client?.phone || prev.phone,
        passportNumber: initialData.passportNumber || prev.passportNumber,
        purpose: initialData.purpose || prev.purpose,
        amount: initAmt !== undefined ? initAmt : prev.amount,
        amountInWords: initAmt ? numberToWords(initAmt) : (prev.amount ? numberToWords(prev.amount) : prev.amountInWords),
      }));
    }
  }, [initialData]);

  const handleReset = () => {
    setData(getDefaultMoneyReceiptData());
    toast.info('Money receipt form has been reset.');
  };

  // Creates the matching payment record, linked to the client
  const recordPayment = async (receiptNo) => {
    const clientId = data.clientId || data.clientDid || initialData?.clientId || '';
    if (!clientId) return;
    const sources = await paymentSourcesApi.list();
    const source = sources.find((src) => src.linkType === 'client' && src.status !== 'Inactive');
    if (!source) throw new Error('no active client payment source in Accounts');
    const methods = await paymentMethodsApi.list().catch(() => []);
    const method = methods.find((m) => m.name === data.paymentMethod);
    const total = Number(data.amount) || 0;
    const received = data.transactionAmount !== undefined && data.transactionAmount !== '' ? Number(data.transactionAmount) : total;
    await paymentsApi.create({
      paymentSourceId: source.id,
      clientId,
      customerName: data.clientName || '',
      amount: total,
      paidAmount: received,
      paymentMethod: data.paymentMethod || '',
      paymentMethodId: method?.id || '',
      charges: [],
      trxId: data.transactionId || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      status: received < total ? 'Partial' : 'Completed',
      notes: `Money receipt ${receiptNo}${data.purpose ? ` — ${data.purpose}` : ''}`,
      attachments: data.paymentProof?.url ? [data.paymentProof] : [],
    });
  };

  const handleFormSubmit = async () => {
    if (!data.clientName?.trim()) {
      toast.error('Client name is required.');
      return;
    }
    if (!data.amount || Number(data.amount) <= 0) {
      toast.error('A valid total amount is required.');
      return;
    }
    // The receipt number is a server serial, assigned on save (the field only previews it)
    const finalReceiptNo = data.receiptNo?.trim() || '';
    const body = {
      type: 'money-receipt',
      clientId: data.clientId || data.clientDid || initialData?.clientId || '',
      clientName: data.clientName,
      paymentMethod: data.paymentMethod || '',
      amount: Number(data.amount),
      status: 'Received',
      issueDate: data.date || new Date().toISOString().slice(0, 10),
      payload: {
        ...data,
        receiptNo: finalReceiptNo,
        amount: Number(data.amount),
        amountInWords: data.amountInWords || numberToWords(Number(data.amount)),
      },
    };

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data.savedDocId);
      const saved = isEdit
        ? await studioDocumentsApi.update(data.savedDocId, body)
        : await studioDocumentsApi.create(body);

      setData((prev) => ({
        ...prev,
        savedDocId: saved.id || prev.savedDocId,
        receiptNo: saved.number || finalReceiptNo,
        amountInWords: body.payload.amountInWords,
      }));

      // New receipt: record the money in Accounts -> Payments too (same as Add Payment)
      if (!isEdit) {
        await recordPayment(saved.number || finalReceiptNo).catch((err) => {
          toast.warning(
            `Receipt saved, but the payment entry was not recorded: ${err?.response?.data?.message || err?.message || 'unknown error'}`
          );
        });
      }

      if (onSavedSuccess) onSavedSuccess(saved);
      toast.success(
        isEdit
          ? `Money receipt ${saved.number || finalReceiptNo} updated.`
          : `Money receipt ${saved.number || finalReceiptNo} saved.`
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Could not save the money receipt. It has not been recorded.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDirect = async () => {
    setIsDownloading(true);
    try {
      await downloadDocumentDirect({
        docId: data.receiptNo,
        docType: 'Money_Receipt',
        clientName: data.clientName,
        elementId: 'printable-receipt-canvas',
      });
      toast.success(`Money Receipt #${data.receiptNo} downloaded successfully!`);
    } catch (err) {
      toast.error('Failed to download receipt image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.receiptNo,
      docType: 'Money_Receipt',
      clientName: data.clientName,
      elementId: 'printable-receipt-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const clientName = data.clientName || 'Client';
    const amountStr = Number(data.amount || 0).toLocaleString('en-IN');

    const brand = getStudioBrand();
    const msg =
      `*📄 ${brand.brandTitle || brand.agencyName}*\n` +
      `*INTERNAL MONEY RECEIPT / VOUCHER (${data.receiptNo || 'MR-2026-000'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Client / Passenger:* ${clientName}\n` +
      `🛂 *Passport:* ${data.passportNumber || 'N/A'}\n` +
      `📌 *Purpose:* ${data.purpose || 'Visa / Ticket Booking'}\n` +
      `💰 *Total Amount:* BDT  ${amountStr}\n` +
      `💳 *Payment Method:* ${data.paymentMethod || 'Cash'}\n` +
      `📅 *Date:* ${data.date || 'Today'} (${data.time || '11:30 AM'})\n` +
      `✍️ *Received By:* ${data.receivedBy || 'Accounts Officer'}\n` +
      `-----------------------------------------\n\n` +
      `🏢 *${brand.agencyName}*\n` +
      `📍 ${brand.address.full}\n` +
      `📞 Helpline: ${brand.phone}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-24 relative">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Receipt}
        title={`Money Receipt Voucher (${data.receiptNo || 'MR-OFFICIAL'})`}
        subtitle="Generate and print official passenger money receipts, payment confirmations, and accounts ledger tokens."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Share Summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadDirect}
              disabled={isDownloading}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Direct Download Image/PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors cursor-pointer"
              title="Export Printable A4 PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export & Print</span>
            </button>
          </div>
        }
      />

      {/* Main Studio Views */}
      {viewMode === 'edit' && (
        <div className="w-full">
          <MoneyReceiptForm
            data={data}
            onChange={setData}
            onReset={handleReset}
            onSave={handleFormSubmit}
            onPreview={() => setViewMode('preview')}
            isSubmitting={isSubmitting}
            isLocked={Boolean(isLocked || initialData?.isLocked)}
            onNumberStateChange={setNumberState}
          />
          {/* Always mount printable canvas for instant print in edit mode */}
          <div className="hidden print:block w-full">
            <MoneyReceiptPreview data={data} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding">
          <MoneyReceiptPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <MoneyReceiptForm
              data={data}
              onChange={setData}
              onReset={handleReset}
              onSave={handleFormSubmit}
              onPreview={() => setViewMode('preview')}
              isSubmitting={isSubmitting}
              isLocked={Boolean(isLocked || initialData?.isLocked)}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <MoneyReceiptPreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom View Switcher (Desktop & Mobile) */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default MoneyReceipt;
