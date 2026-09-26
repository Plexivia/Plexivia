import { Request, Response } from 'express';
import {
  getInvoiceModel,
  getPaymentModel,
  getBillModel,
  getPayrollModel,
} from '../models/Finance.js';
import { generatePlexiviaBarcodeSvg, generatePlexiviaBarcodeDataUrl } from '../utils/barcodeGenerator.js';
import { convertNumberToWords } from '../utils/numberToWords.js';

// Retrieve all invoices
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  const { clientId, status } = req.query;
  const filter: any = {};
  if (clientId) filter.client_id = clientId;
  if (status) filter.status = status;

  try {
    const Invoice = getInvoiceModel();
    const invoices = await Invoice.find(filter).sort({ created_at: -1 });
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

// Retrieve all payments
export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const Payment = getPaymentModel();
    const payments = await Payment.find().sort({ created_at: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

// Retrieve all bills
export const getBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const Bill = getBillModel();
    const bills = await Bill.find().sort({ created_at: -1 });
    res.json({ success: true, count: bills.length, data: bills });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

// Retrieve payroll records
export const getPayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const Payroll = getPayrollModel();
    const records = await Payroll.find().sort({ created_at: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

// Generate specialized Plexivia barcode SVG or JSON data
export const generateBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.query.code || req.body?.code || `PLX-MR-${Date.now().toString().slice(-6)}`);
    const width = Number(req.query.width || req.body?.width || 320);
    const height = Number(req.query.height || req.body?.height || 75);
    const format = String(req.query.format || '').toLowerCase();

    const svg = generatePlexiviaBarcodeSvg(code, { width, height });

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
      return;
    }

    const dataUrl = generatePlexiviaBarcodeDataUrl(code, { width, height });

    res.json({
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
    res.status(500).json({ success: false, message: error.message || 'Failed to generate barcode' });
  }
};

// Generate official Plexivia money receipt with custom barcode and verification hash
export const generateMoneyReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body || {};
    const amount = Number(body.amount || 0);
    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ success: false, message: 'Valid payment amount is required' });
      return;
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

    res.status(201).json({
      success: true,
      status: 'success',
      message: `Money Receipt '${receiptNo}' generated successfully`,
      data: receiptData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate money receipt' });
  }
};
