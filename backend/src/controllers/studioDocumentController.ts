import { Response } from 'express';
import QRCode from 'qrcode';
import { getStudioDocumentModel, nextStudioDocNumber, peekStudioDocNumber, STUDIO_DOC_TYPES, StudioDocType } from '../models/StudioDocument.js';
import { softDeleteOne } from '../plugins/softDelete.js';
import { AuthedRequest } from '../middleware/auth.js';

const ok = (res: Response, data: any, message?: string, code = 200) =>
  res.status(code).json({ success: true, status: 'success', ...(message ? { message } : {}), data });
const fail = (res: Response, code: number, message: string) => res.status(code).json({ success: false, message });

const isDuplicateKey = (error: any) => error?.code === 11000;

// Accepts both the studio's own ids and the hyphenated route aliases
const DOC_TYPE_ALIASES: Record<string, StudioDocType> = {
  invoice: 'invoice',
  invoices: 'invoice',
  'money-receipt': 'money-receipt',
  receipt: 'money-receipt',
  receipts: 'money-receipt',
  'salary-slip': 'salary-slip',
  payroll: 'salary-slip',
  salary: 'salary-slip',
  'cash-voucher': 'cash-voucher',
  voucher: 'cash-voucher',
};

const resolveDocType = (value: any): StudioDocType | null => DOC_TYPE_ALIASES[String(value || '').toLowerCase()] || null;

// Amount shown in listings: whatever the form calls its total
const resolveAmount = (body: any): number => {
  const candidates = [body.amount, body.grandTotal, body.netSalaryPayable, body.totalAmount, body.payload?.grandTotal, body.payload?.amount];
  for (const value of candidates) {
    const num = Number(value);
    if (!Number.isNaN(num) && num !== 0) return num;
  }
  return 0;
};

// GET /documents?type=invoice&clientId=...&limit=50
export const listDocuments = async (req: AuthedRequest, res: Response) => {
  try {
    const filter: any = {};
    const docType = resolveDocType(req.query.type);
    if (req.query.type && !docType) return fail(res, 400, `type must be one of: ${STUDIO_DOC_TYPES.join(', ')}`);
    if (docType) filter.doc_type = docType;
    if (req.query.clientId) filter.client_id = String(req.query.clientId);
    if (req.query.number) filter.doc_number = String(req.query.number);

    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
    const documents = await getStudioDocumentModel().find(filter).sort({ created_at: -1 }).limit(limit);
    return res.json({ success: true, status: 'success', count: documents.length, data: documents });
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to list documents');
  }
};

// GET /documents/next-number?type=invoice — a free number the form can drop straight into its field
export const getNextDocumentNumber = async (req: AuthedRequest, res: Response) => {
  try {
    const docType = resolveDocType(req.query.type);
    if (!docType) return fail(res, 400, `type must be one of: ${STUDIO_DOC_TYPES.join(', ')}`);
    // Preview only: the serial is consumed when the document is saved
    const number = await peekStudioDocNumber(docType);
    return ok(res, { type: docType, number, preview: true });
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to generate a document number');
  }
};

// Public page the receipt QR opens (website), keyed by the document's random dId
const PUBLIC_SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://plexivia.com').replace(/\/+$/, '');
const QR_THEME = { dark: '#0e7490', light: '#ffffff' }; // Plexivia teal

