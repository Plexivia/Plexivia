import React from 'react';
import { EmploymentAgreement } from './agreement/EmploymentAgreement';
import { IdCard } from './idcard/IdCard';
import { SalarySlip } from './payroll/SalarySlip';
import { Invoice } from './invoice/Invoice';
import { MoneyReceipt } from './receipt/MoneyReceipt';
import { CashVoucher } from './cash-voucher/CashVoucher';
import { ExperienceCertificate } from './certificate-experience/ExperienceCertificate';

// Render active submodule in Document Studio
export const DocumentStudioModule = ({ activeSubmodule = 'agreement' }) => {
  return (
    <div className="space-y-5">
      {(activeSubmodule === 'agreement' || !activeSubmodule) && <EmploymentAgreement />}
      {activeSubmodule === 'idcard' && <IdCard />}
      {(activeSubmodule === 'payroll' || activeSubmodule === 'salary-slip') && <SalarySlip />}
      {activeSubmodule === 'invoice' && <Invoice />}
      {(activeSubmodule === 'money-receipt' || activeSubmodule === 'receipt') && <MoneyReceipt />}
      {(activeSubmodule === 'cash-voucher' || activeSubmodule === 'voucher') && <CashVoucher />}
      {(activeSubmodule === 'experience-certificate' || activeSubmodule === 'certificate-exp' || activeSubmodule === 'exp-cert') && (
        <ExperienceCertificate />
      )}
    </div>
  );
};

export default DocumentStudioModule;
