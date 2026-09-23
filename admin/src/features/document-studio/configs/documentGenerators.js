import {
  FileSignature,
  Contact,
  Banknote,
  ReceiptText,
  Receipt,
  Wallet,
  Award,
} from 'lucide-react';

export const DOCUMENT_GENERATORS = [
  {
    id: 'agreement',
    title: 'Employment Agreement',
    bnTitle: '',
    category: 'contracts',
    categoryLabel: 'Contracts & Legal',
    description: 'Bilingual (Bangla & English) standard overseas and agency employment legal contract.',
    bnDescription: '',
    icon: FileSignature,
    color: 'from-blue-600 to-indigo-600',
    badge: 'Legal Contract',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'idcard',
    title: 'Employee ID Card',
    bnTitle: '',
    category: 'hr',
    categoryLabel: 'HR & Identity',
    description: 'Front and back official corporate employee identity card with QR and blood group.',
    bnDescription: '',
    icon: Contact,
    color: 'from-indigo-600 to-purple-600',
    badge: 'Identity Card',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'payroll',
    title: 'Monthly Salary Slip',
    bnTitle: '',
    category: 'hr',
    categoryLabel: 'HR & Payroll',
    description: 'Complete breakdown of earnings, allowances, deductions, attendance and net salary.',
    bnDescription: '',
    icon: Banknote,
    color: 'from-teal-600 to-emerald-600',
    badge: 'Payroll Slip',
    badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'invoice',
    title: 'Invoice Billing',
    bnTitle: '',
    category: 'accounts',
    categoryLabel: 'Accounts & Billing',
    description: 'Professional client invoice with itemized charges, VAT, tax and payment status.',
    bnDescription: '',
    icon: ReceiptText,
    color: 'from-violet-600 to-purple-600',
    badge: 'Tax Invoice',
    badgeStyle: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    id: 'money-receipt',
    title: 'Money Receipt Voucher',
    bnTitle: '',
    category: 'accounts',
    categoryLabel: 'Accounts & Receipts',
    description: 'Official payment receipt voucher with amount in words, method and signatures.',
    bnDescription: '',
    icon: Receipt,
    color: 'from-blue-600 to-cyan-600',
    badge: 'Official Receipt',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'cash-voucher',
    title: 'Cash Money Voucher',
    bnTitle: '',
    category: 'accounts',
    categoryLabel: 'Accounts & Vouchers',
    description: 'Office cash disbursement and petty cash debit/credit expense voucher.',
    bnDescription: '',
    icon: Wallet,
    color: 'from-cyan-600 to-blue-600',
    badge: 'Cash Voucher',
    badgeStyle: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'experience-certificate',
    title: 'Experience Certificate',
    bnTitle: '',
    category: 'certificates',
    categoryLabel: 'Certificates',
    description: 'Official corporate work experience and service release certificate letter.',
    bnDescription: '',
    icon: Award,
    color: 'from-rose-600 to-pink-600',
    badge: 'Certificate',
    badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All Documents', bnLabel: '', count: 7 },
  { id: 'contracts', label: 'Contracts & Forms', bnLabel: '', count: 1 },
  { id: 'accounts', label: 'Accounts & Billing', bnLabel: '', count: 3 },
  { id: 'hr', label: 'HR & Payroll', bnLabel: '', count: 2 },
  { id: 'certificates', label: 'Certificates', bnLabel: '', count: 1 },
];

// Retrieve document generator configuration by unique ID
export const getGeneratorById = (id) => {
  if (!id) return null;
  return DOCUMENT_GENERATORS.find(
    (g) =>
      g.id === id ||
      (id === 'receipt' && g.id === 'money-receipt') ||
      (id === 'certificate-exp' && g.id === 'experience-certificate')
  );
};
