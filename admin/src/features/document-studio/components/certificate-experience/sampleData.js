export function getDefaultExperienceCertificateData() {
  return {
    memoNo: "",
    issueDate: new Date().toISOString().split("T")[0],
    language: "en", // 'en' | 'bn'
    certificateTitle: "TO WHOM IT MAY CONCERN",
    certificateSubtitle: "EXPERIENCE & SERVICE CERTIFICATE",

    // Issuing Organization
    company: {
      name: "",
      subtitle: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      registrationNo: "",
      logoUrl: "",
    },

    // Employee Information
    employee: {
      fullName: "",
      fatherName: "",
      passportNo: "",
      nidNo: "",
      designation: "",
      department: "",
      employmentType: "Full-Time Permanent",
      startDate: "",
      endDate: "",
      totalDuration: "",
      salaryGrade: "",
    },

    // Certificate Statement & Conduct Text
    content: {
      statement: "",
      dutiesResponsibilities: "",
      conductReview: "",
    },

    // Signatory & Authority
    signatory: {
      name: "",
      designation: "",
      phone: "",
      sealText: "",
    },
  };
}

export const SAMPLE_EXPERIENCE_CERTIFICATE = getDefaultExperienceCertificateData();
