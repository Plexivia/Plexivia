import { Request, Response } from 'express';
import {
  getInvoiceModel,
  getPaymentModel,
  getBillModel,
  getPayrollModel,
} from '../models/Finance.js';

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
