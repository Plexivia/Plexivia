import React from 'react';
import logoImg from '@/assets/logo.png';
import infoData from '@/lib/information.json';
import { formatToDdMmYyyy } from '@/lib/utils';

export function SalarySlipPreview({ data, formData }) {
  const activeData = data || formData || {};

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const basic = Number(activeData?.basicSalary) || 0;
  const houseRent = Number(activeData?.houseRentAllowance) || 0;
  const medical = Number(activeData?.medicalAllowance) || 0;
  const conveyance = Number(activeData?.conveyanceAllowance) || 0;
  const other = Number(activeData?.otherAllowance) || 0;
  const overtime = Number(activeData?.overtimeExtraDuty) || 0;

  const grossEarnings = Number(activeData?.grossEarnings) || (basic + houseRent + medical + conveyance + other);
  const totalDeduction = Number(activeData?.totalDeduction) || 0;
  const netPayable = Number(activeData?.netSalaryPayable) || (grossEarnings + overtime - totalDeduction);

  return (
    <div 
      id="salary-slip-canvas"
      className="printable-a4-paper w-[210mm] min-h-[297mm] bg-white text-slate-900 p-5 print:p-4 flex flex-col justify-between font-sans shadow-xl border border-slate-400 relative rounded-xs print:p-4 print:shadow-none print:border-0 print:m-0"
      style={{ fontFamily: "'Montserrat', 'Plus Jakarta Sans', sans-serif" }}
    >
      <div>
        {/* Top Header & Logo */}
        <div className="border-b-2 border-slate-900 pb-2 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xs bg-white border border-slate-900 p-1 shrink-0 overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="Plexivia Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-[900] uppercase tracking-tight text-slate-900 leading-none">
                {infoData.agencyName || 'PLEXIVIA'}
              </h1>
              <p className="text-[9.5px] font-bold text-slate-700 mt-0.5">
                {infoData.tagline || 'Your Trusted Travel Partner'}
              </p>
              <p className="text-[9px] text-slate-600 font-medium">
                Head Office: {infoData.address?.full || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-[10px]">
            <div className="font-bold text-slate-900">Slip No: {activeData?.slipNo || 'SLIP-2026-001'}</div>
            <div className="text-slate-600">Date: {formatToDdMmYyyy(activeData?.payDate) || currentDate}</div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-[#0b2341] text-white py-1.5 px-3 rounded-xs text-center mb-3">
          <h2 className="text-xs font-[900] tracking-[1px] uppercase">
            INDIVIDUAL MONTHLY SALARY SHEET / SALARY SLIP
          </h2>
          <p className="text-[9px] font-semibold text-amber-400">
            Employee Monthly Payslip / Salary Statement
          </p>
        </div>

        {/* Employee Profile & Payroll Control Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-[10px] border border-slate-400 rounded-xs p-2.5 bg-slate-50/50">
          {/* Column 1: EMPLOYEE PROFILE DETAILS */}
          <div className="space-y-1 border-r border-slate-300 pr-2.5">
            <h3 className="text-[9.5px] font-[900] uppercase tracking-wider text-[#0b2341] border-b border-slate-300 pb-0.5 mb-1.5">
              EMPLOYEE PROFILE DETAILS
            </h3>
            
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Employee Name:</span>
              <span className="font-bold text-slate-900">{activeData?.employeeName || 'MD Hakimul Islam'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Employee ID:</span>
              <span className="font-bold text-slate-900 font-mono">{activeData?.employeeId || '123'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Designation:</span>
              <span className="font-bold text-slate-900">{activeData?.designation || 'Managing Director'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Joining Date:</span>
              <span className="font-bold text-slate-900 font-mono">{formatToDdMmYyyy(activeData?.joiningDate) || '01-10-2025'}</span>
            </div>
          </div>

          {/* Column 2: PAYROLL CONTROL DETAILS */}
          <div className="space-y-1 pl-1">
            <h3 className="text-[9.5px] font-[900] uppercase tracking-wider text-[#0b2341] border-b border-slate-300 pb-0.5 mb-1.5">
              PAYROLL CONTROL DETAILS
            </h3>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Salary Month:</span>
              <span className="font-bold text-slate-900">{activeData?.salaryMonth || 'October 2025'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Pay Date:</span>
              <span className="font-bold text-slate-900 font-mono">{formatToDdMmYyyy(activeData?.payDate) || currentDate}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Department:</span>
              <span className="font-bold text-slate-900">{activeData?.department || 'Management'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Payment Mode:</span>
              <span className="font-bold text-slate-900">{activeData?.paymentMode || 'Cash'}</span>
            </div>
          </div>
        </div>

        {/* Corporate Tabular Grid with Row-Column Cell Borders */}
        <div className="border border-slate-900 rounded-xs overflow-hidden mb-3 text-[10px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0b2341] text-white text-[9.5px] uppercase font-bold tracking-wider">
                <th className="p-1.5 text-left border-r border-slate-700 w-[35%]">EARNINGS / ALLOWANCES</th>
                <th className="p-1.5 text-right border-r border-slate-700 w-[15%]">AMOUNT (BDT)</th>
                <th className="p-1.5 text-left border-r border-slate-700 w-[35%]">DEDUCTIONS / ADJUSTMENTS</th>
                <th className="p-1.5 text-right w-[15%]">AMOUNT (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-medium">
              {/* Row 1 */}
              <tr>
                <td className="p-1.5 border-r border-slate-300 text-slate-800">Basic Salary</td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold">{Number(activeData?.basicSalary || 0).toLocaleString('en-BD')}</td>
                <td className="p-1.5 border-r border-slate-300 text-slate-800 bg-slate-50/50">Advance Salary</td>
                <td className="p-1.5 text-right font-mono font-bold bg-slate-50/50">{Number(activeData?.advanceSalary || 0).toLocaleString('en-BD')}</td>
              </tr>
              {/* Row 2 */}
              <tr>
                <td className="p-1.5 border-r border-slate-300 text-slate-800">House Rent Allowance</td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold">{Number(activeData?.houseRentAllowance || 0).toLocaleString('en-BD')}</td>
                <td className="p-1.5 border-r border-slate-300 text-slate-800 bg-slate-50/50">Unpaid Leave / Absence</td>
                <td className="p-1.5 text-right font-mono font-bold bg-slate-50/50">{Number(activeData?.unpaidLeaveAbsence || 0).toLocaleString('en-BD')}</td>
              </tr>
              {/* Row 3 */}
              <tr>
                <td className="p-1.5 border-r border-slate-300 text-slate-800">Medical Allowance</td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold">{Number(activeData?.medicalAllowance || 0).toLocaleString('en-BD')}</td>
                <td className="p-1.5 border-r border-slate-300 text-slate-800 bg-slate-50/50">Loan / Authorized Deduction</td>
                <td className="p-1.5 text-right font-mono font-bold bg-slate-50/50">{Number(activeData?.loanAuthorizedDeduction || 0).toLocaleString('en-BD')}</td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td className="p-1.5 border-r border-slate-300 text-slate-800">Conveyance Allowance</td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold">{Number(activeData?.conveyanceAllowance || 0).toLocaleString('en-BD')}</td>
                <td className="p-1.5 border-r border-slate-300 text-slate-800 bg-slate-50/50">Tax / Statutory Deduction</td>
                <td className="p-1.5 text-right font-mono font-bold bg-slate-50/50">{Number(activeData?.taxStatutoryDeduction || 0).toLocaleString('en-BD')}</td>
              </tr>
              {/* Row 5 */}
              <tr>
                <td className="p-1.5 border-r border-slate-300 text-slate-800">Other Allowance</td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold">{Number(activeData?.otherAllowance || 0).toLocaleString('en-BD')}</td>
                <td className="p-1.5 border-r border-slate-300 text-slate-800 bg-slate-50/50">Other Authorized Deduction</td>
                <td className="p-1.5 text-right font-mono font-bold bg-slate-50/50">{Number(activeData?.otherAuthorizedDeduction || 0).toLocaleString('en-BD')}</td>
              </tr>
              {/* Row 6 */}
              <tr>
                <td className="p-1.5 border-r border-slate-300 text-slate-800">Overtime / Extra Duty</td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold">{Number(activeData?.overtimeExtraDuty || 0).toLocaleString('en-BD')}</td>
                <td className="p-1.5 border-r border-slate-300 text-slate-400 bg-slate-50/50 italic">-</td>
                <td className="p-1.5 text-right font-mono font-bold bg-slate-50/50">-</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                <td className="p-1.5 border-r border-slate-300">GROSS EARNINGS</td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono text-emerald-700">BDT {grossEarnings.toLocaleString('en-BD')}</td>
                <td className="p-1.5 border-r border-slate-300">TOTAL DEDUCTION</td>
                <td className="p-1.5 text-right font-mono text-rose-700">BDT {totalDeduction.toLocaleString('en-BD')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Net Salary Payable Banner */}
        <div className="bg-emerald-900 text-white p-2.5 rounded-xs mb-3 flex items-center justify-between">
          <div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-200 block">
              NET SALARY PAYABLE
            </span>
            <span className="text-[10px] italic text-emerald-100 font-medium block">
              In Words: <span className="font-bold text-white uppercase">{activeData?.netSalaryInWords || 'Zero Taka Only'}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-[900] font-mono text-amber-300">
              BDT {netPayable.toLocaleString('en-BD')}
            </span>
          </div>
        </div>

        {/* Attendance & Leave Summary Table */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-[10px]">
          {/* Attendance Summary */}
          <div className="border border-slate-300 rounded-xs p-2 bg-slate-50/50 space-y-0.5">
            <h4 className="font-[800] text-[#0b2341] uppercase text-[9px] border-b border-slate-300 pb-0.5 mb-1">
              ATTENDANCE & LEAVE VALUE
            </h4>
            <div className="grid grid-cols-2 gap-1 font-semibold">
              <span>Working Days: <strong className="font-mono">{activeData?.workingDays || 30}</strong></span>
              <span>Present Days: <strong className="font-mono">{activeData?.presentDays || 30}</strong></span>
              <span>Paid Leave: <strong className="font-mono">{activeData?.paidLeave || 0}</strong></span>
              <span>Unpaid Leave: <strong className="font-mono">{activeData?.unpaidLeave || 0}</strong></span>
            </div>
          </div>

          {/* Payroll Summary */}
          <div className="border border-slate-300 rounded-xs p-2 bg-slate-50/50 space-y-0.5">
            <h4 className="font-[800] text-[#0b2341] uppercase text-[9px] border-b border-slate-300 pb-0.5 mb-1">
              PAYROLL SUMMARY
            </h4>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Gross Earnings:</span>
                <span className="font-mono font-bold">BDT {grossEarnings.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Deductions:</span>
                <span className="font-mono font-bold text-rose-600">BDT {totalDeduction.toLocaleString('en-BD')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-0.5 font-bold text-emerald-700">
                <span>Net Payable:</span>
                <span className="font-mono">BDT {netPayable.toLocaleString('en-BD')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Certification Statement */}
        <div className="p-2.5 border border-slate-300 bg-slate-50 rounded-xs text-[9.5px] text-slate-800 leading-relaxed mb-4">
          <span className="font-bold text-[#0b2341] block mb-0.5 uppercase tracking-wide">
            PAYROLL CERTIFICATION:
          </span>
          This salary statement is prepared from the company's payroll and attendance records. Applicable salary, overtime, deductions and benefits should be processed according to the employee's appointment terms and applicable Bangladesh labour laws and rules.
        </div>
      </div>

      {/* Signatures & Seal Block (Strict Horizontal Alignment Matching Reference Image) */}
      <div className="pt-4 border-t border-slate-300">
        <div className="grid grid-cols-4 gap-4 text-center items-start">
          {/* Employee Acknowledgement */}
          <div className="flex flex-col items-center">
            <div className="border-b-2 border-slate-900 w-28 mb-1.5" />
            <div className="font-[900] text-slate-900 text-[9.5px] uppercase tracking-tight leading-tight min-h-[20px] flex items-center justify-center">
              EMPLOYEE ACKNOWLEDGEMENT
            </div>
            <div className="text-slate-600 text-[9px] font-medium leading-none mt-0.5">
              Signature & Date
            </div>
          </div>

          {/* Prepared By */}
          <div className="flex flex-col items-center">
            <div className="border-b-2 border-slate-900 w-28 mb-1.5" />
            <div className="font-[900] text-slate-900 text-[9.5px] uppercase tracking-tight leading-tight min-h-[20px] flex items-center justify-center">
              PREPARED BY
            </div>
            <div className="text-slate-600 text-[9px] font-medium leading-none mt-0.5">
              {activeData?.preparedBy || 'HR Department'}
            </div>
          </div>

          {/* Checked By */}
          <div className="flex flex-col items-center">
            <div className="border-b-2 border-slate-900 w-28 mb-1.5" />
            <div className="font-[900] text-slate-900 text-[9.5px] uppercase tracking-tight leading-tight min-h-[20px] flex items-center justify-center">
              CHECKED BY
            </div>
            <div className="text-slate-600 text-[9px] font-medium leading-none mt-0.5">
              {activeData?.checkedBy || 'Accounts Department'}
            </div>
          </div>

          {/* Authorized Signatory */}
          <div className="flex flex-col items-center">
            <div className="border-b-2 border-slate-900 w-28 mb-1.5" />
            <div className="font-[900] text-slate-900 text-[9.5px] uppercase tracking-tight leading-tight min-h-[20px] flex items-center justify-center">
              AUTHORIZED SIGNATORY
            </div>
            <div className="text-slate-600 text-[9px] font-medium leading-none mt-0.5">
              {activeData?.authorizedSignatory || 'Managing Director'}
            </div>
          </div>
        </div>

        {/* Footer Statement */}
        <div className="mt-4 border-t border-slate-200 pt-3 flex items-center justify-between">
          <div className="text-[9px] text-slate-500 font-medium tracking-tight">
            Plexivia • Confidential Payroll Document • Official Salary Statement
          </div>
          <div className="text-[9px] text-slate-400 font-mono">
            System Generated &amp; Verified
          </div>
        </div>
      </div>

    </div>
  );
}
