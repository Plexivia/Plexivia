// Generate unique sequential receipt number with Plexivia prefix
export const generateReceiptNo = () => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hex = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();
  return `PLX-MR-${yy}${mm}${dd}-${hex}`;
};

// Generate QR code text for receipt authentication
export const generateReceiptQrText = (receiptNo) => {
  return `https://plexivia.com/verify/receipt/${receiptNo}`;
};

// Convert numeric amount into formal currency words representation
export const numberToWords = (amount) => {
  if (!amount || isNaN(amount) || amount <= 0) return '';
  const num = Math.floor(amount);

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertHundreds = (n) => {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  };

  let result = '';
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = rem;

  if (crore > 0) result += convertHundreds(crore) + ' Crore ';
  if (lakh > 0) result += convertHundreds(lakh) + ' Lakh ';
  if (thousand > 0) result += convertHundreds(thousand) + ' Thousand ';
  if (hundred > 0) result += convertHundreds(hundred) + ' ';

  result = result.trim();
  return result ? `${result} Taka Only.` : '';
};

export const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash' },
  { id: 'bKash', label: 'bKash Mobile Banking' },
  { id: 'Bank Transfer', label: 'Bank Transfer' },
  { id: 'Online Payment', label: 'Online Payment' },
];

export const SERVICE_PURPOSES = [
  'Investment Amount (Working Capital / Equity)',
  'Client Software Retainer & Subscription',
  'Cloud Infrastructure & Hosting Maintenance',
  'Software Development & API Integration',
  'UI/UX Design & Branding Consultancy',
  'Technical Audit & Security Assessment',
  'Other Corporate Service & Consultancy Fee',
];

// Return default money receipt initial dataset
export const getDefaultMoneyReceiptData = () => {
  return {
    _id: null,
    receiptNo: generateReceiptNo(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    clientName: '',
    passportNumber: '',
    phone: '',
    purpose: '',
    receivedBy: 'accounts@plexivia.com',
    receivedByRole: 'Accounts Officer',
    paymentMethod: 'bKash',
    amount: '',
    amountInWords: '',
    preparedBy: 'Paid By',
    receivedBySignature: 'Received By',
    accountsSignature: 'Accountant',
    approvedBySignature: 'General Manager / Director',
    copyType: 'Original Copy (Original Copy)',
    dualPrint: true,
    notes: '',
  };
};
