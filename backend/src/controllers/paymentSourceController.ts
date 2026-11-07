import { Request, Response } from 'express';
import { getPaymentModel, getPaymentSourceModel, IPaymentSource } from '../models/Finance.js';
import { getClientModel } from '../models/Client.js';
import { softDeleteOne } from '../plugins/softDelete.js';
import { getBusinessModel, getPaymentMethodModel, nextInvoiceNumber, nextMoneyReceiptNumber, normalizeCharges, roundMoney } from '../models/Accounts.js';

const CLIENT_SOURCE_NAME = 'Client';
const LINK_TYPES = ['client', 'business', 'none'];
const STATUSES = ['Active', 'Inactive'];
const PAYMENT_STATUSES = ['SUCCESS', 'PENDING', 'PARTIAL', 'FAILED'];

const nowIso = () => new Date().toISOString();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isDuplicateKey = (error: any) => error?.code === 11000;

// The built-in Client source must always exist; create it on first use
const ensureClientSource = async () => {
  const SourceModel = getPaymentSourceModel();
  const existing = await SourceModel.findOne({ is_system: true, link_type: 'client' });
  if (existing) return existing;
  return SourceModel.findOneAndUpdate(
    { name: CLIENT_SOURCE_NAME },
    {
      $setOnInsert: { name: CLIENT_SOURCE_NAME, created_at: nowIso() },
      $set: {
        description: 'Payment received from a client against one of their projects.',
        link_type: 'client',
        status: 'Active',
        is_system: true,
        updated_at: nowIso(),
      },
    },
    { upsert: true, new: true, collation: { locale: 'en', strength: 2 } }
  );
};

const findSource = (id: string) => getPaymentSourceModel().findOne({ dId: id });

