import crypto from 'crypto';
import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { getQrCodeModel } from '../models/QrCode.js';
import { getClientModel } from '../models/Client.js';
import { AuthedRequest } from '../middleware/auth.js';

// Public website base and landing path the QR points to (configurable per deployment)
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://plexivia.com').replace(/\/+$/, '');
const LANDING_PATH = process.env.QR_LANDING_PATH || '/qr';
const QR_PARAM = process.env.QR_QUERY_PARAM || 'code';

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-zA-Z0-9_-]{3,64}$/;

const randomSlug = () => crypto.randomBytes(6).toString('base64url');
const digits = (n?: string) => String(n || '').replace(/\D/g, '');
const clean = (o: any) => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== '' && v != null));

// Our own business info used when source = SELF (set via env)
const selfBusiness = () => ({
  name: process.env.COMPANY_NAME || 'Plexivia',
  phone: process.env.COMPANY_PHONE || '',
  whatsapp: process.env.COMPANY_WHATSAPP || process.env.COMPANY_PHONE || '',
  email: process.env.COMPANY_EMAIL || '',
  website: SITE_URL,
  address: process.env.COMPANY_ADDRESS || '',
  logo_url: process.env.COMPANY_LOGO_URL || '',
});

// Pull business info from an existing client record
const clientBusiness = async (clientDId: string) => {
  const c: any = await getClientModel().findOne({ dId: clientDId }).lean();
  if (!c) throw new Error('Client not found');
  const domain = c.primary_domain || '';
  return {
    name: c.business_name || c.client_name || c.name,
    phone: c.contact_phone || c.phone?.[0] || '',
    whatsapp: c.contact_whatsapp || c.contact_phone || c.phone?.[0] || '',
    email: c.contact_email || c.email || '',
    website: domain ? (/^https?:\/\//.test(domain) ? domain : `https://${domain}`) : '',
    address: c.address || '',
  };
};

// Fill business from the SELF/CLIENT source; manually sent business fields override it
const resolveBusiness = async (data: any) => {
  if (data.source === 'SELF') data.business = { ...selfBusiness(), ...clean(data.business) };
  else if (data.source === 'CLIENT') {
    if (!data.client_dId) throw new Error('client_dId is required when source = CLIENT');
    data.business = { ...(await clientBusiness(data.client_dId)), ...clean(data.business) };
  }
  return data;
};

// vCard 3.0 — scanning saves the contact directly on the phone
const vEsc = (v?: string) => String(v || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
export const buildVCard = (qr: any) => {
  const b = qr.business || {};
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${vEsc(b.name)}`, `ORG:${vEsc(b.name)}`];
  if (b.phone) lines.push(`TEL;TYPE=WORK,VOICE:${b.phone}`);
  if (b.whatsapp && b.whatsapp !== b.phone) lines.push(`TEL;TYPE=CELL:${b.whatsapp}`);
  if (b.email) lines.push(`EMAIL;TYPE=WORK:${b.email}`);
  if (b.website) lines.push(`URL:${b.website}`);
  if (b.address) lines.push(`ADR;TYPE=WORK:;;${vEsc(b.address)};;;;`);
  if (b.tagline) lines.push(`TITLE:${vEsc(b.tagline)}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
};

// Content encoded inside the QR image
export const buildQrTarget = (qr: any): string => {
  switch (qr.target_mode) {
    case 'CUSTOM_URL':
      if (!qr.custom_url) throw new Error('custom_url missing');
      return qr.custom_url;
    case 'VCARD':
      return buildVCard(qr);
    case 'WHATSAPP': {
      const num = digits(qr.whatsapp?.number || qr.business?.whatsapp || qr.business?.phone);
      if (!num) throw new Error('WhatsApp number missing');
      const msg = qr.whatsapp?.message ? `?text=${encodeURIComponent(qr.whatsapp.message)}` : '';
      return `https://wa.me/${num}${msg}`;
    }
    default:
      return `${SITE_URL}${LANDING_PATH}?${QR_PARAM}=${encodeURIComponent(qr.slug)}`;
  }
};

const withTarget = (qr: any) => {
  const obj = qr.toObject ? qr.toObject() : qr;
  let target_url = '';
  try { target_url = buildQrTarget(obj); } catch { /* incomplete config */ }
  return { ...obj, target_url };
};

// Pick only editable fields from the request body and validate them
const sanitize = (body: any, partial: boolean) => {
  const out: any = {};
  if (body.title !== undefined) out.title = String(body.title).trim();
  for (const k of ['business', 'source', 'client_dId', 'target_mode', 'template', 'whatsapp', 'payment']) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  if (body.fields !== undefined) {
    if (!Array.isArray(body.fields)) throw new Error('fields must be an array');
    out.fields = body.fields
      .filter((f: any) => f && f.label && f.value !== undefined)
      .map((f: any) => ({ label: String(f.label), value: String(f.value), type: f.type || 'text' }));
  }
  if (body.custom_url !== undefined) {
    if (body.custom_url && !/^https?:\/\//i.test(body.custom_url)) throw new Error('custom_url must start with http:// or https://');
    out.custom_url = body.custom_url;
  }
  if (body.style !== undefined) {
    const s = body.style || {};
    if (s.color && !HEX.test(s.color)) throw new Error('style.color must be #RRGGBB');
    if (s.background && !HEX.test(s.background)) throw new Error('style.background must be #RRGGBB');
    out.style = s;
  }
  if (body.is_active !== undefined) out.is_active = Boolean(body.is_active);
  if (body.slug !== undefined) {
    if (!SLUG.test(body.slug)) throw new Error('slug must be 3-64 chars: letters, numbers, - or _');
    out.slug = body.slug;
  }
  if (!partial) {
    if (out.source !== 'SELF' && out.source !== 'CLIENT' && !out.business?.name) throw new Error('business.name is required');
    if (out.target_mode === 'CUSTOM_URL' && !out.custom_url) throw new Error('custom_url is required for CUSTOM_URL mode');
  }
  return out;
};

// GET /qr — list QR codes (?search=&active=&client_dId=&target_mode=)
export const listQrCodes = async (req: Request, res: Response) => {
  try {
    const { search, active, client_dId, target_mode } = req.query;
    const filter: any = {};
    if (active === 'true') filter.is_active = true;
    if (active === 'false') filter.is_active = false;
    if (client_dId) filter.client_dId = String(client_dId);
    if (target_mode) filter.target_mode = String(target_mode);
    if (search) {
      const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { 'business.name': rx }, { slug: rx }];
    }
    const items = await getQrCodeModel().find(filter).sort({ created_at: -1 }).lean();
    return res.json({ success: true, data: items.map(withTarget) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to list QR codes' });
  }
};

// GET /qr/:id — single QR code by dId or slug
export const getQrCode = async (req: Request, res: Response) => {
  const qr = await getQrCodeModel().findOne({ $or: [{ dId: req.params.id }, { slug: req.params.id }] }).lean();
  if (!qr) return res.status(404).json({ success: false, message: 'QR code not found' });
  return res.json({ success: true, data: withTarget(qr) });
};

// POST /qr — create a QR code
export const createQrCode = async (req: AuthedRequest, res: Response) => {
  try {
    const data = await resolveBusiness(sanitize(req.body, false));
    if (!data.title) data.title = data.business?.name;
    const Model = getQrCodeModel();
    if (!data.slug) {
      do { data.slug = randomSlug(); } while (await Model.exists({ slug: data.slug }));
    } else if (await Model.exists({ slug: data.slug })) {
      return res.status(409).json({ success: false, message: 'slug already in use' });
    }
    buildQrTarget(data); // validate target config before saving
    const user: any = (req as any).user || {};
    const qr = await Model.create({ ...data, created_by: user.dId || user.id || user.sub });
    return res.status(201).json({ success: true, data: withTarget(qr) });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create QR code' });
  }
};

// PATCH /qr/:id — change data any time; LANDING QRs keep the same printed image
// Send { resync: true } to re-pull business info from the client/self source
export const updateQrCode = async (req: Request, res: Response) => {
  try {
    const data = sanitize(req.body, true);
    const Model = getQrCodeModel();
    const cur: any = await Model.findOne({ dId: req.params.id }).lean();
    if (!cur) return res.status(404).json({ success: false, message: 'QR code not found' });
    if (data.slug && data.slug !== cur.slug && await Model.exists({ slug: data.slug })) {
      return res.status(409).json({ success: false, message: 'slug already in use' });
    }
    if (req.body.resync || data.source || data.client_dId) {
      data.source = data.source || cur.source;
      data.client_dId = data.client_dId || cur.client_dId;
      await resolveBusiness(data);
    }
    // Merge nested objects field by field instead of replacing them
    const set: any = { updated_at: new Date().toISOString() };
    for (const [k, v] of Object.entries(data)) {
      if (['business', 'style', 'whatsapp'].includes(k) && v && typeof v === 'object') {
        for (const [nk, nv] of Object.entries(v as any)) set[`${k}.${nk}`] = nv;
      } else set[k] = v;
    }
    const qr = await Model.findOneAndUpdate({ dId: req.params.id }, { $set: set }, { new: true, runValidators: true }).lean();
    return res.json({ success: true, data: withTarget(qr) });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update QR code' });
  }
};

// DELETE /qr/:id
export const deleteQrCode = async (req: Request, res: Response) => {
  const r = await getQrCodeModel().deleteOne({ dId: req.params.id });
  if (!r.deletedCount) return res.status(404).json({ success: false, message: 'QR code not found' });
  return res.json({ success: true });
};

// GET /qr/:id/image?format=png|svg|dataurl|vcf&size=512&download=1
export const getQrImage = async (req: Request, res: Response) => {
  try {
    const qr: any = await getQrCodeModel().findOne({ dId: req.params.id }).lean();
    if (!qr) return res.status(404).json({ success: false, message: 'QR code not found' });
    const format = String(req.query.format || 'png');
    if (format === 'vcf') {
      res.type('text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="${qr.slug}.vcf"`);
      return res.send(buildVCard(qr));
    }
    const width = Math.min(Math.max(Number(req.query.size) || 512, 128), 2048);
    const opts = {
      width,
      margin: qr.style?.margin ?? 2,
      errorCorrectionLevel: qr.style?.error_correction || 'M',
      color: { dark: qr.style?.color || '#000000', light: qr.style?.background || '#ffffff' },
    };
    const text = buildQrTarget(qr);

    if (format === 'svg') {
      res.type('image/svg+xml');
      return res.send(await QRCode.toString(text, { ...opts, type: 'svg' }));
    }
    if (format === 'dataurl') {
      return res.json({ success: true, data: { target_url: text, data_url: await QRCode.toDataURL(text, opts) } });
    }
    const buf = await QRCode.toBuffer(text, { ...opts, type: 'png' });
    res.type('image/png');
    if (req.query.download) res.setHeader('Content-Disposition', `attachment; filename="qr-${qr.slug}.png"`);
    return res.send(buf);
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to render QR image' });
  }
};

// POST /qr/preview — render a QR for unsaved data ({ text } or a full QR body)
export const previewQr = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    let text = body.text ? String(body.text) : '';
    if (!text) {
      const data = await resolveBusiness(sanitize(body, true));
      text = buildQrTarget({ slug: 'preview', ...data });
    }
    const s = body.style || {};
    const data_url = await QRCode.toDataURL(text, {
      width: 512, margin: 2,
      color: { dark: HEX.test(s.color) ? s.color : '#000000', light: HEX.test(s.background) ? s.background : '#ffffff' },
    });
    return res.json({ success: true, data: { target_url: text, data_url } });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to render preview' });
  }
};

// PUBLIC: GET /qr/public/:slug (or ?code=) — data for the website landing page
export const getPublicQrData = async (req: Request, res: Response) => {
  const slug = String(req.params.slug || req.query[QR_PARAM] || '');
  if (!slug) return res.status(400).json({ success: false, message: 'code is required' });
  const qr: any = await getQrCodeModel().findOneAndUpdate(
    { slug, is_active: true },
    { $inc: { scan_count: 1 }, $set: { last_scanned_at: new Date().toISOString() } },
    { new: true },
  ).lean();
  if (!qr) return res.status(404).json({ success: false, message: 'QR code not found or inactive' });
  const wa = digits(qr.business?.whatsapp);
  return res.json({
    success: true,
    data: {
      slug: qr.slug,
      title: qr.title,
      template: qr.template,
      business: qr.business,
      fields: qr.fields,
      payment: qr.template === 'PAYMENT' ? qr.payment : undefined,
      whatsapp_url: wa ? `https://wa.me/${wa}` : undefined,
      vcard_url: `${req.baseUrl}/public/${qr.slug}/vcard`,
    },
  });
};

// PUBLIC: GET /qr/public/:slug/vcard — "Save contact" button on the landing page
export const getPublicVCard = async (req: Request, res: Response) => {
  const qr: any = await getQrCodeModel().findOne({ slug: req.params.slug, is_active: true }).lean();
  if (!qr) return res.status(404).json({ success: false, message: 'QR code not found or inactive' });
  res.type('text/vcard');
  res.setHeader('Content-Disposition', `attachment; filename="${qr.slug}.vcf"`);
  return res.send(buildVCard(qr));
};
