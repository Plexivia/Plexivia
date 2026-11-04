import { getStudioBrand } from '../common/useStudioBrand';
import { getDocumentDefaults } from '../common/useStudioBrand';

export function generateUniqueInvoiceNo() {
  const prefix = (getDocumentDefaults().invoicePrefix || 'PX-INV').replace(/-+$/, '');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const getDigits = (len) => {
    let res = '';
    for (let i = 0; i < len; i++) res += Math.floor(Math.random() * 10);
    return res;
  };

  const prefixLetters = getChar() + getChar();
  const firstDigits = getDigits(4);
  const midLetter = getChar();
  const lastDigits = getDigits(3);

  return `${prefix}-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

export function getDefaultInvoiceData() {
  const agencyInfo = getStudioBrand();
  const defaults = getDocumentDefaults();
  return {
    _id: null,
    savedDocId: null,
    invoiceNo: generateUniqueInvoiceNo(),
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + (defaults.invoiceDueDays || 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentStatus: "Pending", // 'Paid' | 'Pending' | 'Overdue'
    currency: defaults.currency || "BDT",
    taxRate: defaults.defaultTaxRate || 0,

    biller: {
      name: agencyInfo.agencyName?.toUpperCase() || "PLEXIVIA",
      subtitle: agencyInfo.tagline || "",
      address: agencyInfo.address?.full || "",
      city: agencyInfo.address ? `${agencyInfo.address.district || ''}, ${agencyInfo.address.country || ''}` : '',
      phone: agencyInfo.phone || "",
      email: agencyInfo.email || ""
    },

    client: {
      name: "",
      contactPerson: "",
      address: "",
      phone: "",
      email: ""
    },

    items: [
      {
        id: "item-1",
        title: "",
        description: "",
        quantity: "",
        unitPrice: ""
      }
    ],

    paymentTerms: defaults.paymentTerms || `Payment due within ${defaults.invoiceDueDays || 15} days of the invoice date.`
  };
}

export const SAMPLE_INVOICE = getDefaultInvoiceData();
