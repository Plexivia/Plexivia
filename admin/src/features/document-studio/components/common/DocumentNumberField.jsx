import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader2, Wand2 } from 'lucide-react';
import { studioDocumentsApi } from '@/services/settingsApi';

/**
 * The invoice / receipt / slip number field.
 *
 * You can type a number yourself or press the wand inside the box to have a
 * fresh one generated. Either way it is checked against the numbers already
 * issued for this document type, so the same number is never used twice.
 *
 * docType: 'invoice' | 'money-receipt' | 'salary-slip' | 'cash-voucher'
 */
export function DocumentNumberField({
  label = 'Document No.',
  docType,
  value = '',
  onChange,
  excludeId = '',
  disabled = false,
  autoGenerateWhenEmpty = true,
  onAvailabilityChange = null,
  className = '',
}) {
  // 'idle' | 'checking' | 'available' | 'taken' | 'offline'
  const [state, setState] = useState('idle');
  const [takenBy, setTakenBy] = useState(null);
  const [generating, setGenerating] = useState(false);
  const debounceRef = useRef(null);
  const requestedRef = useRef(false);

  const report = useCallback(
    (next) => {
      setState(next);
      if (onAvailabilityChange) onAvailabilityChange(next);
    },
    [onAvailabilityChange]
  );

  // Ask the server for a free number, once, when the field starts out empty
  useEffect(() => {
    if (!autoGenerateWhenEmpty || value || requestedRef.current || disabled) return;
    requestedRef.current = true;
    studioDocumentsApi
      .nextNumber(docType)
      .then((number) => {
        if (number && onChange) onChange(number);
      })
      .catch(() => {
        // No server number available — the caller's locally generated one stands
      });
  }, [autoGenerateWhenEmpty, value, docType, disabled, onChange]);

  // Duplicate check, debounced while typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      report('idle');
      setTakenBy(null);
      return undefined;
    }

    report('checking');
    debounceRef.current = setTimeout(() => {
      studioDocumentsApi
        .checkNumber(docType, trimmed, excludeId)
        .then((result) => {
          if (result?.available === false) {
            setTakenBy(result.usedBy || null);
            report('taken');
          } else {
            setTakenBy(null);
            report('available');
          }
        })
        .catch(() => {
          setTakenBy(null);
          report('offline');
        });
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, docType, excludeId, report]);

  const handleGenerate = async () => {
    if (disabled) return;
    setGenerating(true);
    try {
      const number = await studioDocumentsApi.nextNumber(docType);
      if (number && onChange) onChange(number);
    } catch {
      report('offline');
    } finally {
      setGenerating(false);
    }
  };

  const hint = {
    checking: { icon: Loader2, text: 'Checking…', className: 'text-muted-foreground', spin: true },
    available: { icon: Check, text: 'This number is free', className: 'text-emerald-600' },
    taken: {
      icon: AlertCircle,
      text: takenBy?.clientName ? `Already used for ${takenBy.clientName}` : 'Already used — generate a new one',
      className: 'text-rose-600',
    },
    offline: { icon: AlertCircle, text: 'Could not verify against saved documents', className: 'text-amber-600' },
  }[state];

  const HintIcon = hint?.icon;

  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold text-foreground">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          className={`w-full rounded-xl border bg-background py-2 pl-3 pr-10 font-mono text-xs font-bold text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${
            state === 'taken' ? 'border-rose-500' : 'border-border focus:border-primary'
          }`}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={disabled || generating}
          title="Generate a new number"
          className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
        </button>
      </div>
      {hint && (
        <p className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${hint.className}`}>
          <HintIcon className={`size-3 ${hint.spin ? 'animate-spin' : ''}`} />
          {hint.text}
        </p>
      )}
    </div>
  );
}

export default DocumentNumberField;
