import agencyInfo from '@/lib/information.json';

export function generateUniqueIndianVisaTrackingNo() {
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

  return `IVISA-${prefixLetters}${firstDigits}${midLetter}${lastDigits}`;
}

export function getDefaultIndianVisaData() {
  return {
    _id: null,
    trackingNo: '',
    submissionDate: new Date().toISOString().split('T')[0],

    agencyInfo: {
      name: agencyInfo.agencyName || 'PLEXIVIA',
      address: agencyInfo.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
      phone: agencyInfo.phone || '+8801345579534',
      email: agencyInfo.email || 'contact@plexivia.com'
    },

    applicantName: '',
    passportNo: '',
    nidBirthCertNo: '',
    applicantPhone: '',
    applicantEmail: '',
    address: '',

    visaType: 'Tourist Visa',
    entryPort: '',
    durationMonths: '',
    entryType: '',

    documentsProvided: {
      passportOriginal: false,
      nidCopy: false,
      photoLabPrint: false,
      bankSolvency: false,
      utilityBillCopy: false,
      previousVisaCopy: false,
      nocTradeLicense: false
    },

    remarks: '',
    status: 'pending'
  };
}

export const SAMPLE_INDIAN_VISA = getDefaultIndianVisaData();
