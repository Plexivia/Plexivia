import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { getDefaultInvoiceData, generateUniqueInvoiceNo } from './sampleData';
import { Download, RefreshCw, Share2, Printer, FileSpreadsheet } from 'lucide-react';
import { studioDocumentsApi } from '@/services/settingsApi';
import { printDocument, downloadDocumentDirect } from '@/lib/utils';
import { toast } from 'sonner';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { StudioFloatingViewSwitcher } from '../common/StudioFloatingViewSwitcher';

export function InvoiceBuilder({ initialData = null, isLocked = false, onSavedSuccess }) {
  const location = useLocation();
  const incomingInvoiceData = initialData || location.state?.invoiceData || location.state?.initialData || null;
  const [isDownloading, setIsDownloading] = useState(false);

  const [data, setData] = useState(() => {
    const defaultData = getDefaultInvoiceData();
    if (!incomingInvoiceData) return defaultData;

    const resolvedClientName = incomingInvoiceData.client?.name || incomingInvoiceData.clientName || incomingInvoiceData.applicantName || '';
    const resolvedPhone = incomingInvoiceData.client?.phone || incomingInvoiceData.phone || '';
    const resolvedEmail = incomingInvoiceData.client?.email || incomingInvoiceData.email || '';
    const resolvedAddress = incomingInvoiceData.client?.address || incomingInvoiceData.address || incomingInvoiceData.presentAddress || '';

    return {
      ...defaultData,
      ...incomingInvoiceData,
      client: {
        ...defaultData.client,
        name: resolvedClientName,
        contactPerson: incomingInvoiceData.client?.contactPerson || resolvedClientName,
        phone: resolvedPhone,
        email: resolvedEmail,
        address: resolvedAddress,
      },
      biller: {
        ...defaultData.biller,
        ...(incomingInvoiceData.biller || {}),
      },
      items:
        incomingInvoiceData.items && incomingInvoiceData.items.length > 0
          ? incomingInvoiceData.items
          : defaultData.items,
    };
  });

  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'split' | 'preview'
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Reported by the invoice-number field: 'available' | 'taken' | 'checking' | ...
  const [numberState, setNumberState] = useState('idle');

  useEffect(() => {
    if (initialData) {
      const resolvedClientName = initialData.client?.name || initialData.clientName || initialData.applicantName || '';
      const resolvedPhone = initialData.client?.phone || initialData.phone || '';
      const resolvedEmail = initialData.client?.email || initialData.email || '';
      const resolvedAddress = initialData.client?.address || initialData.address || initialData.presentAddress || '';

      setData((prev) => ({
        ...prev,
        ...initialData,
        client: {
          ...prev.client,
          name: resolvedClientName || prev.client.name,
          contactPerson: initialData.client?.contactPerson || resolvedClientName || prev.client.contactPerson,
          phone: resolvedPhone || prev.client.phone,
          email: resolvedEmail || prev.client.email,
          address: resolvedAddress || prev.client.address,
        },
        items: initialData.items && initialData.items.length > 0 ? initialData.items : prev.items,
      }));
    }
  }, [initialData]);

  const handleReset = () => {
    setData(getDefaultInvoiceData());
    toast.info('Invoice data reset to default.');
  };

  const handleFormSubmit = async () => {
    if (!data.client?.name?.trim()) {
      toast.error('Client name is required.');
      return;
    }
    if (numberState === 'taken') {
      toast.error('That invoice number is already used. Press the wand to generate a new one.');
      return;
    }

    const items = data.items || [];
    const subtotal = items.reduce((acc, item) => {
      const qtyNum = parseFloat(item.quantity);
      const hasQty = !isNaN(qtyNum) && qtyNum > 0;
      const priceNum = parseFloat(item.unitPrice) || 0;
      return acc + (hasQty ? qtyNum * priceNum : priceNum);
    }, 0);
    const taxAmount = (subtotal * (parseFloat(data.taxRate) || 0)) / 100;
    const grandTotal = subtotal + taxAmount;

    const finalInvoiceNo = data.invoiceNo?.trim() || generateUniqueInvoiceNo();
    const body = {
      type: 'invoice',
      number: finalInvoiceNo,
      clientId: data.clientId || initialData?.clientId || '',
      clientName: data.client?.name || '',
      amount: grandTotal,
      currency: data.currency || 'BDT',
      status: data.paymentStatus || 'Pending',
      issueDate: data.issueDate || new Date().toISOString().slice(0, 10),
      payload: { ...data, invoiceNo: finalInvoiceNo, subtotal, taxAmount, grandTotal },
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
        invoiceNo: saved.number || finalInvoiceNo,
      }));

      if (onSavedSuccess) onSavedSuccess(saved);
      toast.success(
        isEdit
          ? `Invoice ${saved.number || finalInvoiceNo} updated.`
          : `Invoice ${saved.number || finalInvoiceNo} saved.`
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Could not save the invoice. It has not been recorded.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDirect = async () => {
    setIsDownloading(true);
    try {
      await downloadDocumentDirect({
        docId: data?.invoiceNo,
        docType: 'Invoice',
        clientName: data?.client?.name,
        elementId: 'printable-invoice-canvas',
      });
      toast.success(`Invoice #${data?.invoiceNo || 'Document'} downloaded successfully!`);
    } catch (err) {
      toast.error('Failed to download invoice image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printDocument({
      docId: data?.invoiceNo,
      docType: 'Invoice',
      clientName: data?.client?.name,
      elementId: 'printable-invoice-canvas',
    });
  };

  const handleWhatsAppShare = () => {
    const clientName = data.client?.name || 'Valued Client';
    const items = data.items || [];
    const subtotal = items.reduce((acc, item) => acc + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)), 0);
    const taxAmount = (subtotal * (parseFloat(data.taxRate) || 0)) / 100;
    const grandTotal = subtotal + taxAmount;

    const brand = getStudioBrand();
    const msg =
      `*📄 ${brand.brandTitle || brand.agencyName}*\n` +
      `*Invoice & Billing Details (${data.invoiceNo || 'Official Invoice'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Billed To:* ${clientName}\n` +
      `📞 *Phone:* ${data.client?.phone || 'N/A'}\n` +
      `💰 *Total Amount:* BDT  ${Number(grandTotal).toLocaleString('en-IN')}\n` +
      `📌 *Status:* ${data.paymentStatus || 'Paid'}\n` +
      `📅 *Date:* ${data.issueDate || 'Today'}\n\n` +
      `🏢 *${brand.agencyName}*\n` +
      `📍 ${brand.address.full}\n` +
      `📞 Contact Helpline: ${brand.phone}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Signature Dark Blue Gradient Top Header */}
      <HeaderTitle
        icon={FileSpreadsheet}
        title={`Invoice & Billing Generator (${data.invoiceNo || 'INV-OFFICIAL'})`}
        subtitle="Official agency invoice builder with auto-tax, line items calculations, and QR verification."
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
          <InvoiceForm
            data={data}
            onChange={setData}
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isSubmitting={isSubmitting}
            isLocked={isLocked}
            onNumberStateChange={setNumberState}
          />
          <div className="hidden print:block w-full">
            <InvoicePreview data={data} />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
        <div className="w-full flex justify-center py-2 no-print-padding pb-16">
          <InvoicePreview data={data} />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-16">
          <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            <InvoiceForm
              data={data}
              onChange={setData}
              onSubmit={handleFormSubmit}
              onReset={handleReset}
              isSubmitting={isSubmitting}
              isLocked={isLocked}
            />
          </div>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-140px)] flex justify-center">
            <div className="scale-[0.88] origin-top">
              <InvoicePreview data={data} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky View Mode Switcher */}
      <StudioFloatingViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
}

export default InvoiceBuilder;
