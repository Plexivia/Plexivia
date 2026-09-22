import React from 'react';
import { EmploymentAgreement } from './agreement/EmploymentAgreement';
import { IdCard } from './idcard/IdCard';
import { JobVerification } from './job-verification/JobVerification';
import { SalarySlip } from './payroll/SalarySlip';
import { Invoice } from './invoice/Invoice';
import { PassportSubmission } from './passport/PassportSubmission';
import { IndianVisa } from './indian-visa/IndianVisa';
import { ClientGuardian } from './client-form/ClientGuardian';
import { MoneyReceipt } from './receipt/MoneyReceipt';
import { CashVoucher } from './cash-voucher/CashVoucher';
import { ExperienceCertificate } from './certificate-experience/ExperienceCertificate';
import { CharacterCertificate } from './certificate-character/CharacterCertificate';
import { MarriageCertificate } from './certificate-marriage/MarriageCertificate';

export function DocumentStudioModule({ activeSubmodule = 'agreement' }) {

  return (
    <div className="space-y-5">
      {/* 1. Employment Agreement */}
      {(activeSubmodule === 'agreement' || !activeSubmodule) && <EmploymentAgreement />}

      {/* 2. Client Guardian Bio Form */}
      {activeSubmodule === 'client-form' && <ClientGuardian />}

      {/* 3. Indian Visa Application Form */}
      {activeSubmodule === 'indian-visa' && <IndianVisa />}

      {/* 4. Passport Submission & Tracking */}
      {activeSubmodule === 'passport-sub' && <PassportSubmission />}

      {/* 5. Job Experience & Salary Verification */}
      {(activeSubmodule === 'job-verification' || activeSubmodule === 'job-verify') && <JobVerification />}

      {/* 6. Employee / Client ID Card Badge */}
      {activeSubmodule === 'idcard' && <IdCard />}

      {/* 7. Salary Slip / Payroll Voucher */}
      {(activeSubmodule === 'payroll' || activeSubmodule === 'salary-slip') && <SalarySlip />}

      {/* 8. Commercial Sales Invoice */}
      {activeSubmodule === 'invoice' && <Invoice />}

      {/* 9. Money Receipt Deposit Slip */}
      {(activeSubmodule === 'money-receipt' || activeSubmodule === 'receipt') && <MoneyReceipt />}

      {/* 10. Cash Petty / Money Voucher */}
      {(activeSubmodule === 'cash-voucher' || activeSubmodule === 'voucher') && <CashVoucher />}

      {/* 11. Work Experience Certificate */}
      {(activeSubmodule === 'experience-certificate' || activeSubmodule === 'certificate-exp' || activeSubmodule === 'exp-cert') && (
        <ExperienceCertificate />
      )}

      {/* 12. Character & Conduct Certificate */}
      {(activeSubmodule === 'character-certificate' || activeSubmodule === 'certificate-char' || activeSubmodule === 'char-cert') && (
        <CharacterCertificate />
      )}

      {/* 13. Marriage Verification Certificate */}
      {(activeSubmodule === 'marriage-certificate' || activeSubmodule === 'certificate-marr' || activeSubmodule === 'marr-cert') && (
        <MarriageCertificate />
      )}
    </div>
  );
}

export default DocumentStudioModule;
