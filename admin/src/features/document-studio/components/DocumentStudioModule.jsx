import React from 'react';
import { EmploymentAgreement } from './agreement/EmploymentAgreement';
import { IdCard } from './idcard/IdCard';
import { SalarySlip } from './payroll/SalarySlip';
import { Invoice } from './invoice/Invoice';
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

      {/* 3. Employee / Client ID Card Badge */}
      {activeSubmodule === 'idcard' && <IdCard />}

      {/* 4. Salary Slip / Payroll Voucher */}
      {(activeSubmodule === 'payroll' || activeSubmodule === 'salary-slip') && <SalarySlip />}

      {/* 5. Commercial Sales Invoice */}
      {activeSubmodule === 'invoice' && <Invoice />}

      {/* 6. Money Receipt Deposit Slip */}
      {(activeSubmodule === 'money-receipt' || activeSubmodule === 'receipt') && <MoneyReceipt />}

      {/* 7. Cash Petty / Money Voucher */}
      {(activeSubmodule === 'cash-voucher' || activeSubmodule === 'voucher') && <CashVoucher />}

      {/* 8. Work Experience Certificate */}
      {(activeSubmodule === 'experience-certificate' || activeSubmodule === 'certificate-exp' || activeSubmodule === 'exp-cert') && (
        <ExperienceCertificate />
      )}

      {/* 9. Character & Conduct Certificate */}
      {(activeSubmodule === 'character-certificate' || activeSubmodule === 'certificate-char' || activeSubmodule === 'char-cert') && (
        <CharacterCertificate />
      )}

      {/* 10. Marriage Verification Certificate */}
      {(activeSubmodule === 'marriage-certificate' || activeSubmodule === 'certificate-marr' || activeSubmodule === 'marr-cert') && (
        <MarriageCertificate />
      )}
    </div>
  );
}

export default DocumentStudioModule;
