import { Request, Response } from 'express';
import { getInvoiceModel, getPaymentModel, getBillModel, getPayrollModel } from '../models/Finance.js';
import { getClientModel } from '../models/Agency.js';
import { generatePlexiviaBarcodeSvg, generatePlexiviaBarcodeDataUrl } from '../utils/barcodeGenerator.js';
import { convertNumberToWords } from '../utils/numberToWords.js';
import { softDeleteOne } from '../plugins/softDelete.js';
import { getPaymentMethodModel, nextInvoiceNumber, nextSequence, normalizeCharges, roundMoney } from '../models/Accounts.js';

// Retrieve all invoices with client and status filtering
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { status, clientId } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = new RegExp(`^${status}$`, 'i');
    }
    if (clientId) {
      filter.client_id = String(clientId);
    }

    const InvoiceModel = getInvoiceModel();
    const invoices = await InvoiceModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: invoices.length,
      data: invoices,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve invoices' });
  }
};

// Retrieve a specific invoice by identifier
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const InvoiceModel = getInvoiceModel();
    const invoice = await InvoiceModel.findOne({ $or: [{ invoice_number: id }] });

    if (!invoice) {
      return res.status(404).json({ success: false, message: `Invoice '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: invoice,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve invoice' });
  }
};

// Create a new client billing invoice
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.client_id || !data.amount) {
      return res.status(400).json({ success: false, message: 'Client ID and amount are required' });
    }

    const InvoiceModel = getInvoiceModel();
    const ClientModel = getClientModel();
    const client = await ClientModel.findOne({ $or: [{ id: data.client_id }, { client_key: data.client_id }] });

    const created = await InvoiceModel.create({
      invoice_number: data.invoice_number || (await nextInvoiceNumber()),
      client_id: data.client_id,
      client_name: client?.name || data.client_name || 'Client',
      amount: Number(data.amount),
      currency: data.currency || 'BDT',
      status: data.status || 'SENT',
      due_date: data.due_date || new Date(Date.now() + 14 * 86400000).toISOString(),
      issue_date: data.issue_date || new Date().toISOString(),
      items: data.items || [{ description: 'Development Services', quantity: 1, unit_price: Number(data.amount), total: Number(data.amount) }],
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Invoice '${created.invoice_number}' created successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create invoice' });
  }
};

// Update invoice payment and settlement status
export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const InvoiceModel = getInvoiceModel();

    const invoice = await InvoiceModel.findOneAndUpdate(
      { invoice_number: id },
      { $set: { status } },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: `Invoice '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Invoice status updated to '${status}'`,
      data: invoice,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update invoice status' });
  }
};

// Narrows bills/payments to one asset: ?project=<dId> or ?client=<dId>; project=__none__ is Plexivia's own records
const assetFilter = (query: any) => {
  const filter: any = {};
  if (query.project === '__none__') filter.project_dId = { $in: [null, ''] };
  else if (query.project) filter.project_dId = String(query.project);
  if (query.client) filter.client_dId = String(query.client);
  return filter;
};

// Retrieve agency operational bills and expenses
export const getBills = async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    const filter: any = { ...assetFilter(req.query) };

    if (category) {
      filter.category = new RegExp(String(category), 'i');
    }
    if (status) {
      filter.status = new RegExp(String(status), 'i');
    }

    const BillModel = getBillModel();
    const bills = await BillModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: bills.length,
      data: bills,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve bills' });
  }
};

// Bill numbers like PX-BILL-2026-00001, numbered per year
const nextBillNumber = async () => {
  const year = new Date().getFullYear();
  return `PX-BILL-${year}-${String(await nextSequence(`bill:${year}`)).padStart(5, '0')}`;
};

// When the dashboard sends base_amount / charges, the bill total is the base plus its payment-method charges
const billChargeFields = async (data: any) => {
  const fields: Record<string, any> = {};
  if (data.payment_method_id !== undefined) {
    fields.payment_method_dId = data.payment_method_id || undefined;
    if (data.payment_method_id) {
      const method = await getPaymentMethodModel().findOne({ dId: String(data.payment_method_id) }).lean();
      if (!method) return { error: 'Payment method not found' };
      fields.payment_method = method.name;
    } else fields.payment_method = undefined;
  }
  if (data.base_amount === undefined && data.charges === undefined) return { fields };
  const base = Math.max(0, Number(data.base_amount ?? data.amount) || 0);
  const charges = normalizeCharges(data.charges ?? [], base);
  const chargeTotal = roundMoney(charges.reduce((sum, c) => sum + c.amount, 0));
  Object.assign(fields, { base_amount: base, charges, charge_total: chargeTotal, amount: roundMoney(base + chargeTotal) });
  return { fields };
};

