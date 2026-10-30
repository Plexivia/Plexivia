import crypto from 'crypto';

const SCRYPT_KEYLEN = 64;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Hash a password with scrypt and a random salt, stored as "scrypt$<salt>$<hash>"
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
};

// Verify a password against a stored scrypt hash in constant time
export const verifyPassword = (password: string, stored?: string | null): boolean => {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

// Constant-time string comparison
export const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// Generate a random base32 TOTP secret (160 bits)
export const generateTotpSecret = (): string => {
  const bytes = crypto.randomBytes(20);
  let bits = '';
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) out += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  return out;
};

const base32Decode = (input: string): Buffer => {
  const clean = input.replace(/=+$/, '').toUpperCase();
  let bits = '';
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error('Invalid base32 secret');
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
};

const totpAt = (key: Buffer, counter: number): string => {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, '0');
};

// Verify a 6-digit RFC 6238 TOTP code, allowing one 30s step of clock drift
export const verifyTotp = (secret: string, code: string): boolean => {
  if (!secret || !/^\d{6}$/.test(code)) return false;
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((drift) => safeEqual(totpAt(key, counter + drift), code));
};

// Generate a 6-digit numeric OTP using a CSPRNG
export const generateNumericOtp = (): string => crypto.randomInt(100000, 1000000).toString();

// Keys for secrets stored in the database: SETTINGS_ENCRYPTION_KEY first, then the legacy JWT_SECRET-derived key
const getSecretKeys = (): Buffer[] => {
  const secrets = [process.env.SETTINGS_ENCRYPTION_KEY, process.env.JWT_SECRET].filter(Boolean) as string[];
  return Array.from(new Set(secrets.length ? secrets : [''])).map((k) => crypto.createHash('sha256').update(k).digest());
};

// Encrypt a secret with AES-256-GCM (iv:tag:ciphertext, base64)
export const encryptText = (plain: string): string => {
  if (!plain) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getSecretKeys()[0], iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((b) => b.toString('base64')).join(':');
};

// Decrypt a value produced by encryptText with any known key; returns '' when it cannot be read
export const decryptText = (stored: string): string => {
  const [iv, tag, data] = (stored || '').split(':').map((p) => Buffer.from(p, 'base64'));
  if (!iv || !tag || !data) return '';
  for (const key of getSecretKeys()) {
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    } catch {
      // Try the next key
    }
  }
  return '';
};
