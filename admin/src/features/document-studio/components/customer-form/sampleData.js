export function generateApplicationNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const getChar = () => letters.charAt(Math.floor(Math.random() * letters.length));
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CGA-${getChar()}${getChar()}-${num}`;
}

export const SERVICE_TYPES = [
  { id: 'indian_visa', label: 'Indian Visa Application', bn: '' },
  { id: 'work_permit', label: 'Work Permit & Job Placement', bn: '' },
  { id: 'tourist_visa', label: 'Tourist / Visit Visa', bn: '' },
  { id: 'passport_services', label: 'Passport Services', bn: '' },
  { id: 'umrah_package', label: 'Umrah Processing', bn: '' },
  { id: 'air_ticket', label: 'Air Ticket Booking', bn: '' },
  { id: 'other_services', label: 'Other Consular Services', bn: '' }
];

export const STATUS_OPTIONS = [
  { id: 'received', label: 'File Received', bn: '', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  { id: 'under_review', label: 'Under Verification', bn: '', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  { id: 'processing', label: 'Processing', bn: '', color: 'bg-purple-500/15 text-purple-600 border-purple-500/30' },
  { id: 'embassy_submitted', label: 'Submitted to Embassy/VFS', bn: '', color: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30' },
  { id: 'approved', label: 'Visa/File Approved', bn: '', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  { id: 'delivered', label: 'Delivered to Client', bn: '', color: 'bg-teal-500/15 text-teal-600 border-teal-500/30' },
  { id: 'rejected', label: 'Rejected / Cancelled', bn: '', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30' }
];

export function getServiceLabel(serviceValue, lang = 'en') {
  if (!serviceValue) return '—';
  const found = SERVICE_TYPES.find(s => s.id === serviceValue || s.label === serviceValue || s.bn === serviceValue);
  if (found) return lang === 'bn' ? found.bn : found.label;
  if (typeof serviceValue === 'string' && serviceValue.includes('(')) {
    const parts = serviceValue.split('(');
    return lang === 'bn' ? parts[0].trim() : parts[1].replace(')', '').trim();
  }
  return serviceValue;
}

export function getStatusLabel(statusId, lang = 'en') {
  const found = STATUS_OPTIONS.find(s => s.id === statusId);
  if (found) return lang === 'bn' ? found.bn : found.label;
  return statusId;
}

export function getDefaultClientGuardianData() {
  return {
    _id: null,
    applicationNo: generateApplicationNo(),
    dateReceived: new Date().toISOString().split('T')[0],
    verifiedBy: '',
    serviceType: 'Indian Visa Application',
    status: 'received',
    client: {
      fullName: '',
      nidNumber: '',
      passportNumber: '',
      countryRejected: '',
      fatherName: '',
      motherName: '',
      mobileNumber: '',
      email: ''
    },
    guardian: {
      fullName: '',
      nidNumber: '',
      fatherName: '',
      motherName: '',
      mobileNumber: '',
      email: '',
      address: '',
      relationship: ''
    },
    requirementDocuments: [
      { id: 1, name: 'Indian Size 2 × 2 Photograph', submitted: 'Yes', remarks: '' },
      { id: 2, name: 'House Registration Certificate', submitted: 'Yes', remarks: '' },
      { id: 3, name: 'Trade License', submitted: 'No', remarks: '' },
      { id: 4, name: 'House Current Bill Paper', submitted: 'Yes', remarks: '' },
      { id: 5, name: 'Bank Statement', submitted: 'Yes', remarks: '' },
      { id: 6, name: "Father's NID Card", submitted: 'Yes', remarks: '' },
      { id: 7, name: "Mother's NID Card", submitted: 'Yes', remarks: '' },
      { id: 8, name: "Client's Own NID Card", submitted: 'Yes', remarks: '' }
    ],
    payment: {
      totalAmount: '',
      advancePaid: '',
      dueAmount: '',
      paymentMethod: 'Cash',
      paymentStatus: 'Unpaid',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptNo: ''
    },
    attachments: {
      passportPhoto: '',
      passportScan: '',
      nidScan: '',
      otherFiles: []
    },
    officeNotes: '',
    activityLogs: [],
    declarationDate: new Date().toISOString().split('T')[0]
  };
}