// Create a new operational expense bill or vendor voucher
export const createBill = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.vendor_name || !(data.amount || data.base_amount)) {
      return res.status(400).json({ success: false, message: 'Vendor name and amount are required' });
    }

    const charged = await billChargeFields(data);
    if (charged.error) return res.status(400).json({ success: false, message: charged.error });

    const BillModel = getBillModel();
    const created = await BillModel.create({
      bill_number: data.bill_number || (await nextBillNumber()),
      client_dId: data.client_dId || data.client_id || undefined,
      client_name: data.client_name || undefined,
      project_dId: data.project_dId || data.project_id || undefined,
      project_name: data.project_name || undefined,
      title: data.title || undefined,
      bill_type: data.bill_type || undefined,
      vendor_name: data.vendor_name,
      category: data.category || 'INFRASTRUCTURE',
      amount: Number(data.amount),
      currency: data.currency || 'BDT',
      paid_amount: Number(data.paid_amount) || 0,
      status: data.status || 'PENDING',
      billing_date: data.billing_date || new Date().toISOString(),
      due_date: data.due_date || '',
      line_items: Array.isArray(data.line_items) ? data.line_items : [],
      external_ref: data.external_ref || undefined,
      notes: data.notes || undefined,
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      ...charged.fields,
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Bill created successfully',
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create bill' });
  }
};

// Fields a bill update may change; numbers and the importer ref are kept out of free-form $set
const BILL_EDITABLE = ['title', 'bill_type', 'vendor_name', 'category', 'amount', 'paid_amount', 'status', 'billing_date', 'due_date',
  'client_dId', 'client_name', 'project_dId', 'project_name', 'line_items', 'notes', 'attachments'];

const findBillQuery = (id: string) => ({ $or: [{ dId: id }, { bill_number: id }] });

// Retrieve one bill by dId or bill number
export const getBillById = async (req: Request, res: Response) => {
  try {
    const bill = await getBillModel().findOne(findBillQuery(String(req.params.id)));
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.json({ success: true, data: bill });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve bill' });
  }
};

// Update a bill's editable fields
export const updateBill = async (req: Request, res: Response) => {
  try {
    const updates: any = {};
    for (const key of BILL_EDITABLE) if (req.body[key] !== undefined) updates[key] = req.body[key];
    if (updates.amount !== undefined) updates.amount = Number(updates.amount) || 0;
    if (updates.paid_amount !== undefined) updates.paid_amount = Number(updates.paid_amount) || 0;
    const charged = await billChargeFields(req.body || {});
    if (charged.error) return res.status(400).json({ success: false, message: charged.error });
    Object.assign(updates, charged.fields);
    const bill = await getBillModel().findOneAndUpdate(findBillQuery(String(req.params.id)), { $set: updates }, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.json({ success: true, message: 'Bill updated', data: bill });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update bill' });
  }
};

// Delete a bill
export const deleteBill = async (req: Request, res: Response) => {
  try {
    const bill = await softDeleteOne(getBillModel(), findBillQuery(String(req.params.id)));
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.json({ success: true, message: 'Bill deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete bill' });
  }
};

// Retrieve employee payroll salary disbursement records
export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    const filter: any = {};
    if (month) {
      filter.month = String(month);
    }

    const PayrollModel = getPayrollModel();
    const payrolls = await PayrollModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve payrolls' });
  }
};

// Record employee payroll salary disbursement
export const createPayroll = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.employee_id || !data.basic_salary) {
      return res.status(400).json({ success: false, message: 'Employee ID and basic salary are required' });
    }

    const basic = Number(data.basic_salary);
    const bonuses = Number(data.bonuses || 0);
    const deductions = Number(data.deductions || 0);
    const netPayable = basic + bonuses - deductions;

    const PayrollModel = getPayrollModel();
    const created = await PayrollModel.create({
      payroll_number: `PAY-${Date.now().toString().slice(-4)}`,
      employee_id: data.employee_id,
      employee_name: data.employee_name || 'Employee',
      month: data.month || new Date().toISOString().slice(0, 7),
      base_salary: basic,
      bonus: bonuses,
      deductions,
      net_payable: netPayable,
      status: data.status || 'PROCESSED',
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Payroll recorded successfully',
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to record payroll' });
  }
};

