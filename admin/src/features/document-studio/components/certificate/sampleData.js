export function getDefaultCertificateData() {
  return {
    memoNo: "",
    issueDate: new Date().toISOString().split("T")[0],
    language: "bn", // 'bn' | 'en'
    client: {
      fullName: "",
      fullNameEn: "",
      fatherName: "",
      motherName: "",
      passportNo: "",
      nidNo: "",
      village: "",
      postOffice: "",
      upazila: "",
      district: ""
    },
    conduct: {
      durationYears: "",
      statementBn: "This is to certify that the candidate bears a good moral character and has not been involved in any unlawful activity.",
      statementEn: "This is to certify that to the best of our knowledge and belief, he/she bears good moral character and is a law-abiding citizen. He/she has not been involved in any activity subverting state or public discipline."
    },
    authority: {
      organizationName: "PLEXIVIA",
      organizationSubtitle: "Govt. Approved Recruiting Agency & Air Ticketing Services",
      issuingPersonName: "",
      designation: "Managing Director / Proprietor",
      officeAddress: ""
    }
  };
}

export const SAMPLE_CERTIFICATE = getDefaultCertificateData();
