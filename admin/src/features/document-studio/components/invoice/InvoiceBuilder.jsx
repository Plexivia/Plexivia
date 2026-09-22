import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { getDefaultInvoiceData, generateUniqueInvoiceNo } from './sampleData';
import { Download, RefreshCw, Share2, Printer, FileSpreadsheet } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
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
    const items = data.items || [];
    const subtotal = items.reduce((acc, item) => {
      const qtyNum = parseFloat(item.quantity);
      const hasQty = !isNaN(qtyNum) && qtyNum > 0;
      const priceNum = parseFloat(item.unitPrice) || 0;
      const lineTotal = hasQty ? (qtyNum * priceNum) : priceNum;
      return acc + lineTotal;
    }, 0);
    const taxAmount = (subtotal * (parseFloat(data.taxRate) || 0)) / 100;
    const grandTotal = subtotal + taxAmount;

    const payload = {
      ...data,
      caseDid: initialData?.caseDid || incomingInvoiceData?.caseDid,
      caseNumber: initialData?.caseNumber || incomingInvoiceData?.caseNumber,
      subtotal,
      taxAmount,
      grandTotal,
    };

    if (!payload.invoiceNo) {
      delete payload.invoiceNo;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(data._id);
      const res = isEdit
        ? await apiClient.put(`/api/v1/client/docs/invoices/${data._id}`, payload)
        : await apiClient.post('/api/v1/client/docs/invoices', payload);

      const savedDoc = res.data?.data;
      if ((res.data?.status === 'success' || res.data?.success) && savedDoc) {
        const returnedInvoiceNo = savedDoc.invoiceNo || generateUniqueInvoiceNo();
        setData((prev) => ({
          ...prev,
          _id: savedDoc._id,
          invoiceNo: returnedInvoiceNo,
          qrCode: savedDoc.qrCode || prev.qrCode || '',
        }));

        if (initialData?.caseDid) {
          try {
            await apiClient.post(`/api/v1/client/cases/${initialData.caseDid}/documents`, {
              documentName: `Invoice #${returnedInvoiceNo}`,
              fileName: `Invoice-${returnedInvoiceNo}.pdf`,
              fileUrl: savedDoc.pdfUrl || `/api/v1/client/docs/invoices/${savedDoc._id}/pdf`,
              fileType: 'application/pdf',
              fileSize: '1.2 MB',
              accessLevel: 'Public',
            });
          } catch (_) {}
        }

        if (onSavedSuccess) onSavedSuccess(savedDoc);

        toast.success(
          isEdit
            ? `Invoice successfully updated! (Invoice No: ${returnedInvoiceNo})`
            : `Invoice successfully saved to database! (Invoice No: ${returnedInvoiceNo})`
        );
      } else {
        throw new Error(res.data?.message || 'Failed to save invoice to database.');
      }
    } catch (err) {
      console.warn('Backend API save warning (falling back to offline preview):', err);
      const fallbackInvoiceNo = data.invoiceNo || generateUniqueInvoiceNo();
      setData((prev) => ({
        ...prev,
        invoiceNo: fallbackInvoiceNo,
      }));
      toast.info(`Invoice preview ready! (Invoice No: ${fallbackInvoiceNo})`);
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

    const msg =
      `*📄 PLEXIVIA*\n` +
      `*Invoice & Billing Details (${data.invoiceNo || 'Official Invoice'})*\n` +
      `-----------------------------------------\n` +
      `👤 *Billed To:* ${clientName}\n` +
      `📞 *Phone:* ${data.client?.phone || 'N/A'}\n` +
      `💰 *Total Amount:* BDT  ${Number(grandTotal).toLocaleString('en-IN')}\n` +
      `📌 *Status:* ${data.paymentStatus || 'Paid'}\n` +
      `📅 *Date:* ${data.issueDate || 'Today'}\n\n` +
      `🏢 *PLEXIVIA*\n` +
      `📍 Mominpur Jagannathpur Road, Sunamganj, Post Code 3060\n` +
      `📞 Contact Helpline: +8801345579534`;

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
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-colors cursor-pointer"
              title="Reset Form"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
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
