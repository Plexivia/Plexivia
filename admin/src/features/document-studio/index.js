export { DocumentStudioPage, DocumentStudioPage as DocumentStudio, default } from './pages/DocumentStudioPage';
export { DOCUMENT_GENERATORS, CATEGORIES, getGeneratorById } from './configs/documentGenerators';

// Agreement
export { EmploymentAgreement } from './components/agreement/EmploymentAgreement';
export { AgreementForm } from './components/agreement/AgreementForm';
export { AgreementPreview } from './components/agreement/AgreementPreview';

// Client Form
export { ClientGuardian } from './components/client-form/ClientGuardian';
export { ClientGuardianForm } from './components/client-form/ClientGuardianForm';
export { ClientGuardianPreview } from './components/client-form/ClientGuardianPreview';
export {
  STATUS_OPTIONS as CUSTOMER_STATUS_OPTIONS,
  STATUS_OPTIONS,
  SERVICE_TYPES as CUSTOMER_SERVICE_TYPES,
  SERVICE_TYPES,
  getServiceLabel,
  getStatusLabel,
  getDefaultClientGuardianData,
  generateApplicationNo
} from './components/client-form/sampleData';

// Indian Visa
export { IndianVisa } from './components/indian-visa/IndianVisa';
export { IndianVisaForm } from './components/indian-visa/IndianVisaForm';
export { IndianVisaPreview } from './components/indian-visa/IndianVisaPreview';

// Passport Submission
export { PassportSubmission } from './components/passport/PassportSubmission';
export { PassportSubmissionForm } from './components/passport/PassportSubmissionForm';
export { PassportSubmissionPreview } from './components/passport/PassportSubmissionPreview';

// ID Card
export { IdCard } from './components/idcard/IdCard';
export { IdCardForm } from './components/idcard/IdCardForm';
export { IdCardPreview } from './components/idcard/IdCardPreview';

// Job Verification
export { JobVerification } from './components/job-verification/JobVerification';
export { JobVerificationForm } from './components/job-verification/JobVerificationForm';
export { JobVerificationPreview } from './components/job-verification/JobVerificationPreview';
export { getDefaultJobVerificationData, generateUniqueJobVerificationId } from './components/job-verification/sampleData';

// Payroll
export { SalarySlip } from './components/payroll/SalarySlip';
export { SalarySlipForm } from './components/payroll/SalarySlipForm';
export { SalarySlipPreview } from './components/payroll/SalarySlipPreview';

// Invoice
export { Invoice } from './components/invoice/Invoice';
export { InvoiceBuilder } from './components/invoice/InvoiceBuilder';
export { InvoiceForm } from './components/invoice/InvoiceForm';
export { InvoicePreview } from './components/invoice/InvoicePreview';

// Receipt
export { MoneyReceipt } from './components/receipt/MoneyReceipt';
export { MoneyReceiptForm } from './components/receipt/MoneyReceiptForm';
export { MoneyReceiptModal } from './components/receipt/MoneyReceiptModal';
export { MoneyReceiptPreview } from './components/receipt/MoneyReceiptPreview';
export { MoneyReceiptPrintSlip } from './components/receipt/MoneyReceiptPrintSlip';
export { ReceiptConfirmModal } from './components/receipt/ReceiptConfirmModal';

// Cash Voucher
export { CashVoucher } from './components/cash-voucher/CashVoucher';
export { CashVoucherForm } from './components/cash-voucher/CashVoucherForm';
export { CashVoucherPreview } from './components/cash-voucher/CashVoucherPreview';

// Certificates
export { ExperienceCertificate } from './components/certificate-experience/ExperienceCertificate';
export { ExperienceCertificateForm } from './components/certificate-experience/ExperienceCertificateForm';
export { ExperienceCertificatePreview } from './components/certificate-experience/ExperienceCertificatePreview';

export { CharacterCertificate } from './components/certificate-character/CharacterCertificate';
export { CharacterCertificateForm } from './components/certificate-character/CharacterCertificateForm';
export { CharacterCertificatePreview } from './components/certificate-character/CharacterCertificatePreview';

export { MarriageCertificate } from './components/certificate-marriage/MarriageCertificate';
export { MarriageCertificateForm } from './components/certificate-marriage/MarriageCertificateForm';
export { MarriageCertificatePreview } from './components/certificate-marriage/MarriageCertificatePreview';

// Common
export { PrintablePaper } from './components/common/PrintablePaper';
export { ExportModal } from './components/common/ExportModal';
export { ExistingClientAlertModal, ExistingClientAlertModal as ClientUniqueCheckModal, default as ExistingClientAlertModalDefault } from './components/common/ExistingClientAlertModal';
export { StudioFloatingViewSwitcher } from './components/common/StudioFloatingViewSwitcher';
export { useClientLookup } from './components/common/useClientLookup';

