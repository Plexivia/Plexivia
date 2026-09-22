import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatToBengaliDate(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatToDdMmYyyy(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatCurrency(amount: number | string, currency: string = 'BDT'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Extract document ID from any standard document data object
 */
export function getDocumentId(data: any): string {
  if (!data || typeof data !== 'object') return '';
  return (
    data.id ||
    data._id ||
    data.verificationId ||
    data.agreementId ||
    data.invoiceNo ||
    data.slipNo ||
    data.applicationNo ||
    data.receiptNo ||
    data.trackingNo ||
    data.tokenNo ||
    data.voucherNo ||
    data.customId ||
    ''
  );
}

/**
 * Extract recipient/client name from data object
 */
export function getDocumentRecipientName(data: any): string {
  if (!data || typeof data !== 'object') return '';
  return (
    data.clientInfo?.clientName ||
    data.client?.fullName ||
    data.client?.name ||
    data.name ||
    data.applicantName ||
    data.employeeName ||
    data.paidTo ||
    data.receivedBy ||
    ''
  );
}

/**
 * Prints a target DOM element inside an isolated, invisible iframe.
 */
function printElementInIsolatedFrame(targetEl: HTMLElement, pdfFileName: string, originalTitle: string) {
  const existingFrame = document.getElementById('__print_frame__');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = '__print_frame__';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!frameDoc) {
    throw new Error('Unable to access iframe document');
  }

  let stylesHtml = '';
  const headElements = document.querySelectorAll('link[rel="stylesheet"], style');
  headElements.forEach((node) => {
    stylesHtml += node.outerHTML + '\n';
  });

  const printOverrides = `
    <style>
      @page {
        size: A4 portrait;
        margin: 0 !important;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #111827 !important;
        width: 100% !important;
        min-height: 100% !important;
        height: auto !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
        visibility: visible !important;
      }
      body * {
        visibility: visible !important;
      }
      .printable-a4-paper,
      [id*="canvas"],
      [id*="printable"] {
        width: 210mm !important;
        max-width: 210mm !important;
        min-height: 296mm !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
        padding: 8mm 10mm !important;
        border: none !important;
        box-shadow: none !important;
        background: #ffffff !important;
        color: #111827 !important;
        display: flex !important;
        flex-direction: column !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        position: relative !important;
        visibility: visible !important;
      }
      .no-print, .no-print * {
        display: none !important;
        visibility: hidden !important;
      }
    </style>
  `;

  const clone = targetEl.cloneNode(true) as HTMLElement;
  if (clone.classList) {
    clone.classList.remove('hidden');
  }
  if (clone.style) {
    clone.style.display = '';
    clone.style.visibility = 'visible';
  }

  frameDoc.open();
  frameDoc.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${pdfFileName}</title>
    ${stylesHtml}
    ${printOverrides}
  </head>
  <body style="margin:0; padding:0; background:#ffffff;">
    <div style="width:100%; display:flex; justify-content:center; margin:0; padding:0;">
      ${clone.outerHTML}
    </div>
  </body>
</html>`);
  frameDoc.close();

  document.title = pdfFileName;
  if (frameDoc.title) {
    frameDoc.title = pdfFileName;
  }

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print failed, falling back to window.print():', err);
      window.print();
    } finally {
      setTimeout(() => {
        document.title = originalTitle;
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 2000);
    }
  };

  if (frameDoc.fonts && frameDoc.fonts.ready) {
    frameDoc.fonts.ready.then(() => {
      setTimeout(triggerPrint, 150);
    }).catch(() => {
      setTimeout(triggerPrint, 250);
    });
  } else {
    setTimeout(triggerPrint, 250);
  }
}

export interface PrintDocumentOptions {
  docId?: string;
  docType?: string;
  clientName?: string;
  data?: any;
  extra?: string;
  elementId?: string;
  element?: HTMLElement | null;
}

export function printDocument({
  docId,
  docType = '',
  clientName = '',
  data = null,
  extra = '',
  elementId = '',
  element = null,
}: PrintDocumentOptions = {}) {
  const originalTitle = document.title;

  const resolvedId = docId || (data ? getDocumentId(data) : '');
  const resolvedName = clientName || (data ? getDocumentRecipientName(data) : '');

  const cleanId = String(resolvedId || '').trim();
  const cleanType = String(docType || '').trim().replace(/[\s/\\:*?"<>|]+/g, '_');
  const cleanName = String(resolvedName || '').trim().replace(/[\s/\\:*?"<>|]+/g, '_');
  const cleanExtra = String(extra || '').trim().replace(/[\s/\\:*?"<>|]+/g, '_');

  const parts: string[] = [];
  if (cleanId) parts.push(cleanId);
  if (cleanType) parts.push(cleanType);
  if (cleanName) parts.push(cleanName);
  if (cleanExtra) parts.push(cleanExtra);

  const pdfFileName = parts.length > 0 ? parts.join('_') : 'Document';

  let targetEl: HTMLElement | null = element;
  if (!targetEl && elementId) {
    targetEl = document.getElementById(elementId);
  }

  if (targetEl && typeof window !== 'undefined' && document.body) {
    try {
      printElementInIsolatedFrame(targetEl, pdfFileName, originalTitle);
      return;
    } catch (err) {
      console.warn('Isolated iframe print failed, falling back to window.print():', err);
    }
  }

  try {
    document.title = pdfFileName;
    window.print();
  } finally {
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  }
}

export async function downloadDocumentDirect({
  docId,
  docType = 'Document',
  clientName = '',
  elementId = '',
  element = null,
}: PrintDocumentOptions = {}) {
  const cleanId = String(docId || '').trim();
  const cleanType = String(docType || 'Document').trim().replace(/[\s/\\:*?"<>|]+/g, '_');
  const cleanName = String(clientName || 'Client').trim().replace(/[\s/\\:*?"<>|]+/g, '_');

  const parts: string[] = [];
  if (cleanId) parts.push(cleanId);
  if (cleanType) parts.push(cleanType);
  if (cleanName) parts.push(cleanName);
  const fileName = (parts.length > 0 ? parts.join('_') : 'Document') + '.png';

  let targetEl: HTMLElement | null = element;
  if (!targetEl && elementId) {
    targetEl = document.getElementById(elementId);
  }

  if (targetEl && typeof window !== 'undefined') {
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(targetEl, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      return true;
    } catch (err) {
      console.warn('Direct canvas download error, falling back to printDocument:', err);
    }
  }

  printDocument({ docId, docType, clientName, elementId, element });
  return true;
}
