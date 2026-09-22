import React from 'react';
import logoImg from '@/assets/logo.png';
import { formatToDdMmYyyy } from '@/lib/utils';

export function AgreementPreview({ data = {} }) {
  const safeData = data || {};
  const currentDate = formatToDdMmYyyy(safeData.parties?.agreementDate) || new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const salary = safeData.salary || safeData.compensation || {};
  const leave = safeData.leave || {};
  const witnesses = safeData.witnesses || {};

  return (
    <div
      id="employment-agreement-canvas"
      className="printable-a4-paper w-[210mm] max-w-full bg-white text-slate-900 font-sans p-6 sm:p-8 text-[11px] leading-relaxed space-y-4 print:text-[10px] print:p-2 print:space-y-3 print:m-0 print:border-0 print:shadow-none box-border shadow-xl border border-slate-300"
    >
      {/* 0. Top Header */}
      <div className="border-b-2 border-slate-900 pb-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-white text-slate-900 flex items-center justify-center p-1 border border-slate-300 shadow-xs shrink-0">
              <img src={logoImg} alt="Agency Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
                {data.header?.companyName || 'PLEXIVIA'}
              </h1>
              <p className="text-[11px] text-slate-700 font-medium">
                Office Address: {data.header?.officeAddress || 'Mominpur Jagannathpur Road, Sunamganj, Post Code 3060'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-700 font-medium border-t border-slate-200 pt-1.5 gap-2">
          <div>Phone Number: <span className="font-bold text-slate-900">{data.header?.phone || '+8801345579534'}</span></div>
          <div>Email Address: <span className="font-bold text-slate-900">{data.header?.email || 'contact@plexivia.com'}</span></div>
        </div>
      </div>

      {/* Document Title Banner */}
      <div className="py-2 px-4 bg-[#0b2341] text-white rounded-md shadow-xs flex items-center justify-between gap-2">
        <div className="text-[10.5px] text-amber-300 font-mono font-bold shrink-0">
          {data.agreementId ? `Agreement ID: ${data.agreementId}` : ''}
        </div>
        <div className="text-center">
          <h2 className="text-xs sm:text-sm font-black tracking-wide uppercase">
            Employment & Service Contract Agreement
          </h2>
          <p className="text-[9.5px] text-amber-300 font-medium">
            Legal contract executed in accordance with statutory employment regulations by mutual consent
          </p>
        </div>
        <div className="text-[10.5px] text-slate-300 font-mono shrink-0">
          Date: {currentDate}
        </div>
      </div>

      {/* 1. General Parties & Employment Information */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          1. General Parties & Employment Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] px-1">
          <div><span className="text-slate-600 font-medium">Agreement Date:</span> <span className="font-bold">{formatToDdMmYyyy(data.parties?.agreementDate) || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">NID / Passport No:</span> <span className="font-bold font-mono">{data.parties?.nidPassport || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Employer Authority:</span> <span className="font-bold">{data.parties?.employerName || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Phone Number:</span> <span className="font-bold font-mono">{data.parties?.employerPhone || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Employee Full Name:</span> <span className="font-bold text-slate-900">{data.parties?.employeeName || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Email Address:</span> <span className="font-bold">{data.parties?.employeeEmail || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Father's / Spouse Name:</span> <span className="font-bold">{data.parties?.fatherHusbandName || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Present & Permanent Address:</span> <span className="font-bold">{data.parties?.address || '____________________'}</span></div>
        </div>
      </div>

      {/* 2. Guardian & Emergency Contact Information */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          2. Guardian & Emergency Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] px-1">
          <div><span className="text-slate-600 font-medium">Guardian / Father's Name:</span> <span className="font-bold">{data.guardian?.guardianName || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Primary Contact Phone:</span> <span className="font-bold font-mono">{data.guardian?.guardianPhone || '____________________'}</span></div>
          <div>
            <span className="text-slate-600 font-medium">Relationship with Employee:</span>{' '}
            <span className="font-bold">
              {data.guardian?.relationship ? `[ ✓ ] ${data.guardian.relationship}` : '[ ] Father  [ ] Mother  [ ] Guardian'}
            </span>
          </div>
          <div><span className="text-slate-600 font-medium">Emergency Contact No:</span> <span className="font-bold font-mono">{data.guardian?.emergencyPhone || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Guardian NID No:</span> <span className="font-bold font-mono">{data.guardian?.guardianNid || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Present & Permanent Address:</span> <span className="font-bold">{data.guardian?.guardianAddress || '____________________'}</span></div>
        </div>
      </div>

      {/* 3. Position, Duties & Work Schedule */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          3. Position, Duties & Work Schedule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] px-1">
          <div><span className="text-slate-600 font-medium">Designation / Role:</span> <span className="font-bold">{data.position?.designation || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Department / Wing:</span> <span className="font-bold">{data.position?.department || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Joining Date:</span> <span className="font-bold">{formatToDdMmYyyy(data.position?.joiningDate) || '____________________'}</span></div>
          <div><span className="text-slate-600 font-medium">Workplace Location:</span> <span className="font-bold">{data.position?.location || 'Head Office, Nadampur'}</span></div>
          <div className="sm:col-span-2">
            <span className="text-slate-600 font-medium">Employment Type:</span>{' '}
            <span className="font-bold">
              {data.position?.jobType ? `[ ✓ ] ${data.position.jobType}` : '[ ] Permanent (Full-Time)   [ ] Part-Time   [ ] Contractual'}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-600 font-medium">Work Schedule & Leave:</span>{' '}
            <span className="font-bold">
              {data.position?.workSchedule || '[ ✓ ] 9:00 AM - 6:00 PM    [ ✓ ] Sunday to Thursday    Weekly Off: Friday / Saturday'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Salary Structure & Allowances */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          4. Salary Structure & Allowances
        </h3>
        <table className="w-full border-collapse border border-slate-300 text-[11px] my-1">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold">
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/2">Salary & Allowance Components</th>
              <th className="border border-slate-300 px-2.5 py-1.5 text-center w-1/4">Monthly Rate (BDT)</th>
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/4">Remarks & Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">1. Basic Salary</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.basicSalary || '________________'} BDT </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">Core basic salary component</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">2. House Rent Allowance</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.houseRent || '________________'} BDT </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">As per company policy</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">3. Medical Allowance</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.medical || '________________'} BDT </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">Monthly medical allowance</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">4. Conveyance Allowance</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.conveyance || '________________'} BDT </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">Commute and travel support</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1">5. Special Allowance / Incentive</td>
              <td className="border border-slate-300 px-2.5 py-1 text-center font-bold font-mono">{salary.specialAllowance || '________________'} BDT </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">As per performance & duties</td>
            </tr>
            <tr className="bg-slate-100 font-bold">
              <td className="border border-slate-300 px-2.5 py-1.5">Gross Total Monthly Salary</td>
              <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold font-mono text-slate-900">= {salary.grossSalary || '________________'} BDT </td>
              <td className="border border-slate-300 px-2.5 py-1.5 text-slate-800">(In Words: {salary.grossSalaryInWords || '______________________'})</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Leave Policy, Holidays & Benefits */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          5. Leave Policy, Holidays & Benefits
        </h3>
        <table className="w-full border-collapse border border-slate-300 text-[11px] my-1">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold">
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/4">Benefit Category</th>
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/2">Benefit Policy & Details</th>
              <th className="border border-slate-300 px-2.5 py-1.5 text-left w-1/4">Remarks / Entitlement</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1 font-semibold">Annual Leave Entitlements</td>
              <td className="border border-slate-300 px-2.5 py-1">
                [ ✓ ] Casual Leave: {leave.casualDays || '10'} Days<br />
                [ ✓ ] Sick Leave: {leave.sickDays || '14'} Days<br />
                [ ✓ ] Earned Leave: {leave.earnedDays || '18'} Days
              </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">
                Prior written approval from management is mandatory before taking leave.
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1 font-semibold">Public & Festival Holidays</td>
              <td className="border border-slate-300 px-2.5 py-1">
                [ ✓ ] As per statutory gazette holiday schedule<br />
                [ ✓ ] Scheduled Eid-ul-Fitr & Eid-ul-Adha festive holidays
              </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">
                Governed by official company holiday calendar.
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1 font-semibold">Lunch & Refreshments</td>
              <td className="border border-slate-300 px-2.5 py-1">
                {leave.lunchProvided ? '[ ✓ ]' : '[ ]'} Company provided complimentary lunch<br />
                {leave.teaSnacks ? '[ ✓ ]' : '[ ]'} Daily tea/coffee & refreshments<br />
                {leave.lunchAllowance ? `[ ✓ ] Monthly Lunch Allowance: ${leave.lunchAllowance} BDT` : '[ ] Lunch Allowance'}
              </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">
                Administered under company HR regulations.
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2.5 py-1 font-semibold">Festival Bonus & Welfare</td>
              <td className="border border-slate-300 px-2.5 py-1">
                [ ✓ ] 2 Annual Festive Bonuses<br />
                [ ✓ ] Annual Performance Bonus (as applicable)
              </td>
              <td className="border border-slate-300 px-2.5 py-1 text-slate-600">
                Applicable upon satisfactory tenure completion.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. Minimum Service Tenure (2 Years) & 3-Month Notice Policy */}
      <div className="space-y-1 bg-amber-50/60 border border-amber-200 p-2.5 rounded-md">
        <h3 className="font-bold text-xs text-amber-900 border-b border-amber-300 pb-0.5">
          6. Minimum Service Tenure (2 Years) & 3-Month Notice Policy
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-[10.5px] text-slate-800 text-justify">
          <li>
            <strong>Mandatory 2 (Two) Years Service Tenure:</strong> Starting from the joining date, the employee is legally bound and committed to serve the company for a continuous tenure of at least 2 (two) years.
          </li>
          <li>
            <strong>Emergency Resignation & 3-Month Prior Notice:</strong> If resigning before completing the mandatory 2-year tenure due to unavoidable circumstances, the employee must submit a written resignation letter at least 3 (three) months in advance with explicit justification.
          </li>
          <li>
            <strong>Indemnification in Lieu of Notice:</strong> Leaving without providing the mandatory 3 months written notice requires the employee to compensate the company with 3 months basic salary, or have it adjusted against dues.
          </li>
          <li>
            <strong>     :</strong> ,  , , ,                  ।
          </li>
        </ol>
      </div>

      {/* .  ,      */}
      <div className="space-y-1 bg-rose-50/60 border border-rose-200 p-2.5 rounded-md">
        <h3 className="font-bold text-xs text-rose-900 border-b border-rose-300 pb-0.5">
          .  ,     
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-[10.5px] text-slate-800 text-justify">
          <li>
            <strong> :</strong>       Employee    , Clients Directory,  , ,   ,          ,      ।
          </li>
          <li>
            <strong>English      :</strong>         ,     /   English   English  ,  ,      /       ।   Employee                      ।
          </li>
          <li>
            <strong>   :</strong>      , /Device, , ,   -    ।       Employee   ।
          </li>
          <li>
            <strong> :</strong>      Employee               ।
          </li>
        </ol>
      </div>

      {/* . Witness Description  Signature */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-xs bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900 text-slate-900">
          . Witness Description  Signature
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] my-1">
          {/*    */}
          <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1">
                 ( ) :
            </span>
            <div><span className="text-slate-600 font-medium"> :</span> <span className="font-bold">{witnesses.firstWitnessName || '_________________________________'}</span></div>
            <div><span className="text-slate-600 font-medium">  :</span> <span className="font-bold font-mono">{witnesses.firstWitnessPhone || '_________________________________'}</span></div>
            <div><span className="text-slate-600 font-medium">Address:</span> <span className="font-bold">{witnesses.firstWitnessAddress || '_________________________________'}</span></div>
            <div className="pt-3 mt-2 border-t border-dashed border-slate-400 flex items-center justify-between text-[10.5px]">
              <span className="font-bold text-slate-700">Signature : ___________________</span>
              <span className="text-[9.5px] text-slate-400 font-normal italic">(   Signature)</span>
            </div>
          </div>

          {/*    */}
          <div className="border border-slate-300 rounded-md p-2.5 bg-slate-50/70 space-y-1.5">
            <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1">
                 (Employee ) :
            </span>
            <div><span className="text-slate-600 font-medium"> :</span> <span className="font-bold">{witnesses.secondWitnessName || '_________________________________'}</span></div>
            <div><span className="text-slate-600 font-medium">  :</span> <span className="font-bold font-mono">{witnesses.secondWitnessPhone || '_________________________________'}</span></div>
            <div><span className="text-slate-600 font-medium">Address:</span> <span className="font-bold">{witnesses.secondWitnessAddress || '_________________________________'}</span></div>
            <div className="pt-3 mt-2 border-t border-dashed border-slate-400 flex items-center justify-between text-[10.5px]">
              <span className="font-bold text-slate-700">Signature : ___________________</span>
              <span className="text-[9.5px] text-slate-400 font-normal italic">(   Signature)</span>
            </div>
          </div>
        </div>
      </div>

      {/* .     */}
      <div className="space-y-3 pt-2">
        <div className="p-2.5 border border-slate-300 rounded-md bg-slate-100/70 text-slate-900 font-medium text-[10.5px] text-justify">
          <strong>   :</strong>    (Employer Authority  Employee)  Agreement       ,       Signature  ।
        </div>

        <div className="grid grid-cols-2 gap-8 pt-8 pb-2 text-[11px] items-end">
          {/* First Party Signature */}
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 pb-1 mb-1 flex items-center justify-between">
              <span className="font-bold text-slate-700">Signature :</span>
              <span className="text-[9.5px] text-slate-400 font-normal italic">(  /  Signature)</span>
            </div>
            <div className="font-bold text-xs text-slate-900"> /  Signature  </div>
            <div><span className="text-slate-600">Name:</span> <span className="font-bold">{data.parties?.employerName || '________________________'}</span></div>
            <div><span className="text-slate-600">Designation:</span> <span className="font-bold">Managing Director / </span></div>
            <div><span className="text-slate-600">Date:</span> <span className="font-bold">{currentDate}</span></div>
          </div>

          {/* Second Party Signature */}
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 pb-1 mb-1 flex items-center justify-between">
              <span className="font-bold text-slate-700">Signature :</span>
              <span className="text-[9.5px] text-slate-400 font-normal italic">(  / Employee Signature)</span>
            </div>
            <div className="font-bold text-xs text-slate-900">Employee Signature  </div>
            <div><span className="text-slate-600">Name:</span> <span className="font-bold">{data.parties?.employeeName || '________________________'}</span></div>
            <div><span className="text-slate-600">Date:</span> <span className="font-bold">{currentDate}</span></div>
            <div><span className="text-slate-600">  :</span> <span className="font-bold font-mono">{data.parties?.nidPassport || '________________________'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
