import { Router } from 'express';
import * as accountingController from '../controllers/accountingController.js';

const router = Router();

// Invoices
router.get('/invoices', accountingController.getInvoices);
router.post('/invoices', accountingController.createInvoice);
router.get('/invoices/:id', accountingController.getInvoiceById);
router.patch('/invoices/:id/status', accountingController.updateInvoiceStatus);
router.put('/invoices/:id/status', accountingController.updateInvoiceStatus);

// Payments (Income)
router.get('/payments', accountingController.getPayments);
router.post('/payments', accountingController.recordPayment);

// Bills (Expenses & Vouchers)
router.get('/bills', accountingController.getBills);
router.post('/bills', accountingController.createBill);

// Payroll (Employee Salaries)
router.get('/payroll', accountingController.getPayrolls);
router.post('/payroll', accountingController.createPayroll);

// Financial Reports & Summary
router.get('/summary', accountingController.getFinancialSummary);

// Plexivia Custom Barcode & Money Receipt Engine
router.get('/barcode', accountingController.generateBarcode);
router.post('/barcode/generate', accountingController.generateBarcode);
router.post('/receipts/generate', accountingController.generateMoneyReceipt);

export default router;
