import { Request, Response } from 'express';
import { getBusinessModel, getPaymentMethodModel, seedDefaultPaymentMethods } from '../models/Accounts.js';
import { softDeleteOne } from '../plugins/softDelete.js';

const nowIso = () => new Date().toISOString();
const isDuplicateKey = (error: any) => error?.code === 11000;
const STATUSES = ['Active', 'Inactive'];
const METHOD_CATEGORIES = ['mfs', 'bank', 'cash', 'card', 'gateway', 'other'];

const str = (v: any) => (v === undefined || v === null ? undefined : String(v).trim());

// Keeps only named charges with a non-negative percent / fixed amount
const cleanFees = (fees: any) =>
  (Array.isArray(fees) ? fees : [])
    .map((f: any) => ({
      name: String(f?.name || '').trim(),
      percent: Math.max(0, Number(f?.percent) || 0),
      fixed: Math.max(0, Number(f?.fixed) || 0),
    }))
    .filter((f) => f.name);

const pick = (body: any, fields: string[]) => {
  const out: Record<string, any> = {};
  for (const f of fields) {
    const v = str(body[f]);
    if (v !== undefined) out[f] = v;
  }
  return out;
};

const ok = (res: Response, data: any, message?: string, code = 200) =>
  res.status(code).json({ success: true, status: 'success', ...(message ? { message } : {}), data });
const fail = (res: Response, code: number, message: string) => res.status(code).json({ success: false, message });

// ---------- Payment methods ----------

const METHOD_TEXT_FIELDS = ['name', 'provider', 'account_number', 'account_name', 'account_type', 'branch_name', 'routing_number', 'instructions', 'description'];

const methodFields = (body: any) => {
  const fields: Record<string, any> = pick(body, METHOD_TEXT_FIELDS);
  if (body.category !== undefined) {
    if (!METHOD_CATEGORIES.includes(body.category)) return { error: 'Invalid category' };
    fields.category = body.category;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return { error: 'Invalid status' };
    fields.status = body.status;
  }
  if (body.fees !== undefined) fields.fees = cleanFees(body.fees);
  if (body.is_default !== undefined) fields.is_default = Boolean(body.is_default);
  return { fields };
};

// Only one method can be the default at a time
const clearOtherDefaults = (keepId: string) =>
  getPaymentMethodModel().updateMany({ dId: { $ne: keepId }, is_default: true }, { $set: { is_default: false } });

export const getPaymentMethods = async (_req: Request, res: Response) => {
  try {
    await seedDefaultPaymentMethods();
    const methods = await getPaymentMethodModel().find({}).sort({ is_default: -1, created_at: 1 });
    return ok(res, methods);
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to retrieve payment methods');
  }
};

export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const { fields, error } = methodFields(req.body || {});
    if (error) return fail(res, 400, error);
    if (!fields!.name) return fail(res, 400, 'Payment method name is required');
    const created = await getPaymentMethodModel().create({ ...fields, created_at: nowIso(), updated_at: nowIso() });
    if (created.is_default) await clearOtherDefaults(created.dId);
    return ok(res, created, 'Payment method created', 201);
  } catch (error: any) {
    if (isDuplicateKey(error)) return fail(res, 409, 'A payment method with this name already exists');
    return fail(res, 500, error.message || 'Failed to create payment method');
  }
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { fields, error } = methodFields(req.body || {});
    if (error) return fail(res, 400, error);
    if (fields!.name === '') return fail(res, 400, 'Payment method name is required');
    const updated = await getPaymentMethodModel().findOneAndUpdate(
      { dId: String(req.params.id) },
      { $set: { ...fields, updated_at: nowIso() } },
      { new: true, runValidators: true }
    );
    if (!updated) return fail(res, 404, 'Payment method not found');
    if (updated.is_default) await clearOtherDefaults(updated.dId);
    return ok(res, updated, 'Payment method updated');
  } catch (error: any) {
    if (isDuplicateKey(error)) return fail(res, 409, 'A payment method with this name already exists');
    return fail(res, 500, error.message || 'Failed to update payment method');
  }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const deleted = await softDeleteOne(getPaymentMethodModel(), { dId: String(req.params.id) });
    if (!deleted) return fail(res, 404, 'Payment method not found');
    return ok(res, null, 'Payment method deleted');
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to delete payment method');
  }
};

// ---------- Businesses ----------

const BUSINESS_TEXT_FIELDS = [
  'name', 'legal_name', 'business_type', 'owner_name', 'email', 'phone', 'website', 'address',
  'trade_license', 'tin', 'bin', 'logo_url', 'admin_dashboard_url', 'frontend_url', 'notes',
];

const businessFields = (body: any) => {
  const fields: Record<string, any> = pick(body, BUSINESS_TEXT_FIELDS);
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return { error: 'Invalid status' };
    fields.status = body.status;
  }
  return { fields };
};

export const getBusinesses = async (_req: Request, res: Response) => {
  try {
    return ok(res, await getBusinessModel().find({}).sort({ name: 1 }).collation({ locale: 'en' }));
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to retrieve businesses');
  }
};

export const getBusinessById = async (req: Request, res: Response) => {
  try {
    const business = await getBusinessModel().findOne({ dId: String(req.params.id) });
    if (!business) return fail(res, 404, 'Business not found');
    return ok(res, business);
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to retrieve business');
  }
};

export const createBusiness = async (req: Request, res: Response) => {
  try {
    const { fields, error } = businessFields(req.body || {});
    if (error) return fail(res, 400, error);
    if (!fields!.name) return fail(res, 400, 'Business name is required');
    const created = await getBusinessModel().create({ ...fields, created_at: nowIso(), updated_at: nowIso() });
    return ok(res, created, 'Business created', 201);
  } catch (error: any) {
    if (isDuplicateKey(error)) return fail(res, 409, 'A business with this name already exists');
    return fail(res, 500, error.message || 'Failed to create business');
  }
};

export const updateBusiness = async (req: Request, res: Response) => {
  try {
    const { fields, error } = businessFields(req.body || {});
    if (error) return fail(res, 400, error);
    if (fields!.name === '') return fail(res, 400, 'Business name is required');
    const updated = await getBusinessModel().findOneAndUpdate(
      { dId: String(req.params.id) },
      { $set: { ...fields, updated_at: nowIso() } },
      { new: true, runValidators: true }
    );
    if (!updated) return fail(res, 404, 'Business not found');
    return ok(res, updated, 'Business updated');
  } catch (error: any) {
    if (isDuplicateKey(error)) return fail(res, 409, 'A business with this name already exists');
    return fail(res, 500, error.message || 'Failed to update business');
  }
};

export const deleteBusiness = async (req: Request, res: Response) => {
  try {
    const deleted = await softDeleteOne(getBusinessModel(), { dId: String(req.params.id) });
    if (!deleted) return fail(res, 404, 'Business not found');
    return ok(res, null, 'Business deleted');
  } catch (error: any) {
    return fail(res, 500, error.message || 'Failed to delete business');
  }
};
