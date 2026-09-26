import crypto from 'crypto';

// Generate cryptographically secure 16-digit unique numeric identifier
export const generateDId = (): string => {
  const buf = crypto.randomBytes(8);
  const num = (BigInt('0x' + buf.toString('hex')) % 9000000000000000n) + 1000000000000000n;
  return num.toString();
};
