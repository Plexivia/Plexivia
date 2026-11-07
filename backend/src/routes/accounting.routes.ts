import { Router } from 'express';
import * as accountingController from '../controllers/accountingController.js';
import * as paymentSourceController from '../controllers/paymentSourceController.js';
import * as accountsSetupController from '../controllers/accountsSetupController.js';
import * as purchaseController from '../controllers/purchaseController.js';
import { requireAuth } from '../middleware/auth.js';
import { emailReceipt } from '../controllers/receiptMailController.js';
import { importSurokkhaDay, importSurokkhaPaymentsDay } from '../utils/surokkhaBillImport.js';

const router = Router();

// All routes in this router require a valid access token
router.use(requireAuth);

// Email a payment receipt / slip to the client over SMTP
router.post('/receipts/email', emailReceipt);

// Invoices
router.get('/invoices', accountingController.getInvoices);
router.post('/invoices', accountingController.createInvoice);
router.get('/invoices/:id', accountingController.getInvoiceById);
router.patch('/invoices/:id/status', accountingController.updateInvoiceStatus);
router.put('/invoices/:id/status', accountingController.updateInvoiceStatus);

// Payments (Income)
router.get('/payments', paymentSourceController.getPayments);
router.post('/payments', paymentSourceController.recordPayment);
router.get('/payments/:id', paymentSourceController.getPaymentById);
router.put('/payments/:id', paymentSourceController.updatePayment);
router.delete('/payments/:id', paymentSourceController.deletePayment);

// Payment methods (with their regular charges)
router.get('/payment-methods', accountsSetupController.getPaymentMethods);
router.post('/payment-methods', accountsSetupController.createPaymentMethod);
router.put('/payment-methods/:id', accountsSetupController.updatePaymentMethod);
router.delete('/payment-methods/:id', accountsSetupController.deletePaymentMethod);

// The owner's own businesses
router.get('/businesses', accountsSetupController.getBusinesses);
router.post('/businesses', accountsSetupController.createBusiness);
router.get('/businesses/:id', accountsSetupController.getBusinessById);
router.put('/businesses/:id', accountsSetupController.updateBusiness);
router.delete('/businesses/:id', accountsSetupController.deleteBusiness);

// Payment sources
router.get('/payment-sources', paymentSourceController.getPaymentSources);
router.post('/payment-sources', paymentSourceController.createPaymentSource);
router.put('/payment-sources/:id', paymentSourceController.updatePaymentSource);
router.delete('/payment-sources/:id', paymentSourceController.deletePaymentSource);

// Vendors (who stock is bought from)
router.get('/vendors', purchaseController.getVendors);
router.post('/vendors', purchaseController.createVendor);
router.put('/vendors/:id', purchaseController.updateVendor);
router.delete('/vendors/:id', purchaseController.deleteVendor);

// Product purchases: each one keeps a "Product Purchase" bill and Surokkha's stock in step
router.get('/purchases', purchaseController.getPurchases);
router.post('/purchases', purchaseController.createPurchase);
router.get('/purchases/stock-items', purchaseController.getStockItems);
router.post('/purchases/resync-all', purchaseController.resyncAllPurchases);
router.get('/purchases/:id', purchaseController.getPurchaseById);
router.put('/purchases/:id', purchaseController.updatePurchase);
router.post('/purchases/:id/receive', purchaseController.receivePurchase);
router.post('/purchases/:id/payments', purchaseController.addPurchasePayment);
router.delete('/purchases/:id/payments/:paymentId', purchaseController.removePurchasePayment);
router.post('/purchases/:id/cancel', purchaseController.cancelPurchase);
router.post('/purchases/:id/resync', purchaseController.resyncPurchase);
router.get('/purchases/:id/sync-check', purchaseController.checkPurchaseSync);

// Bills (Expenses & Vouchers)
router.get('/bills', accountingController.getBills);
router.post('/bills', accountingController.createBill);
// Import one day's Surokkha bill summary now (?date=YYYY-MM-DD); the nightly job does this automatically
router.post('/bills/import-surokkha', async (req, res) => {
  const date = String(req.query.date || req.body?.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ success: false, message: 'date must be YYYY-MM-DD' });
  try {
    return res.json({ success: true, data: await importSurokkhaDay(date) });
  } catch (error: any) {
    return res.status(502).json({ success: false, message: error.message });
  }
});
// Import one day's Surokkha payments now (?date=YYYY-MM-DD) as a single business payment
router.post('/payments/import-surokkha', async (req, res) => {
  const date = String(req.query.date || req.body?.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ success: false, message: 'date must be YYYY-MM-DD' });
  try {
    return res.json({ success: true, data: await importSurokkhaPaymentsDay(date) });
  } catch (error: any) {
    return res.status(502).json({ success: false, message: error.message });
  }
});
router.get('/bills/:id', accountingController.getBillById);
router.put('/bills/:id', accountingController.updateBill);
router.delete('/bills/:id', accountingController.deleteBill);

// Payroll (Employee Salaries)
router.get('/payroll', accountingController.getPayrolls);
router.post('/payroll', accountingController.createPayroll);

// Financial Reports & Summary
router.get('/summary', accountingController.getFinancialSummary);
router.get('/balance/monthly', accountingController.getMonthlyBalance);

// Plexivia Custom Barcode & Money Receipt Engine
router.get('/barcode', accountingController.generateBarcode);
router.post('/barcode/generate', accountingController.generateBarcode);
router.post('/receipts/generate', accountingController.generateMoneyReceipt);

export default router;
