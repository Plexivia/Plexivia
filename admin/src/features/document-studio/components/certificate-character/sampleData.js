export function getDefaultCharacterCertificateData() {
  return {
    memoNo: "",
    issueDate: new Date().toISOString().split("T")[0],
    language: "en", // 'en' | 'bn'
    certificateTitle: "CHARACTER CERTIFICATE",
    certificateSubtitle: "Character Certificate & Testimonial",

    // Issuing Authority / Organization
    authority: {
      organizationName: "",
      organizationSubtitle: "",
      officeAddress: "",
      phone: "",
      email: "",
      logoUrl: "",
    },

    // Client Details
    client: {
      fullName: "",
      fatherName: "",
      motherName: "",
      passportNo: "",
      nidNo: "",
      birthDate: "",
      gender: "Male",
      maritalStatus: "",
      presentAddress: "",
      permanentAddress: "",
    },

    // Certification Statement
    conduct: {
      knownYears: "",
      statement: "",
      characterPraise: "",
      recommendation: "",
    },

    // Signatory
    signatory: {
      name: "",
      designation: "",
      phone: "",
      sealText: "",
    },
  };
}

export const SAMPLE_CHARACTER_CERTIFICATE = getDefaultCharacterCertificateData();
