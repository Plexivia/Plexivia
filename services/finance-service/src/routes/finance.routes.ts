import { Router } from 'express';
import {
  getInvoices,
  getPayments,
  getBills,
  getPayroll,
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
