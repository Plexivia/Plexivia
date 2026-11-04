import { useCallback, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { validateBdPhone } from './phoneValidator';
import { clientDisplayName } from './useStudioLookups';

const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

/**
 * useClientLookup
 *
 * Watches a phone or email field in a Document Studio form and, once it looks
 * complete, checks it against the Clients directory already loaded in the
 * dashboard. A match offers to autofill the form.
 *
 * The match is made in the browser against `DataContext`, so typing never fires
 * a request — and never a stray "record not found" toast either.
 */
export function useClientLookup({ onClientFound }) {
  const { clients } = useData();
  const debounceRef = useRef(null);
  const promptedValuesRef = useRef(new Set());
  const clientsRef = useRef([]);
  clientsRef.current = Array.isArray(clients) ? clients : [];

  const triggerLookup = useCallback(
    (value) => {
      if (!value || typeof value !== 'string') return;
      const trimmed = value.trim();

      const isEmail = trimmed.includes('@') && trimmed.length >= 5;
      const isPhone = /^[0-9+\-\s()]+$/.test(trimmed) && digitsOnly(trimmed).length >= 8;

      let queryVal = trimmed;
      if (isPhone) {
        const bdCheck = validateBdPhone(trimmed);
        if (!bdCheck.isValid) return; // Not a complete BD mobile number yet
        queryVal = bdCheck.formatted; // Standardised 11-digit form
      } else if (!isEmail) {
        return;
      }

      // Already offered for this value in this session
      if (promptedValuesRef.current.has(queryVal)) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const needle = isEmail ? queryVal.toLowerCase() : digitsOnly(queryVal).slice(-10);

        const matched = clientsRef.current.find((client) => {
          if (isEmail) return String(client.contact_email || '').toLowerCase() === needle;
          const phone = digitsOnly(client.contact_phone).slice(-10);
          const whatsapp = digitsOnly(client.contact_whatsapp).slice(-10);
          return Boolean(needle) && (phone === needle || whatsapp === needle);
        });

        if (!matched) return;

        promptedValuesRef.current.add(queryVal);
        onClientFound(
          {
            ...matched,
            _id: matched.id,
            did: matched.id,
            name: clientDisplayName(matched),
            fullName: clientDisplayName(matched),
            phone: matched.contact_phone || matched.contact_whatsapp || '',
            email: matched.contact_email || '',
          },
          null
        );
      }, 600);
    },
    [onClientFound]
  );

  const resetLookup = useCallback((valueToReset) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (valueToReset) promptedValuesRef.current.delete(String(valueToReset).trim());
  }, []);

  return { triggerLookup, resetLookup };
}