// Calculate and retrieve high level financial metrics
export const getFinancialSummary = async (_req: Request, res: Response) => {
  try {
    const PaymentModel = getPaymentModel();
    const BillModel = getBillModel();
    const PayrollModel = getPayrollModel();
    const InvoiceModel = getInvoiceModel();

    const [payments, bills, payrolls, invoices] = await Promise.all([
      PaymentModel.find({ status: 'SUCCESS' }),
      BillModel.find({ status: 'PAID' }),
      PayrollModel.find({ status: 'PAID' }),
      InvoiceModel.find({ status: { $in: ['SENT', 'OVERDUE'] } }),
    ]);

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalBills = bills.reduce((acc, b) => acc + b.amount, 0);
    const totalPayroll = payrolls.reduce((acc, p) => acc + p.net_payable, 0);
    const totalExpenses = totalBills + totalPayroll;
    const unpaidInvoicesAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0);

    return res.json({
      success: true,
      status: 'success',
      data: {
        total_revenue: totalRevenue,
        monthly_recurring_revenue: 0,
        total_expenses: totalExpenses,
        net_profit: totalRevenue - totalExpenses,
        unpaid_invoices_amount: unpaidInvoicesAmount,
        pending_payroll_amount: 0,
        active_retainers_count: 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to calculate financial summary' });
  }
};

// Monthly cash position for a year: only received payments and paid bills count, plus investments taken
export const getMonthlyBalance = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const asset = assetFilter(req.query);
    const [payments, bills] = await Promise.all([
      getPaymentModel().find({ status: 'SUCCESS', ...asset }).lean(),
      getBillModel().find({ status: 'PAID', ...asset }).lean(),
    ]);

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: `${year}-${String(i + 1).padStart(2, '0')}`,
      received: 0,
      received_count: 0,
      bills: 0,
      bills_count: 0,
      investment: 0,
      investment_count: 0,
      cash_balance: 0,
      running_cash_balance: 0,
    }));
    let openingBalance = 0;

    // Add an amount to its calendar month, or to the opening balance when it falls before the year
    const book = (dateValue: string | undefined, amount: number, field: 'received' | 'bills' | 'investment') => {
      const key = String(dateValue || '').slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(key)) return;
      const sign = field === 'bills' ? -1 : 1;
      if (Number(key.slice(0, 4)) < year) {
        openingBalance += sign * amount;
        return;
      }
      const row = months.find((m) => m.month === key);
      if (!row) return;
      row[field] += amount;
      row[`${field}_count` as 'received_count' | 'bills_count' | 'investment_count'] += 1;
    };

    payments.forEach((p: any) => book(p.paid_at || p.created_at, Number(p.amount) || 0, 'received'));
    bills.forEach((b: any) => book(b.paid_at || b.due_date || b.created_at, Number(b.amount) || 0, 'bills'));

    let running = openingBalance;
    for (const m of months) {
      m.cash_balance = m.received + m.investment - m.bills;
      running += m.cash_balance;
      m.running_cash_balance = running;
    }

    const totals = months.reduce(
      (acc, m) => ({
        received: acc.received + m.received,
        bills: acc.bills + m.bills,
        investment: acc.investment + m.investment,
        cash_balance: acc.cash_balance + m.cash_balance,
      }),
      { received: 0, bills: 0, investment: 0, cash_balance: 0 }
    );

    return res.json({
      success: true,
      data: { year, opening_balance: openingBalance, closing_balance: running, months, totals, investments_tracked: false },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to calculate monthly balance' });
  }
};

// Generate specialized Plexivia barcode SVG or JSON data
export const generateBarcode = async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code || req.body?.code || `PLX-MR-${Date.now().toString().slice(-6)}`);
    const width = Number(req.query.width || req.body?.width || 320);
    const height = Number(req.query.height || req.body?.height || 75);
    const format = String(req.query.format || '').toLowerCase();

    const svg = generatePlexiviaBarcodeSvg(code, { width, height });

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    }

    const dataUrl = generatePlexiviaBarcodeDataUrl(code, { width, height });

    return res.json({
      success: true,
      status: 'success',
      data: {
        code: code.startsWith('PLX-') ? code : `PLX-${code}`,
        width,
        height,
        svg,
        data_url: dataUrl,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to generate barcode' });
  }
};

// Generate official Plexivia money receipt with custom barcode and verification hash
export const generateMoneyReceipt = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const amount = Number(body.amount || 0);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const dateObj = new Date();
    const yy = String(dateObj.getFullYear()).slice(-2);
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const randomHex = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();

    const receiptNo = body.receiptNo || `PLX-MR-${yy}${mm}${dd}-${randomHex}`;
    const token = `PLX-SEC-${yy}${mm}-${Math.floor(100 + Math.random() * 900)}`;
    const barcodeSvg = generatePlexiviaBarcodeSvg(receiptNo, { width: 340, height: 75 });
    const barcodeDataUrl = generatePlexiviaBarcodeDataUrl(receiptNo, { width: 340, height: 75 });
    const amountInWords = body.amountInWords || convertNumberToWords(amount);

    const receiptData = {
      receipt_no: receiptNo,
      token,
      date: body.date || dateObj.toISOString().split('T')[0],
      time: body.time || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      client_name: body.clientName || body.client_name || 'Mashruf Ahmed',
      address: body.address || 'Manda khalpar, Dhaka-1214',
      purpose: body.purpose || 'Received investment amount via bKash',
      payment_method: body.paymentMethod || body.payment_method || 'bKash',
      amount,
      currency: body.currency || 'BDT',
      amount_in_words: amountInWords,
      received_by: body.receivedBy || body.received_by || 'accounts@plexivia.com',
      received_by_role: 'Accounts & Finance',
      status: 'CONFIRMED',
      transaction_reference: body.transactionRef || `BKASH-TXN-${yy}${mm}${dd}-${randomHex}`,
      barcode: {
        code: receiptNo,
        svg: barcodeSvg,
        data_url: barcodeDataUrl,
      },
      verification: {
        verified: true,
        seal: 'PAID & SEALED',
        verification_hash: `PLX-V1-${randomHex}-${amount}`,
        qr_url: `https://plexivia.com/verify/receipt/${receiptNo}`,
      },
      created_at: dateObj.toISOString(),
    };

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Money Receipt '${receiptNo}' generated successfully`,
      data: receiptData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to generate money receipt' });
  }
};
