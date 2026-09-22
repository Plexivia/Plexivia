import React, { useState, useEffect } from 'react';
import { MoneyReceiptForm } from './MoneyReceiptForm';
import { MoneyReceiptPreview } from './MoneyReceiptPreview';
import { getDefaultMoneyReceiptData, generateReceiptNo, numberToWords } from './sampleData';
import { Download, RefreshCw, Share2, Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
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

  const handleFormSubmit = async () => {
    if (!data.clientName?.trim()) {
      toast.error('Client / Passenger Name is required!');
      return;
    }
    if (!data.amount || Number(data.amount) <= 0) {
      toast.error('Valid Total Amount is required!');
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const payload = {
        ...data,
        caseDid: initialData?.caseDid || data.caseDid,
        caseNumber: initialData?.caseNumber || data.caseNumber,
        taskId: initialData?.taskId || data.taskId,
        amount: Number(data.amount),
        amountInWords: data.amountInWords || numberToWords(Number(data.amount)),
      };

      const res = isEdit
        ? await apiClient.put(`/api/v1/client/receipts/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/receipts', payload);

      const saved = res.data?.data;
      if (res.data?.success || res.data?.status === 'success' || saved) {
        const returnedNo = saved?.receiptNo || data.receiptNo || generateReceiptNo();
        setData((prev) => ({
          ...prev,
          ...saved,
          _id: saved?._id || prev._id,
          receiptNo: returnedNo,
          qrCode: saved?.qrCode || prev.qrCode,
          did: saved?.did || prev.did,
        }));

        if (initialData?.caseDid) {
          try {
            await apiClient.post(`/api/v1/client/cases/${initialData.caseDid}/documents`, {
              documentName: `Money Receipt #${returnedNo}`,
              fileName: `Receipt-${returnedNo}.pdf`,
              fileUrl: saved?.pdfUrl || `/api/v1/client/receipts/${saved?._id}/pdf`,
              fileType: 'application/pdf',
              fileSize: '1.0 MB',
              accessLevel: 'Public',
            });
          } catch (_) {}
        }

        if (onSavedSuccess) onSavedSuccess(saved);

        toast.success(
          isEdit
            ? `Money receipt #${returnedNo} updated successfully!`
            : `Money receipt #${returnedNo} saved to database!`
        );
      } else {
        throw new Error(res.data?.message || 'Failed to save receipt.');
      }
    } catch (err) {
      console.warn('Receipt save warning (preview mode ready):', err);
      toast.info(`Money receipt voucher preview ready! (#${data.receiptNo})`);
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

    const msg =
      `*📄 PLEXIVIA*\n` +
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
      `🏢 *Plexivia*\n` +
      `📍 Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Helpline: +8801345579534`;

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
              className="flex items-center space-x-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-100 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-400/40 transition-colors cursor-pointer shadow-2xs"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-300" />
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
