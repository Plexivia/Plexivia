import { Request, Response } from 'express';
import { getInvoiceModel, getPaymentModel, getBillModel, getPayrollModel } from '../models/Finance.js';
import { getClientModel } from '../models/Agency.js';
import { generatePlexiviaBarcodeSvg, generatePlexiviaBarcodeDataUrl } from '../utils/barcodeGenerator.js';
import { convertNumberToWords } from '../utils/numberToWords.js';

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
      invoice_number: data.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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

// Retrieve client incoming payment records
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.query;
    const filter: any = {};
    if (clientId) {
      filter.client_id = String(clientId);
    }

    const PaymentModel = getPaymentModel();
    const payments = await PaymentModel.find(filter).sort({ created_at: -1 });

    return res.json({
      success: true,
      status: 'success',
      count: payments.length,
      data: payments,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve payments' });
  }
};

// Record a new incoming client payment
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.client_id || !data.amount) {
      return res.status(400).json({ success: false, message: 'Client ID and amount are required' });
    }

    const PaymentModel = getPaymentModel();
    const created = await PaymentModel.create({
      payment_number: data.payment_number || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      invoice_id: data.invoice_id || `INV-${Date.now().toString().slice(-4)}`,
      client_id: data.client_id,
      amount: Number(data.amount),
      currency: data.currency || 'BDT',
      payment_method: data.payment_method || 'BANK_TRANSFER',
      transaction_reference: data.transaction_ref || `TXN-${Date.now().toString().slice(-6)}`,
      status: 'SUCCESS',
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Payment recorded successfully',
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to record payment' });
  }
};

// Retrieve agency operational bills and expenses
export const getBills = async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    const filter: any = {};

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

// Create a new operational expense bill or vendor voucher
export const createBill = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.vendor_name || !data.amount) {
      return res.status(400).json({ success: false, message: 'Vendor name and amount are required' });
    }

    const BillModel = getBillModel();
    const created = await BillModel.create({
      bill_number: data.bill_number || `BILL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vendor_name: data.vendor_name,
      category: data.category || 'INFRASTRUCTURE',
      amount: Number(data.amount),
      currency: data.currency || 'BDT',
      status: data.status || 'PENDING',
      due_date: data.due_date || new Date().toISOString(),
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
