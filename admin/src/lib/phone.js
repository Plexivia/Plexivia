/**
 * Turns any Bangladeshi mobile number into the 11-digit local form (01XXXXXXXXX).
 *
 *   +8801677532041   -> 01677532041
 *   8801677532041    -> 01677532041
 *   008801677532041  -> 01677532041
 *   +880 1677-532041 -> 01677532041
 *   1677532041       -> 01677532041
 *   01677532041      -> 01677532041
 *
 * Anything it cannot read as a BD mobile number is returned as its digits only,
 * so the validator can still say what is wrong with it.
 */
export function normalizeBdPhone(phone) {
  let digits = String(phone ?? '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) digits = digits.slice(2); // 00880… international prefix
  if (digits.startsWith('880')) digits = digits.slice(3); // country code
  else if (digits.startsWith('88') && digits.length === 13) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`; // missing leading 0

  return digits;
}

export default normalizeBdPhone;
