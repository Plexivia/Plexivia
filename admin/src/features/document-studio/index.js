export { DocumentStudioPage, DocumentStudioPage as DocumentStudio, default } from './pages/DocumentStudioPage';
export { DOCUMENT_GENERATORS, CATEGORIES, getGeneratorById } from './configs/documentGenerators';

// Agreement
export { EmploymentAgreement } from './components/agreement/EmploymentAgreement';
export { AgreementForm } from './components/agreement/AgreementForm';
export { AgreementPreview } from './components/agreement/AgreementPreview';

// ID Card
export { IdCard } from './components/idcard/IdCard';
export { IdCardForm } from './components/idcard/IdCardForm';
export { IdCardPreview } from './components/idcard/IdCardPreview';

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

// Common
export { PrintablePaper } from './components/common/PrintablePaper';
export { ExportModal } from './components/common/ExportModal';
export { ExistingClientAlertModal, ExistingClientAlertModal as ClientUniqueCheckModal, default as ExistingClientAlertModalDefault } from './components/common/ExistingClientAlertModal';
export { StudioFloatingViewSwitcher } from './components/common/StudioFloatingViewSwitcher';
export { useClientLookup } from './components/common/useClientLookup';
