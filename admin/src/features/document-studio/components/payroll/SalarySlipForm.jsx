import React, { useState } from 'react';
import {
  Banknote,
  User,
  DollarSign,
  Clock,
  RotateCcw,
  Eye,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Calendar,
  Building,
  Briefcase,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';

// Number to Words converter for BDT currency
export function numberToWords(num) {
  if (isNaN(num) || num === 0) return 'Zero Taka Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return '';
    let str = '';
    str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
    str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
    str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
    str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
    str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
    return str;
  }

  const words = inWords(Math.floor(num)).trim();
  return `${words} Taka Only`;
}

export function SalarySlipForm({ formData, setFormData, onSubmit, onReset, isSubmitting = false }) {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Calculate Gross Salary (Basic + House Rent + Medical + Conveyance + Other Allowance)
      const gross = 
        (Number(updated.basicSalary) || 0) +
        (Number(updated.houseRentAllowance) || 0) +
        (Number(updated.medicalAllowance) || 0) +
        (Number(updated.conveyanceAllowance) || 0) +
        (Number(updated.otherAllowance) || 0);

      const overtime = Number(updated.overtimeExtraDuty) || 0;

      // Calculate Total Deductions
      const totalDed = 
        (Number(updated.advanceSalary) || 0) +
        (Number(updated.unpaidLeaveAbsence) || 0) +
        (Number(updated.loanAuthorizedDeduction) || 0) +
        (Number(updated.taxStatutoryDeduction) || 0) +
        (Number(updated.otherAuthorizedDeduction) || 0);

      // Net Salary = Gross Salary + Overtime - Total Deductions
      const netPayable = gross + overtime - totalDed;

      return {
        ...updated,
        grossEarnings: gross,
        totalDeduction: totalDed,
        netSalaryPayable: netPayable > 0 ? netPayable : 0,
        netSalaryInWords: numberToWords(netPayable > 0 ? netPayable : 0),
      };
    });
  };

  const confirmReset = () => {
    onReset();
    setResetDialogOpen(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      {/* Meta Bar: Slip No, Month, Pay Date & Mode */}
      <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-foreground">Slip No.</label>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                Auto-generated
              </span>
            </div>
            <input
              type="text"
              value={formData.slipNo || 'Auto-generated'}
              readOnly
              disabled
              className="w-full px-3 py-2 bg-muted/60 border border-border rounded-xl text-muted-foreground font-mono font-bold text-xs cursor-not-allowed select-none outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Salary Month *</label>
            <input
              type="text"
              required
              value={formData.salaryMonth || ''}
              placeholder="Enter salary month & year"
              onChange={(e) => handleChange('salaryMonth', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-semibold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Pay Date</label>
            <DatePicker
              value={formData.payDate || ''}
              onChange={(val) => handleChange('payDate', val)}
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Payment Mode</label>
            <select
              value={formData.paymentMode || 'Cash'}
              onChange={(e) => handleChange('paymentMode', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-semibold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none cursor-pointer"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="bKash / Nagad">bKash / Nagad</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Employee Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <User className="w-4 h-4 text-sky-200" />
          <span>1. Employee Profile &amp; Department Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Employee Full Name *</label>
            <input
              type="text"
              required
              value={formData.employeeName || ''}
              placeholder="Enter employee full name"
              onChange={(e) => handleChange('employeeName', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-semibold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Employee ID *</label>
            <input
              type="text"
              required
              value={formData.employeeId || ''}
              placeholder="Enter employee ID / code"
              onChange={(e) => handleChange('employeeId', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono font-bold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Designation / Role</label>
            <input
              type="text"
              value={formData.designation || ''}
              placeholder="Enter designation / position"
              onChange={(e) => handleChange('designation', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Department</label>
            <input
              type="text"
              value={formData.department || ''}
              placeholder="Enter department"
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Joining Date</label>
            <DatePicker
              value={formData.joiningDate || ''}
              onChange={(val) => handleChange('joiningDate', val)}
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Total Attendance Days</label>
            <input
              type="number"
              value={formData.attendanceDays || ''}
              placeholder="Enter total working days"
              onChange={(e) => handleChange('attendanceDays', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Earnings & Allowances */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-sky-200" />
            <span>2. Earnings &amp; Allowances (BDT)</span>
          </div>
          <span className="font-mono text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-lg">
            Gross: BDT {Number(formData.grossEarnings || 0).toLocaleString('en-BD')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Basic Salary *</label>
            <input
              type="number"
              min="0"
              value={formData.basicSalary || ''}
              placeholder="0"
              onChange={(e) => handleChange('basicSalary', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono font-semibold text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">House Rent Allowance</label>
            <input
              type="number"
              min="0"
              value={formData.houseRentAllowance || ''}
              placeholder="0"
              onChange={(e) => handleChange('houseRentAllowance', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Medical Allowance</label>
            <input
              type="number"
              min="0"
              value={formData.medicalAllowance || ''}
              placeholder="0"
              onChange={(e) => handleChange('medicalAllowance', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Conveyance Allowance</label>
            <input
              type="number"
              min="0"
              value={formData.conveyanceAllowance || ''}
              placeholder="0"
              onChange={(e) => handleChange('conveyanceAllowance', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Other Special Allowance</label>
            <input
              type="number"
              min="0"
              value={formData.otherAllowance || ''}
              placeholder="0"
              onChange={(e) => handleChange('otherAllowance', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Overtime / Extra Duty</label>
            <input
              type="number"
              min="0"
              value={formData.overtimeExtraDuty || ''}
              placeholder="0"
              onChange={(e) => handleChange('overtimeExtraDuty', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Deductions & Adjustments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-600 via-sky-700 to-[#0B3A60] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-200" />
            <span>3. Deductions &amp; Attendance Adjustments</span>
          </div>
          <span className="font-mono text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-lg">
            Total Ded: -BDT {Number(formData.totalDeduction || 0).toLocaleString('en-BD')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1">Advance Salary Taken</label>
            <input
              type="number"
              min="0"
              value={formData.advanceSalary || ''}
              placeholder="0"
              onChange={(e) => handleChange('advanceSalary', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Unpaid Leave / Absent Ded.</label>
            <input
              type="number"
              min="0"
              value={formData.unpaidLeaveAbsence || ''}
              placeholder="0"
              onChange={(e) => handleChange('unpaidLeaveAbsence', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Loan / EMI Deduction</label>
            <input
              type="number"
              min="0"
              value={formData.loanAuthorizedDeduction || ''}
              placeholder="0"
              onChange={(e) => handleChange('loanAuthorizedDeduction', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground mb-1">Tax / Statutory Deduction</label>
            <input
              type="number"
              min="0"
              value={formData.taxStatutoryDeduction || ''}
              placeholder="0"
              onChange={(e) => handleChange('taxStatutoryDeduction', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-foreground mb-1">Other Authorized Deduction</label>
            <input
              type="number"
              min="0"
              value={formData.otherAuthorizedDeduction || ''}
              placeholder="0"
              onChange={(e) => handleChange('otherAuthorizedDeduction', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground font-mono text-xs focus:ring-2 focus:ring-sky-400/40 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Net Salary Payable Card */}
      <div className="bg-gradient-to-br from-sky-50 via-white to-sky-100/50 border border-sky-300 p-5 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">
              Net Payable Salary
            </span>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono mt-0.5">
              BDT {Number(formData.netSalaryPayable || 0).toLocaleString('en-BD')}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Gross: BDT {Number(formData.grossEarnings || 0).toLocaleString('en-BD')} | Deductions: -BDT {Number(formData.totalDeduction || 0).toLocaleString('en-BD')}
            </span>
            <span className="text-xs font-bold text-sky-700 mt-1 inline-block">
              {formData.netSalaryInWords || 'Zero Taka Only'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onSubmit}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
        >
          <Eye className="w-4 h-4 text-primary" />
          <span>Preview Salary Slip</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save & Generate Salary Slip'}</span>
        </button>
      </div>

      {/* Shadcn UI Confirm Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">Confirm Form Reset</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to clear all input data and reset the salary slip form?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <button
              type="button"
              onClick={() => setResetDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmReset}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
            >
              Yes, Reset Form
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SalarySlipForm;

