import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from "../ui/button";
import { Select } from "../ui/input";
import { Download, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ExportModal = ({ isOpen, onClose, title = 'Export Report Data', dataName = 'Records' }) => {
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('this_month');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`${dataName} successfully exported as ${format.toUpperCase()} (${dateRange.replace('_', ' ')})`);
      onClose();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button variant="primary" icon={Download} onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Generating File...' : 'Download Export'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select export format and date range parameters for {dataName}.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormat('csv')}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              format === 'csv'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              {format === 'csv' && <CheckCircle className="w-4 h-4 text-primary" />}
            </div>
            <div className="mt-3">
              <h4 className="text-sm font-semibold">CSV Excel</h4>
              <p className="text-xs text-muted-foreground">Structured data spreadsheet</p>
            </div>
          </button>

          <button
            onClick={() => setFormat('pdf')}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              format === 'pdf'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <FileText className="w-6 h-6 text-rose-600" />
              {format === 'pdf' && <CheckCircle className="w-4 h-4 text-primary" />}
            </div>
            <div className="mt-3">
              <h4 className="text-sm font-semibold">PDF Document</h4>
              <p className="text-xs text-muted-foreground">Formatted printable report</p>
            </div>
          </button>
        </div>

        <Select
          label="Date Range Filter"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          options={[
            { label: 'Current Month (Aug 2026)', value: 'this_month' },
            { label: 'Previous Month (Jul 2026)', value: 'last_month' },
            { label: 'Last Quarter (Q2 2026)', value: 'last_quarter' },
            { label: 'Year to Date (YTD 2026)', value: 'ytd' }
          ]}
        />
      </div>
    </Modal>
  );
};