// GET /documents/qr?id=<dId> — QR (data URL) that opens the public receipt view
export const getDocumentQr = async (req: AuthedRequest, res: Response) => {
  try {
    const id = String(req.query.id || '').trim();
    if (!id) return fail(res, 400, 'id is required (save the document first)');
    const url = `${PUBLIC_SITE_URL}/receipt/${encodeURIComponent(id)}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 1, errorCorrectionLevel: 'M', color: QR_THEME });
    return ok(res, { url, dataUrl });
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to generate the QR code');
  }
};

// PUBLIC (no auth): GET /public/receipts/:id — view-only summary for the QR page
export const getPublicReceipt = async (req: AuthedRequest, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) return fail(res, 404, 'Receipt not found');
    const doc: any = await getStudioDocumentModel().findOne({ dId: id, doc_type: 'money-receipt' }).lean();
    if (!doc) return fail(res, 404, 'Receipt not found');
    const p = doc.payload || {};
    return ok(res, {
      receiptNo: doc.doc_number,
      issueDate: doc.issue_date,
      time: p.time || '',
      clientName: doc.client_name,
      service: p.purpose || '',
      amount: doc.amount,
      currency: doc.currency || 'BDT',
      amountInWords: p.amountInWords || '',
      paymentMethod: doc.payment_method,
      status: doc.status || 'Received',
    });
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to load the receipt');
  }
};

// GET /documents/check-number?type=invoice&number=PX-INV-2026-00001&excludeId=<dId>
export const checkDocumentNumber = async (req: AuthedRequest, res: Response) => {
  try {
    const docType = resolveDocType(req.query.type);
    if (!docType) return fail(res, 400, `type must be one of: ${STUDIO_DOC_TYPES.join(', ')}`);

    const number = String(req.query.number || '').trim();
    if (!number) return ok(res, { available: false, reason: 'empty' });

    const filter: any = { doc_type: docType, doc_number: number };
    const excludeId = String(req.query.excludeId || '').trim();
    if (excludeId) filter.dId = { $ne: excludeId };

    const existing = await getStudioDocumentModel()
      .findOne(filter)
      .collation({ locale: 'en', strength: 2 })
      .setOptions({ withInactive: true });

    return ok(res, {
      available: !existing,
      number,
      usedBy: existing ? { dId: existing.dId, clientName: existing.client_name, issueDate: existing.issue_date } : null,
    });
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to check the document number');
  }
};

export const getDocumentById = async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const document = await getStudioDocumentModel().findOne({ $or: [{ dId: id }, { doc_number: id }] });
    if (!document) return fail(res, 404, `Document '${id}' not found`);
    return ok(res, document);
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to retrieve the document');
  }
};

/**
 * POST /documents — saves a generated document. `number` is optional: left out,
 * the next free number for the type is assigned and returned.
 */
export const createDocument = async (req: AuthedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const docType = resolveDocType(body.type || body.docType);
    if (!docType) return fail(res, 400, `type must be one of: ${STUDIO_DOC_TYPES.join(', ')}`);

    // Numbers are always assigned by the server from the serial — client input is ignored
    const docNumber = await nextStudioDocNumber(docType);

    const created = await getStudioDocumentModel().create({
      doc_type: docType,
      doc_number: docNumber,
      client_id: String(body.clientId || '').trim(),
      client_name: String(body.clientName || '').trim(),
      project_id: String(body.projectId || '').trim(),
      payment_method: String(body.paymentMethod || '').trim(),
      payment_method_id: String(body.paymentMethodId || '').trim(),
      amount: resolveAmount(body),
      currency: String(body.currency || 'BDT').trim(),
      status: String(body.status || '').trim(),
      issue_date: String(body.issueDate || '').trim() || new Date().toISOString().slice(0, 10),
      payload: body.payload && typeof body.payload === 'object' ? body.payload : {},
      created_by: req.auth?.sub || '',
    });

    return ok(res, created, `Document '${created.doc_number}' saved`, 201);
  } catch (error: any) {
    if (isDuplicateKey(error)) return fail(res, 409, 'That document number is already used. Generate a new one.');
    return fail(res, 500, error.message || 'Failed to save the document');
  }
};

// PUT /documents/:id — re-saving an already issued document
export const updateDocument = async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const Model = getStudioDocumentModel();
    const document = await Model.findOne({ $or: [{ dId: id }, { doc_number: id }] });
    if (!document) return fail(res, 404, `Document '${id}' not found`);

    // doc_number is fixed once issued — it is not editable
    if (body.clientId !== undefined) document.client_id = String(body.clientId || '').trim();
    if (body.clientName !== undefined) document.client_name = String(body.clientName || '').trim();
    if (body.projectId !== undefined) document.project_id = String(body.projectId || '').trim();
    if (body.paymentMethod !== undefined) document.payment_method = String(body.paymentMethod || '').trim();
    if (body.paymentMethodId !== undefined) document.payment_method_id = String(body.paymentMethodId || '').trim();
    if (body.status !== undefined) document.status = String(body.status || '').trim();
    if (body.currency !== undefined) document.currency = String(body.currency || 'BDT').trim();
    if (body.issueDate !== undefined) document.issue_date = String(body.issueDate || '').trim();
    if (body.payload && typeof body.payload === 'object') {
      document.payload = body.payload;
      document.markModified('payload');
    }
    const amount = resolveAmount(body);
    if (amount) document.amount = amount;
    document.updated_at = new Date().toISOString();

    await document.save();
    return ok(res, document, `Document '${document.doc_number}' updated`);
  } catch (error: any) {
    if (isDuplicateKey(error)) return fail(res, 409, 'That document number is already used. Generate a new one.');
    return fail(res, 500, error.message || 'Failed to update the document');
  }
};

export const deleteDocument = async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await softDeleteOne(getStudioDocumentModel(), { $or: [{ dId: id }, { doc_number: id }] });
    if (!deleted) return fail(res, 404, `Document '${id}' not found`);
    return ok(res, deleted, 'Document removed');
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to remove the document');
  }
};
