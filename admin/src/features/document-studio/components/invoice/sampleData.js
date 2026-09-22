import agencyInfo from '@/lib/information.json';

export function generateUniqueInvoiceNo() {
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

  return `I-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

export function getDefaultInvoiceData() {
  return {
    _id: null,
    invoiceNo: generateUniqueInvoiceNo(),
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentStatus: "Paid", // 'Paid' | 'Pending' | 'Overdue'
    currency: "BDT",
    taxRate: 0,

    biller: {
      name: agencyInfo.agencyName?.toUpperCase() || "PLEXIVIA",
      subtitle: agencyInfo.tagline || "Your Trusted Travel Partner",
      address: agencyInfo.address?.full || "Mominpur Jagannathpur Road, Sunamganj, Post Code 3060",
      city: `${agencyInfo.address?.district || 'Sunamganj'}, ${agencyInfo.address?.country || 'Bangladesh'}`,
      phone: agencyInfo.phone || "+8801345579534",
      email: agencyInfo.email || "contact@plexivia.com"
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

    paymentTerms: "Payment due within 15 days of invoice date. Bank Wire Transfer to Islami Bank Bangladesh."
  };
}

export const SAMPLE_INVOICE = getDefaultInvoiceData();