// List payment sources with how many payments and how much money each brought in
export const getPaymentSources = async (_req: Request, res: Response) => {
  try {
    await ensureClientSource();
    const sources = await getPaymentSourceModel().find({}).sort({ is_system: -1, created_at: 1 }).lean();

    const stats = await getPaymentModel().aggregate([
      { $match: { payment_source_dId: { $ne: null }, status: { $ne: 'FAILED' } } },
      { $group: { _id: '$payment_source_dId', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);
    const statsById = new Map(stats.map((s: any) => [s._id, s]));

    const data = sources.map((s: any) => ({
      ...s,
      payments_count: statsById.get(s.dId)?.count || 0,
      total_received: statsById.get(s.dId)?.total || 0,
    }));

    return res.json({ success: true, status: 'success', count: data.length, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve payment sources' });
  }
};

// Create a user-defined payment source (e.g. one of the owner's businesses)
export const createPaymentSource = async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name || '').trim();
    const linkType = req.body.link_type || 'none';
    const status = req.body.status || 'Active';
    if (!name) return res.status(400).json({ success: false, message: 'Source name is required' });
    if (!LINK_TYPES.includes(linkType)) return res.status(400).json({ success: false, message: 'Invalid payer selection type' });
    if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    // A deleted source keeps its (unique) name; re-creating it brings the old record back
    const SourceModel = getPaymentSourceModel();
    const deleted = await SourceModel.findOne({ name, is_active: false })
      .collation({ locale: 'en', strength: 2 })
      .setOptions({ withInactive: true });
    if (deleted) {
      deleted.set({
        name,
        description: req.body.description,
        link_type: linkType,
        status,
        is_active: true,
        deleted_at: undefined,
        updated_at: nowIso(),
      });
      await deleted.save();
      return res.status(201).json({ success: true, status: 'success', message: 'Payment source created', data: deleted });
    }

    const created = await SourceModel.create({
      name,
      description: req.body.description,
      link_type: linkType,
      status,
      is_system: false,
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    return res.status(201).json({ success: true, status: 'success', message: 'Payment source created', data: created });
  } catch (error: any) {
    if (isDuplicateKey(error)) return res.status(409).json({ success: false, message: 'A payment source with this name already exists' });
    return res.status(500).json({ success: false, message: error.message || 'Failed to create payment source' });
  }
};

// Update a payment source; the built-in Client source only accepts a new description
export const updatePaymentSource = async (req: Request, res: Response) => {
  try {
    const source = await findSource(String(req.params.id));
    if (!source) return res.status(404).json({ success: false, message: 'Payment source not found' });

    const updates: Partial<IPaymentSource> = { updated_at: nowIso() };
    if (req.body.description !== undefined) updates.description = req.body.description;

    if (!source.is_system) {
      if (req.body.name !== undefined) {
        const name = String(req.body.name).trim();
        if (!name) return res.status(400).json({ success: false, message: 'Source name is required' });
        updates.name = name;
      }
      if (req.body.link_type !== undefined) {
        if (!LINK_TYPES.includes(req.body.link_type)) return res.status(400).json({ success: false, message: 'Invalid payer selection type' });
        updates.link_type = req.body.link_type;
      }
      if (req.body.status !== undefined) {
        if (!STATUSES.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid status' });
        updates.status = req.body.status;
      }
    }

    source.set(updates);
    await source.save();

    // Keep the denormalized name on existing payments in step with a rename
    if (updates.name) {
      await getPaymentModel().updateMany({ payment_source_dId: source.dId }, { $set: { payment_source_name: updates.name } });
    }
    return res.json({ success: true, status: 'success', message: 'Payment source updated', data: source });
  } catch (error: any) {
    if (isDuplicateKey(error)) return res.status(409).json({ success: false, message: 'A payment source with this name already exists' });
    return res.status(500).json({ success: false, message: error.message || 'Failed to update payment source' });
  }
};

// Delete a user-defined payment source; payments keep the source name they were saved with
export const deletePaymentSource = async (req: Request, res: Response) => {
  try {
    const source = await findSource(String(req.params.id));
    if (!source) return res.status(404).json({ success: false, message: 'Payment source not found' });
    if (source.is_system) return res.status(400).json({ success: false, message: 'The built-in Client source cannot be deleted' });

    source.set({ is_active: false, deleted_at: nowIso(), updated_at: nowIso() });
    await source.save();
    return res.json({ success: true, status: 'success', message: 'Payment source deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete payment source' });
  }
};

// Resolves and validates source, client and project for a payment body; returns the fields to store
const resolvePaymentParties = async (body: any) => {
  const sourceId = body.payment_source_id;
  if (!sourceId) return { error: 'Payment source is required' };
  const source = await findSource(String(sourceId));
  if (!source) return { error: 'Payment source not found' };

  const cleared = {
    client_id: undefined,
    client_dId: undefined,
    client_name: undefined,
    project_dId: undefined,
    project_name: undefined,
    business_dId: undefined,
    business_name: undefined,
  };

  if (source.link_type === 'business') {
    const businessId = String(body.business_id || '').trim();
    if (!businessId) return { error: 'Business is required for business payments' };
    const business = await getBusinessModel().findOne({ dId: businessId }).lean();
    if (!business) return { error: 'Business not found' };
    return {
      fields: {
        ...cleared,
        payment_source_dId: source.dId,
        payment_source_name: source.name,
        payer_name: business.name,
        business_dId: business.dId,
        business_name: business.name,
      },
    };
  }

  if (source.link_type !== 'client') {
    const payer = String(body.payer_name || '').trim();
    if (!payer) return { error: 'Payer name is required' };
    return {
      fields: {
        ...cleared,
        payment_source_dId: source.dId,
        payment_source_name: source.name,
        payer_name: payer,
      },
    };
  }

  const clientId = String(body.client_id || '').trim();
  if (!clientId) return { error: 'Client is required for client payments' };
  const client = await getClientModel().findOne({ dId: clientId }).lean();
  if (!client) return { error: 'Client not found' };

  const projects = Array.isArray(client.projects) ? client.projects : [];
  const projectId = String(body.project_id || '').trim();
  const project = projects.find((p) => p.dId === projectId);
  if (projects.length > 0 && !project) {
    return { error: projectId ? 'Project does not belong to this client' : 'Project is required for client payments' };
  }

  return {
    fields: {
      ...cleared,
      payment_source_dId: source.dId,
      payment_source_name: source.name,
      payer_name: client.name,
      client_id: client.dId,
      client_dId: client.dId,
      client_name: client.name,
      project_dId: project?.dId,
      project_name: project?.name,
    },
  };
};

const pickPaymentFields = (body: any) => {
  const fields: Record<string, any> = {};
  if (body.amount !== undefined) fields.amount = Number(body.amount);
  if (body.total_amount !== undefined) fields.total_amount = Number(body.total_amount);
  if (body.payment_method !== undefined) fields.payment_method = body.payment_method;
  if (body.transaction_ref !== undefined) fields.transaction_reference = body.transaction_ref;
  // invoice_id is assigned by the server only (serial like 02IN26001) — never taken from the request
  if (body.notes !== undefined) fields.notes = body.notes;
  if (Array.isArray(body.attachments)) fields.attachments = body.attachments;
  if (body.paid_at) fields.paid_at = new Date(body.paid_at).toISOString();
  if (body.status !== undefined) fields.status = body.status;
  if (body.payment_method_id !== undefined) fields.payment_method_dId = body.payment_method_id || undefined;
  return fields;
};

// Charges are a percent / fixed amount of the received amount and are deducted from it
const applyCharges = (fields: Record<string, any>, body: any, currentAmount?: number) => {
  if (body.charges === undefined && fields.amount === undefined) return;
  const amount = fields.amount ?? currentAmount ?? 0;
  const charges = normalizeCharges(body.charges ?? [], amount);
  const total = roundMoney(charges.reduce((sum, c) => sum + c.amount, 0));
  fields.charges = charges;
  fields.charge_total = total;
  fields.net_amount = roundMoney(amount - total);
};

// The method's name is stored on the payment so lists don't need a lookup
const resolveMethodName = async (fields: Record<string, any>) => {
  if (!fields.payment_method_dId) return null;
  const method = await getPaymentMethodModel().findOne({ dId: fields.payment_method_dId }).lean();
  if (!method) return 'Payment method not found';
  fields.payment_method = method.name;
  return null;
};

const validateMoney = (fields: Record<string, any>) => {
  if (fields.amount !== undefined && (!Number.isFinite(fields.amount) || fields.amount <= 0)) return 'Please enter a valid amount';
  if (fields.total_amount !== undefined && (!Number.isFinite(fields.total_amount) || fields.total_amount < 0)) return 'Invalid total amount';
  if (fields.status !== undefined && !PAYMENT_STATUSES.includes(fields.status)) return 'Invalid payment status';
  return null;
};

// Record an incoming payment from any source; client payments are tied to a client project
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    // Legacy callers send only client_id; treat them as Client-source payments
    if (!body.payment_source_id && body.client_id) {
      const clientSource = await ensureClientSource();
      body.payment_source_id = clientSource?.dId;
    }
    if (body.amount === undefined) return res.status(400).json({ success: false, message: 'Amount is required' });

    const fields = pickPaymentFields(body);
    const moneyError = validateMoney(fields);
    if (moneyError) return res.status(400).json({ success: false, message: moneyError });

    const parties = await resolvePaymentParties(body);
    if (parties.error) return res.status(400).json({ success: false, message: parties.error });
    const methodError = await resolveMethodName(fields);
    if (methodError) return res.status(400).json({ success: false, message: methodError });
    applyCharges(fields, body);
    if (fields.charge_total > fields.amount) return res.status(400).json({ success: false, message: 'Charges cannot be more than the received amount' });
    // Fully paid payments get a Money Receipt serial (e.g. 26MR001); partial/due ones get an Invoice serial (e.g. 02IN26001)
    const effectiveStatus = fields.status || 'SUCCESS';
    fields.invoice_id = effectiveStatus === 'SUCCESS' ? await nextMoneyReceiptNumber() : await nextInvoiceNumber();

    const created = await getPaymentModel().create({
      payment_number: body.payment_number || `PX-PAY-${Date.now().toString().slice(-8)}`,
      currency: body.currency || 'BDT',
      status: 'SUCCESS',
      paid_at: nowIso(),
      ...fields,
      ...parties.fields,
      created_at: nowIso(),
      updated_at: nowIso(),
    });

    return res.status(201).json({ success: true, status: 'success', message: 'Payment recorded successfully', data: created });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to record payment' });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await getPaymentModel().findOne({ $or: [{ dId: String(req.params.id) }, { payment_number: String(req.params.id) }] });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    return res.json({ success: true, status: 'success', data: payment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve payment' });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const PaymentModel = getPaymentModel();
    const payment = await PaymentModel.findOne({ dId: String(req.params.id) });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const body = req.body || {};
    const fields = pickPaymentFields(body);
    const moneyError = validateMoney(fields);
    if (moneyError) return res.status(400).json({ success: false, message: moneyError });

    let partyFields = {};
    if (body.payment_source_id !== undefined) {
      const parties = await resolvePaymentParties(body);
      if (parties.error) return res.status(400).json({ success: false, message: parties.error });
      partyFields = parties.fields!;
    }
    const methodError = await resolveMethodName(fields);
    if (methodError) return res.status(400).json({ success: false, message: methodError });
    applyCharges(fields, body, payment.amount);
    if ((fields.charge_total ?? 0) > (fields.amount ?? payment.amount)) {
      return res.status(400).json({ success: false, message: 'Charges cannot be more than the received amount' });
    }
    // The invoice number never changes once issued
    delete fields.invoice_id;

    payment.set({ ...fields, ...partyFields, updated_at: nowIso() });
    await payment.save();
    return res.json({ success: true, status: 'success', message: 'Payment updated', data: payment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update payment' });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const deleted = await softDeleteOne(getPaymentModel(), { dId: String(req.params.id) });
    if (!deleted) return res.status(404).json({ success: false, message: 'Payment not found' });
    return res.json({ success: true, status: 'success', message: 'Payment deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete payment' });
  }
};

// Filterable payment list (source, client, project, status, date range, text search)
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { clientId, sourceId, projectId, status, from, to, q } = req.query;
    const filter: any = {};
    if (clientId) filter.client_id = String(clientId);
    if (sourceId) filter.payment_source_dId = String(sourceId);
    if (projectId) filter.project_dId = String(projectId);
    if (status) filter.status = String(status).toUpperCase();
    if (from || to) {
      filter.paid_at = {};
      if (from) filter.paid_at.$gte = new Date(String(from)).toISOString();
      if (to) filter.paid_at.$lte = new Date(`${String(to).slice(0, 10)}T23:59:59.999Z`).toISOString();
    }
    if (q) {
      const rx = new RegExp(escapeRegex(String(q)), 'i');
      filter.$or = [{ payer_name: rx }, { payment_number: rx }, { invoice_id: rx }, { transaction_reference: rx }, { project_name: rx }, { business_name: rx }];
    }

    const payments = await getPaymentModel().find(filter).sort({ paid_at: -1, created_at: -1 });
    return res.json({ success: true, status: 'success', count: payments.length, data: payments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve payments' });
  }
};
