import { Router } from 'express';
import {
  getInvoices,
  getPayments,
  getBills,
  getPayroll,
  generateBarcode,
  generateMoneyReceipt,
} from '../controllers/financeController.js';

export const financeRouter = Router();

// Route: Invoices
financeRouter.get('/invoices', getInvoices);

// Route: Payments
financeRouter.get('/payments', getPayments);

// Route: Bills
financeRouter.get('/bills', getBills);

// Route: Payroll
financeRouter.get('/payroll', getPayroll);

// Route: Plexivia Custom Barcode & Receipt Generation
financeRouter.get('/barcode', generateBarcode);
financeRouter.post('/barcode/generate', generateBarcode);
financeRouter.post('/receipts/generate', generateMoneyReceipt);
