import React from 'react';
import { Phone } from 'lucide-react';
import { normalizeBdPhone } from '@/lib/phone';

/**
 * Universal Phone Input component without fixed country code or BD restrictions.
 * Supports standard local numbers, international numbers, and custom formats.
 */
export function BdPhoneInput({
  value = '',
  onChange,
  required = false,
  className = '',
  placeholder = 'Enter phone number...',
  disabled = false,
  id,
  name,
  ...props
}) {
  const handleChange = (e) => {
    const raw = e.target.value;
    onChange && onChange(raw);
  };

  // On leaving the field, a BD mobile number in any format becomes 11 digits (01XXXXXXXXX)
  const handleBlur = (e) => {
    const local = normalizeBdPhone(e.target.value);
    if (/^01[3-9]\d{8}$/.test(local) && local !== e.target.value && onChange) onChange(local);
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <div
      className={`flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-primary overflow-hidden transition-all ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="flex items-center px-2.5 text-muted-foreground/60 shrink-0">
        <Phone className="w-3.5 h-3.5" />
      </div>
      <input
        type="tel"
        id={id}
        name={name}
        disabled={disabled}
        required={required}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-2 py-2 bg-transparent text-foreground text-xs font-mono font-medium outline-none placeholder:text-muted-foreground/40"
        {...props}
        onBlur={handleBlur}
      />
    </div>
  );
}

export const PhoneInput = BdPhoneInput;
export default BdPhoneInput;
