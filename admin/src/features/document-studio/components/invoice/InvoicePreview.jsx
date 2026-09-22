import React from 'react';
import { PrintablePaper } from '../common/PrintablePaper';
import { Printer, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/logo.png';
import { formatToDdMmYyyy, printDocument } from '@/lib/utils';
import agencyInfo from '@/lib/information.json';
import { API_BASE_URL } from '@/lib/api-client';

export function InvoicePreview({ data = {}, onPrint }) {
  const {
    invoiceNo = 'INV-0000',
    issueDate = new Date().toISOString(),
    dueDate = new Date().toISOString(),
    paymentStatus = 'Pending',
    currency = 'BDT',
    taxRate = 0,
    biller = {},
    client = {},
    items = [],
    paymentTerms = 'Payment due within 15 days of invoice date.'
  } = data || {};

  const billerInfo = {
    name: biller?.name || agencyInfo.agencyName?.toUpperCase() || 'PLEXIVIA',
    subtitle: biller?.subtitle || agencyInfo.tagline || 'Your Trusted Travel Partner',
    address: biller?.address || agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
    phone: biller?.phone || agencyInfo.phone || '+8801345579534',
    email: biller?.email || agencyInfo.email || 'contact@plexivia.com',
  };

  const handlePrintAction = onPrint || (() => {
    printDocument({
      docId: invoiceNo,
      docType: 'Invoice',
      clientName: client?.name,
      elementId: 'printable-invoice-canvas',
    });
  });

  // Calculate line items and totals
  const processedItems = (items || []).map(item => {
    const qtyNum = parseFloat(item.quantity);
    const hasQty = !isNaN(qtyNum) && qtyNum > 0;
    const priceNum = parseFloat(item.unitPrice) || 0;
    const lineTotal = hasQty ? (qtyNum * priceNum) : priceNum;

    return {
      ...item,
      isEmpty: false,
      hasQty,
      qtyDisplay: hasQty ? qtyNum : '-',
      lineTotal
    };
  });

  // Ensure a minimum of 3 rows are rendered in the A4 table to preserve single-page fit
  const MIN_ROWS = 3;
  const displayItems = [...processedItems];
  while (displayItems.length < MIN_ROWS) {
    displayItems.push({
      id: `empty-row-${displayItems.length}`,
      isEmpty: true,
      title: '',
      description: '',
      qtyDisplay: '-',
      unitPrice: 0,
      lineTotal: 0
    });
  }

  const subtotal = processedItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Top Controls Bar */}
      <div className="no-print w-full max-w-[850px] mb-3 flex items-center justify-between bg-card border border-border rounded-[4px] px-4 py-2.5 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-foreground">Live Invoice Canvas</span>
          <span>•</span>
          <span className="text-xs">A4 Vector Print Ready</span>
        </div>

        <Button
          type="button"
          variant="success"
          size="sm"
          onClick={handlePrintAction}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Invoice / PDF</span>
        </Button>
      </div>

      {/* Printable A4 Paper Wrapper */}
      <PrintablePaper id="printable-invoice-canvas">
        <div className="flex-1 flex flex-col justify-between text-slate-900 min-h-[960px] print:min-h-0 print:h-full print:justify-between print:p-0">
          
          <div className="space-y-4 print:space-y-2.5 flex-1">
            {/* Header Biller Info & Document Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-3 print:pb-2 gap-4">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2.5">
                  <img src={logoImg} alt="Plexivia Logo" className="w-9 h-9 print:w-8 print:h-8 object-contain rounded-[4px]" />
                  <h1 className="text-xl print:text-lg font-black uppercase tracking-tight text-slate-900">{billerInfo.name}</h1>
                </div>
                <p className="text-xs print:text-[11px] text-slate-700 font-bold">{billerInfo.subtitle}</p>
                <p className="text-xs print:text-[10px] text-slate-600">{billerInfo.address}</p>
                <p className="text-xs print:text-[10px] text-slate-600">Phone: {billerInfo.phone} | Email: {billerInfo.email}</p>
              </div>

              <div className="text-right space-y-1 print:space-y-0.5">
                <div className="inline-block bg-slate-900 text-white px-3.5 py-1 print:px-3 print:py-0.5 rounded-[4px] text-base print:text-sm font-black uppercase tracking-wider">
                  INVOICE
                </div>
                
                <div className="text-xs print:text-[10.5px] font-mono text-slate-800 space-y-0.5">
                  <div><strong>Invoice #:</strong> <span className="font-bold text-emerald-800">{invoiceNo}</span></div>
                  <div><strong>Date:</strong> {formatToDdMmYyyy(issueDate)}</div>
                  <div><strong>Due Date:</strong> {formatToDdMmYyyy(dueDate)}</div>
                </div>

                {/* Status Badge */}
                <div className="pt-0.5">
                  {paymentStatus === 'Paid' && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs print:text-[9.5px] font-black px-2 py-0.5 rounded-[4px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> PAID
                    </span>
                  )}
                  {paymentStatus === 'Pending' && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-400 text-xs print:text-[9.5px] font-black px-2 py-0.5 rounded-[4px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> PENDING
                    </span>
                  )}
                  {paymentStatus === 'Overdue' && (
                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-400 text-xs print:text-[9.5px] font-black px-2 py-0.5 rounded-[4px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> OVERDUE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Client Billed-To Info & Official Verification QR */}
            <div className="bg-slate-50 p-3 print:p-2 rounded-[4px] border border-slate-300 flex justify-between items-center gap-4">
              <div className="text-sm print:text-xs space-y-0.5 flex-1">
                <span className="text-xs print:text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">BILLED TO:</span>
                <div className="font-bold text-base print:text-sm text-slate-900">{client.name || 'Valued Client'}</div>
                {client.contactPerson && <div className="text-xs print:text-[10px] text-slate-700">Attn: {client.contactPerson}</div>}
                {client.address && <div className="text-xs print:text-[10px] text-slate-700">Address: {client.address}</div>}
                {(client.phone || client.email) && (
                  <div className="text-xs print:text-[10px] text-slate-700">Phone: {client.phone || 'N/A'} | Email: {client.email || 'N/A'}</div>
                )}
              </div>

              {/* Official Verification QR Code */}
              <div className="flex items-center justify-center shrink-0">
                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                  <img
                    src={data.qrCode || (data._id ? `${API_BASE_URL}/api/v1/qr/invoice/${data._id}?format=svg` : `${API_BASE_URL}/api/v1/qr/agency?format=svg`)}
                    alt="Invoice Verification QR"
                    className="w-18 h-18 print:w-16 print:h-16 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table with Visible Cell Grid Borders */}
            <div className="border border-slate-900 rounded-[4px] overflow-hidden text-sm print:text-xs">
              <table className="w-full text-left border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-xs print:text-[9.5px] font-bold">
                    <th className="p-2 print:py-1 print:px-1.5 w-10 text-center border border-slate-900">#</th>
                    <th className="p-2 print:py-1 print:px-1.5 w-48 border border-slate-900">Item Title</th>
                    <th className="p-2 print:py-1 print:px-1.5 border border-slate-900">Description</th>
                    <th className="p-2 print:py-1 print:px-1.5 text-center w-16 border border-slate-900">Qty</th>
                    <th className="p-2 print:py-1 print:px-1.5 text-right w-24 border border-slate-900">Rate ({currency})</th>
                    <th className="p-2 print:py-1 print:px-1.5 text-right w-28 border border-slate-900">Total ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {displayItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 font-medium h-8 print:h-6.5">
                      <td className="p-2 print:py-0.5 print:px-1.5 text-center text-slate-500 font-mono border border-slate-300">{idx + 1}</td>
                      <td className="p-2 print:py-0.5 print:px-1.5 text-slate-900 font-bold border border-slate-300">{item.isEmpty ? '—' : (item.title || 'Service Item')}</td>
                      <td className="p-2 print:py-0.5 print:px-1.5 text-slate-800 border border-slate-300">{item.isEmpty ? '—' : (item.description || '—')}</td>
                      <td className="p-2 print:py-0.5 print:px-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300">{item.qtyDisplay}</td>
                      <td className="p-2 print:py-0.5 print:px-1.5 text-right font-mono border border-slate-300">{item.isEmpty ? '-' : (parseFloat(item.unitPrice) || 0).toLocaleString('en-IN')}</td>
                      <td className="p-2 print:py-0.5 print:px-1.5 text-right font-mono font-bold text-slate-900 border border-slate-300">{item.isEmpty ? '-' : item.lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Financial Totals */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 print:gap-2 pt-1">
              <div className="max-w-md text-xs print:text-[10px] space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-xs print:text-[9.5px]">Payment Terms & Notes:</span>
                <p className="bg-slate-50 p-2 print:p-1.5 rounded-[4px] border border-slate-300 text-slate-700 leading-relaxed text-xs print:text-[9.5px]">
                  {paymentTerms || 'Payment due within 15 days of invoice date.'}
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-0.5 text-sm print:text-xs font-mono border-t border-slate-400 pt-1">
                <div className="flex justify-between text-slate-700 text-xs print:text-[10.5px]">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString('en-IN')} {currency}</span>
                </div>
                
                {taxRate > 0 && (
                  <div className="flex justify-between text-slate-700 text-xs print:text-[10.5px]">
                    <span>Tax ({taxRate}%):</span>
                    <span>{taxAmount.toLocaleString('en-IN')} {currency}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm print:text-xs font-bold text-slate-900 border-t-2 border-slate-900 pt-1 bg-slate-100 p-1.5 rounded-[4px]">
                  <span>Grand Total:</span>
                  <span>{grandTotal.toLocaleString('en-IN')} {currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Block */}
          <div className="mt-auto pt-4 print:pt-2 flex justify-between items-end text-xs print:text-[10px] text-slate-900 print:break-inside-avoid page-break-inside-avoid">
            <div className="text-center space-y-1">
              <div className="border-b border-slate-400 w-40 print:w-36 mb-1"></div>
              <div className="text-xs print:text-[9.5px] text-slate-500 font-medium">Client Signature</div>
            </div>

            <div className="text-center space-y-0.5">
              <div className="border-b-2 border-slate-900 w-48 print:w-40 mb-1"></div>
              <div className="font-bold text-sm print:text-xs text-slate-900">{billerInfo.name}</div>
              <div className="text-xs print:text-[9.5px] text-slate-600">Authorized Signature & Seal</div>
            </div>
          </div>

        </div>
      </PrintablePaper>
    </div>
  );
}
