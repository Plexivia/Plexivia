import React, { useEffect, useRef } from 'react';
import { Hash, Loader2 } from 'lucide-react';
import { studioDocumentsApi } from '@/services/settingsApi';

/**
 * The invoice / receipt / slip / voucher number — read-only.
 *
 * Numbers are a plain database serial (e.g. 01MR260001) assigned by the server
 * when the document is saved. Before saving, the field shows the number the
 * save is expected to get; nobody types or generates one by hand.
 *
 * docType: 'invoice' | 'money-receipt' | 'salary-slip' | 'cash-voucher'
 */
export function DocumentNumberField({
  label = 'Document No.',
  docType,
  value = '',
  onChange,
  isSaved = false,
  className = '',
}) {
  const requestedRef = useRef(false);

  // Unsaved document: show the next serial as a preview
  useEffect(() => {
    if (isSaved || value || requestedRef.current) return;
    requestedRef.current = true;
    studioDocumentsApi
      .nextNumber(docType)
      .then((number) => {
        if (number && onChange) onChange(number);
      })
      .catch(() => {});
  }, [isSaved, value, docType, onChange]);

  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold text-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-xs font-bold text-foreground">
        <Hash className="size-3.5 shrink-0 text-muted-foreground" />
        {value ? <span className="truncate">{value}</span> : <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      </div>
      <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
        {isSaved ? 'Issued number — cannot be changed' : 'Auto serial — confirmed on save'}
      </p>
    </div>
  );
}

export default DocumentNumberField;
