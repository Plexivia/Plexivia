import React, { useState, useEffect } from 'react';
import { CashVoucherForm } from './CashVoucherForm';
import { CashVoucherPreview } from './CashVoucherPreview';
import { getDefaultCashVoucherData, generateVoucherNo } from './sampleData';
import { Download, RefreshCw, Share2, Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { studioDocumentsApi } from '@/services/settingsApi';
import { printDocument, downloadDocumentDirect } from '@/lib/utils';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function CashVoucher({ initialData = null, isLocked = false, onSavedSuccess = null }) {
  const [data, setData] = useState(() => ({
    ...getDefaultCashVoucherData(),
    ...(initialData || {}),
  }));
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        ...initialData,
        paidTo: initialData.paidTo || initialData.clientName || prev.paidTo,
        purpose: initialData.purpose || prev.purpose,
      }));
    }
  }, [initialData]);

  const handleReset = () => {
    setData(getDefaultCashVoucherData());
    toast.info('Cash voucher form has been reset.');
  };

  const handleFormSubmit = async () => {
    if (!data.items || data.items.length === 0) {
      toast.error('Add at least one expense item.');
      return;
    }
    if (!data.grandTotal || Number(data.grandTotal) <= 0) {
      toast.error('The grand total must be greater than zero.');
      return;
    }

    const finalVoucherNo = data.voucherNo?.trim() || generateVoucherNo();
    const body = {
      type: 'cash-voucher',
      number: finalVoucherNo,
      clientName: data.paidTo || data.receivedBy || '',
      paymentMethod: data.paymentMethod || '',
      amount: Number(data.grandTotal || 0),
      status: 'Paid',
      issueDate: data.date || new Date().toISOString().slice(0, 10),
      payload: {
        ...data,
        voucherNo: finalVoucherNo,
        subtotal: Number(data.subtotal || 0),
        taxVat: Number(data.taxVat || 0),
        grandTotal: Number(data.grandTotal || 0),
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
        voucherNo: saved.number || finalVoucherNo,
      }));

      if (onSavedSuccess) onSavedSuccess(saved);
      toast.success(
        isEdit
          ? `Cash voucher ${saved.number || finalVoucherNo} updated.`
          : `Cash voucher ${saved.number || finalVoucherNo} saved.`
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Could not save the cash voucher. It has not been recorded.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDirect = async () => {
    setIsDownloading(true);
    try {
      await downloadDocumentDirect({
        docId: data.voucherNo,
        docType: 'Cash_Voucher',
        clientName: data.paidTo || data.receivedBy,
        elementId: 'cash-voucher-canvas',
      });
      toast.success(`Cash Voucher #${data.voucherNo} downloaded successfully!`);
    } catch (err) {
      toast.error('Failed to download voucher image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data.voucherNo,
      docType: 'Cash_Voucher',
      clientName: data.paidTo || data.receivedBy,
      elementId: 'cash-voucher-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const total = Number(data.grandTotal || 0).toLocaleString('en-IN');
    const msg =
      `*📄 PLEXIVIA*\n` +
      `*OFFICIAL CASH MONEY VOUCHER*\n` +
      `*Voucher No:* ${data.voucherNo || 'MAT-KV'}\n` +
      `-----------------------------------------\n` +
      `👤 *Paid To:* ${data.paidTo || 'N/A'}\n` +
      `📌 *Category:* ${data.category || 'Office Expense'}\n` +
      `📅 *Date:* ${data.voucherDate || 'N/A'}\n` +
      `💰 *Grand Total:* BDT  ${total}\n` +
      `📝 *In Words:* ${data.grandTotalInWordsEn || 'N/A'}\n` +
      (data.receivedBy ? `✍️ *Received By:* ${data.receivedBy}\n` : '') +
      `-----------------------------------------\n\n` +
      `🏢 *Plexivia*\n` +
      `📍 Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Helpline: +8801345579534\n` +
      `🌐 plexivia.com`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={Receipt}
        title={`Cash Money Voucher (${data.voucherNo || 'MAT-KV'})`}
        subtitle="Official agency expense voucher, payment memo, and petty cash verification voucher generator."
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
        <div className="w-full pb-16">
          <CashVoucherForm
            data={data}
            onChange={setData}
            onReset={handleReset}
            onSave={handleFormSubmit}
            onPreview={() => setViewMode('preview')}
            isSubmitting={isSubmitting}
            isLocked={Boolean(isLocked || initialData?.isLocked)}
          />
          <div className="hidden print:block w-full">
            <CashVoucherPreview data={data} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <CashVoucherPreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <CashVoucherForm
              data={data}
              onChange={setData}
              onReset={handleReset}
              onSave={handleFormSubmit}
              onPreview={() => setViewMode('preview')}
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <CashVoucherPreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default CashVoucher;
