import agencyInfoJson from '@/lib/information.json';

// Generates unique Job Verification ID: 3 letters + 5 digits (e.g. "JVF-AB48291")
export function generateUniqueJobVerificationId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let alpha = '';
  for (let i = 0; i < 3; i++) {
    alpha += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `JVF-${alpha}${randomNum}`;
}

export function getDefaultJobVerificationData() {
  return {
    _id: null,
    verificationId: generateUniqueJobVerificationId(),

    // 1. Company Information
    companyInfo: {
      companyName: agencyInfoJson.agencyName?.toUpperCase() || 'PLEXIVIA',
      companyPhone: agencyInfoJson.phone || '+8801345579534',
      companyEmail: agencyInfoJson.email || 'contact@plexivia.com',
      companyTaxNumber: 'VAT-88492048-BD',
      companyIdNumber: 'RL-1849 / GOVT REG',
      companyAddress: agencyInfoJson.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060',
      companyCity: 'Sunamganj',
    },

    // 2. Client Information
    clientInfo: {
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientTaxNumber: '',
      clientIdNumber: '', // NID or Passport
      clientAddress: '',
      clientCity: '',
    },

    // 3. Job & Stay Details
    jobStayDetails: {
      destinationPlace: '',
      destinationCountry: '',
      destinationCity: '',
      accommodationType: '',
      residenceAddress: '',
      jobNature: '',
      jobTitle: '',
      dailyWorkingHours: '',
      weeklyWorkingHours: '',
      salaryAmount: '',
      currency: 'EUR',
    },

    // 4. Work Permit & Helper Info
    helperInfo: {
      helperName: '',
      helperRelationship: '',
      helperDurationOfStay: '',
      helperImmigrationStatus: '',
      knowsHelper: 'No',
      durationKnown: '',
      helperDob: '',
      helperPhone: '',
    },

    // Verification & Signatures
    verificationDetails: {
      issueDate: new Date().toISOString().split('T')[0],
      clientSignatureDate: new Date().toISOString().split('T')[0],
      authorizedSignatory: 'Managing Director',
      authorizedSignatureDate: new Date().toISOString().split('T')[0],
      notes: 'All candidate credentials and overseas employment contract details have been checked and verified.',
      status: 'Verified',
    },
  };
}
