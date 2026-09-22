export function getDefaultMarriageCertificateData() {
  return {
    memoNo: "",
    issueDate: new Date().toISOString().split("T")[0],
    marriageDate: "",
    marriagePlace: "",
    volumeNo: "",
    pageNo: "",
    certificateTitle: "MARRIAGE CERTIFICATE",
    certificateSubtitle: "OFFICIAL MARITAL STATUS & NIKAHNAMA EXTRACT",

    // Issuing Authority / Registrar / Kazi Office
    registrar: {
      officeName: "OFFICE OF THE MUSLIM MARRIAGE REGISTRAR & KAZI",
      officeSubtitle: "Government of the People's Republic of Bangladesh",
      jurisdiction: "",
      officeAddress: "",
      phone: "",
      email: "",
      govLicenseNo: "",
      kaziName: "",
    },

    // Groom Details
    groom: {
      name: "",
      fatherName: "",
      motherName: "",
      passportNo: "",
      nidNo: "",
      birthDate: "",
      maritalStatusPrior: "Unmarried",
      religion: "Islam",
      address: "",
    },

    // Bride Details
    bride: {
      name: "",
      fatherName: "",
      motherName: "",
      passportNo: "",
      nidNo: "",
      birthDate: "",
      maritalStatusPrior: "Unmarried",
      religion: "Islam",
      address: "",
    },

    // Dower & Witnesses
    marriageTerms: {
      dowerAmount: "",
      dowerAmountInWords: "",
      dowerPaid: "",
      dowerDeferred: "",
      witness1: "",
      witness2: "",
      wakilName: "",
    },

    // Official Statement
    declaration: {
      statement:
        "This is to solemnly certify that the marriage between the above-named Groom and Bride was duly solemnized according to Muslim Sharia Law and registered under the Muslim Marriages and Divorces (Registration) Act, 1974.",
      livingStatus:
        "According to our official register and local verification, they have been living together peacefully as legally wedded husband and wife since the date of their marriage without any legal separation or dispute.",
    },
  };
}

export const SAMPLE_MARRIAGE_CERTIFICATE = getDefaultMarriageCertificateData();
