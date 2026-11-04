import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getOrCreateAppSettings, IAppSettings } from '../models/Settings.js';
import { AuthedRequest } from '../middleware/auth.js';

export const BRAND_DIR = path.resolve(process.cwd(), 'uploads', 'brand');
export const BRAND_URL_PREFIX = '/api/uploads/brand/';

const BRAND_TEXT_FIELDS = [
  'name', 'legal_name', 'brand_title', 'brand_subtitle', 'tagline',
  'logo_url', 'icon_url', 'phone', 'phone_local', 'email', 'website', 'domain',
];
const ADDRESS_FIELDS = ['line1', 'road', 'district', 'postcode', 'country', 'full', 'full_bn'];
const DOC_TEXT_FIELDS = ['currency', 'invoice_prefix', 'receipt_prefix', 'slip_prefix', 'payment_terms', 'receipt_signatory'];
const DOC_NUMBER_FIELDS = ['default_tax_rate', 'invoice_due_days'];

const ok = (res: Response, data: any, message?: string) =>
  res.json({ success: true, status: 'success', ...(message ? { message } : {}), data });

// Only known fields are copied over, so a stray key in the body can never reach the document
const applyText = (target: any, source: any, fields: string[]) => {
  if (!source || typeof source !== 'object') return;
  for (const field of fields) {
    if (source[field] === undefined || source[field] === null) continue;
    target[field] = String(source[field]).trim();
  }
};

// Address printed on documents; rebuilt from its parts whenever the caller does not send one
const composeAddress = (address: any) => {
  const parts = [address?.line1, address?.road, address?.district, address?.postcode ? `Post Code ${address.postcode}` : '']
    .map((p) => String(p || '').trim())
    .filter(Boolean);
  return parts.join(', ');
};

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getOrCreateAppSettings();
    return ok(res, settings);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load settings' });
  }
};

// Brand identity and document defaults; both blocks are optional in the body
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = (await getOrCreateAppSettings()) as IAppSettings;
    const { brand, documents } = req.body || {};

    if (brand && typeof brand === 'object') {
      applyText(settings.brand, brand, BRAND_TEXT_FIELDS);
      if (brand.address && typeof brand.address === 'object') {
        applyText(settings.brand.address, brand.address, ADDRESS_FIELDS);
        if (brand.address.full === undefined) {
          const composed = composeAddress(settings.brand.address);
          if (composed) settings.brand.address.full = composed;
        }
      }
      settings.markModified('brand');
    }

    if (documents && typeof documents === 'object') {
      applyText(settings.documents, documents, DOC_TEXT_FIELDS);
      for (const field of DOC_NUMBER_FIELDS) {
        if (documents[field] === undefined || documents[field] === null || documents[field] === '') continue;
        const value = Number(documents[field]);
        if (!Number.isNaN(value) && value >= 0) (settings.documents as any)[field] = value;
      }
      settings.markModified('documents');
    }

    settings.updated_at = new Date().toISOString();
    await settings.save();
    return ok(res, settings, 'Settings saved');
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to save settings' });
  }
};

const IMAGE_SIGNATURES: Array<{ ext: string; test: (buf: Buffer) => boolean }> = [
  { ext: 'png', test: (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'jpg', test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'gif', test: (b) => b.length > 3 && b.subarray(0, 3).toString('ascii') === 'GIF' },
  { ext: 'webp', test: (b) => b.length > 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP' },
  { ext: 'svg', test: (b) => b.subarray(0, 1024).toString('utf8').toLowerCase().includes('<svg') },
];

const detectImageExt = (buf: Buffer): string | null => IMAGE_SIGNATURES.find((s) => s.test(buf))?.ext || null;

export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

/**
 * Replaces the brand logo (`?slot=logo`, the default) or the square app icon
 * (`?slot=icon`). The image arrives as a raw body, like profile photos do.
 */
export const uploadBrandImage = async (req: AuthedRequest, res: Response) => {
  try {
    const file = req.body;
    if (!Buffer.isBuffer(file) || file.length === 0) {
      return res.status(400).json({ success: false, message: 'Send the image as a png, jpeg, webp, gif or svg file (max 2 MB).' });
    }
    const ext = detectImageExt(file);
    if (!ext) {
      return res.status(400).json({ success: false, message: 'Unsupported image. Use png, jpeg, webp, gif or svg.' });
    }

    const slot = String(req.query.slot || 'logo') === 'icon' ? 'icon' : 'logo';
    const settings = (await getOrCreateAppSettings()) as IAppSettings;
    const field = slot === 'icon' ? 'icon_url' : 'logo_url';

    fs.mkdirSync(BRAND_DIR, { recursive: true });
    const fileName = `${slot}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(BRAND_DIR, fileName), file);

    // Drop the file this one replaces so old uploads do not pile up
    const previous = settings.brand[field];
    if (previous && previous.startsWith(BRAND_URL_PREFIX)) {
      const oldFile = path.join(BRAND_DIR, path.basename(previous));
      if (oldFile.startsWith(BRAND_DIR)) fs.rm(oldFile, { force: true }, () => {});
    }

    settings.brand[field] = BRAND_URL_PREFIX + fileName;
    settings.markModified('brand');
    settings.updated_at = new Date().toISOString();
    await settings.save();

    return ok(res, settings, slot === 'icon' ? 'App icon updated' : 'Logo updated');
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload image' });
  }
};
