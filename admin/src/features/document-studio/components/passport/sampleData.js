import agencyInfo from '@/lib/information.json';

export function generateUniquePassportTrackingNo() {
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

  return `PASS-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

export function getDefaultPassportData() {
  return {
    _id: null,
    trackingNo: '',
    submissionDate: new Date().toISOString().split('T')[0],

    agencyInfo: {
      name: agencyInfo.agencyName || 'PLEXIVIA',
      address: agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
      phone: agencyInfo.phone || '+8801345579534',
      email: agencyInfo.email || 'contact@plexivia.com',
      tagline: agencyInfo.tagline || 'Govt. Approved Overseas Employment & Immigration Consultancy',
    },

    applicantName: '',
    nidBirthCertNo: '',
    previousPassportNo: '',
    applicantPhone: '',
    applicantEmail: '',
    address: '',

    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    relationship: 'Father',

    passportType: 'E-Passport (Electronic Passport)',
    applicationCategory: 'New Application',
    pageCount: '48 Pages',
    validityYears: '5 Years',
    deliverySpeed: 'Regular',

    documentsProvided: {
      nidCopy: false,
      birthCertOnline: false,
      oldPassportOriginal: false,
      photoLabPrint: false,
      guardianNidCopy: false,
      utilityBillCopy: false,
    },

    remarks: '',
    status: 'pending',
  };
}

export const getDefaultPassportSubmissionData = getDefaultPassportData;
