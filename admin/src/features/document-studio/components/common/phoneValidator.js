import { normalizeBdPhone } from '@/lib/phone';

export { normalizeBdPhone };

/**
 * Utility to validate and normalize Bangladeshi phone numbers.
 * Supports:
 * - Local 11-digit format: 013XXXXXXXX - 019XXXXXXXX
 * - Country code formats: +8801XXXXXXXXX or 8801XXXXXXXXX
 */
export function validateBdPhone(phone) {
  if (Array.isArray(phone)) phone = toPhoneString(phone);
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { isValid: false, formatted: '', error: 'Phone number is required' };
  }

  // Any format (+880…, 880…, 00880…, spaces, dashes) becomes 11 digits first
  const normalized = normalizeBdPhone(phone);

  // BD standard: 11 digits starting with 013, 014, 015, 016, 017, 018, 019
  const bdRegex = /^01[3-9]\d{8}$/;

  if (bdRegex.test(normalized)) {
    return { isValid: true, formatted: normalized, error: null };
  }

  if (normalized.length > 0 && !normalized.startsWith('01')) {
    return {
      isValid: false,
      formatted: phone,
      error: 'Phone number must start with 01 (e.g. 017XXXXXXXX)',
    };
  }

  if (normalized.length > 0 && normalized.length !== 11) {
    return {
      isValid: false,
      formatted: phone,
      error: `Invalid length (${normalized.length}/11 digits). Must be 11 digits`,
    };
  }

  return {
    isValid: false,
    formatted: phone,
    error: 'Must be a valid Bangladeshi mobile number (013-019)',
  };
}


/**
 * Clients store phone as an array (Client.phone: string[]); forms need one string.
 * Returns the first non-empty number, or '' if none.
 */
export function toPhoneString(phone) {
  const raw = Array.isArray(phone) ? phone.find((p) => String(p || '').trim()) : phone;
  if (raw == null || !String(raw).trim()) return '';
  // Store the 11-digit local form (01XXXXXXXXX) whenever the number is a BD mobile
  const local = normalizeBdPhone(raw);
  return /^01[3-9]\d{8}$/.test(local) ? local : String(raw).trim();
}
