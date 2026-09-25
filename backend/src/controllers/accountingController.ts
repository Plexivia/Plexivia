import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { Invoice, Payment, Bill, PayrollRecord, FinancialSummary } from '../types/index.js';

// Retrieve all invoices with client and status filtering
export const getInvoices = (req: Request, res: Response) => {
  try {
    const { status, clientId } = req.query;
    let invoices = [...Store.invoices];

    if (status) {
      invoices = invoices.filter(inv => inv.status.toLowerCase() === String(status).toLowerCase());
    }
    if (clientId) {
      invoices = invoices.filter(inv => inv.client_id === String(clientId));
    }

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
export const getInvoiceById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = Store.invoices.find(inv => inv.id === id || inv.invoice_number === id);

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
export const createInvoice = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.client_id || !data.amount) {
      return res.status(400).json({ success: false, message: 'Client ID and amount are required' });
    }

    const client = Store.clients.find(c => c.id === data.client_id || c.client_key === data.client_id);
    const newInvoice: Invoice = {
      id: data.id || `inv-${Date.now().toString().slice(-4)}`,
      invoice_number: data.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      client_id: data.client_id,
      client_name: client?.business_name || data.client_name || 'Client',
      client_email: client?.contact_email || data.client_email,
      amount: Number(data.amount),
      currency: data.currency || 'BDT',
      status: data.status || 'UNPAID',
      due_date: data.due_date || new Date(Date.now() + 14 * 86400000).toISOString(),
      issued_date: data.issued_date || new Date().toISOString(),
      items: data.items || [{ id: 'item-1', description: 'Development Services', quantity: 1, unit_price: Number(data.amount), total: Number(data.amount) }],
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    Store.invoices.unshift(newInvoice);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Invoice '${newInvoice.invoice_number}' created successfully`,
      data: newInvoice,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create invoice' });
  }
};

// Update invoice payment and settlement status
export const updateInvoiceStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const index = Store.invoices.findIndex(inv => inv.id === id || inv.invoice_number === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Invoice '${id}' not found` });
    }

    Store.invoices[index].status = status;
    Store.invoices[index].updated_at = new Date().toISOString();

    return res.json({
      success: true,
      status: 'success',
      message: `Invoice status updated to '${status}'`,
      data: Store.invoices[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update invoice status' });
  }
};

// Retrieve client incoming payment records
export const getPayments = (req: Request, res: Response) => {
  try {
    const { clientId } = req.query;
    let payments = [...Store.payments];

    if (clientId) {
      payments = payments.filter(p => p.client_id === String(clientId));
    }

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

// Record a new incoming client payment and automatically link or generate invoice
export const recordPayment = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.client_id || !data.amount) {
      return res.status(400).json({ success: false, message: 'Client ID and amount are required' });
    }

    const client = Store.clients.find(c => c.id === data.client_id || c.client_key === data.client_id);
    const paymentId = `pay-${Date.now().toString().slice(-4)}`;

    let invoiceId = data.invoice_id;
    if (!invoiceId) {
      const autoInvoice: Invoice = {
        id: `inv-${Date.now().toString().slice(-4)}`,
        invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        client_id: data.client_id,
        client_name: client?.business_name || 'Client',
        amount: Number(data.amount),
        currency: data.currency || 'BDT',
        status: 'PAID',
        due_date: new Date().toISOString(),
        issued_date: new Date().toISOString(),
        items: [{ id: 'item-1', description: data.notes || 'Client Payment Settlement', quantity: 1, unit_price: Number(data.amount), total: Number(data.amount) }],
        payment_id: paymentId,
        created_at: new Date().toISOString(),
      };
      Store.invoices.unshift(autoInvoice);
      invoiceId = autoInvoice.id;
    } else {
      const invIndex = Store.invoices.findIndex(inv => inv.id === invoiceId);
      if (invIndex !== -1) {
        Store.invoices[invIndex].status = 'PAID';
        Store.invoices[invIndex].payment_id = paymentId;
        Store.invoices[invIndex].updated_at = new Date().toISOString();
      }
    }

    const newPayment: Payment = {
      id: paymentId,
      invoice_id: invoiceId,
      client_id: data.client_id,
      client_name: client?.business_name || data.client_name || 'Client',
      amount: Number(data.amount),
      currency: data.currency || 'BDT',
      payment_method: data.payment_method || 'BANK_TRANSFER',
      transaction_ref: data.transaction_ref || `TXN-${Date.now().toString().slice(-6)}`,
      received_at: data.received_at || new Date().toISOString(),
      status: 'COMPLETED',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    Store.payments.unshift(newPayment);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Payment recorded and invoice reconciled successfully',
      data: newPayment,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to record payment' });
  }
};

// Retrieve agency operational bills and expenses
export const getBills = (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    let bills = [...Store.bills];

    if (category) {
      bills = bills.filter(b => b.category.toLowerCase() === String(category).toLowerCase());
    }
    if (status) {
      bills = bills.filter(b => b.status.toLowerCase() === String(status).toLowerCase());
    }

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
export const createBill = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.vendor_name || !data.amount) {
      return res.status(400).json({ success: false, message: 'Vendor name and amount are required' });
    }

    const newBill: Bill = {
      id: data.id || `bill-${Date.now().toString().slice(-4)}`,
      bill_number: data.bill_number || `BILL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vendor_name: data.vendor_name,
      category: data.category || 'INFRA_SERVER',
      amount: Number(data.amount),
      currency: data.currency || 'BDT',
      due_date: data.due_date || new Date().toISOString(),
      paid_date: data.status === 'PAID' ? new Date().toISOString() : undefined,
      status: data.status || 'UNPAID',
      receipt_url: data.receipt_url,
      created_at: new Date().toISOString(),
    };

    Store.bills.unshift(newBill);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Bill created successfully',
      data: newBill,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create bill' });
  }
};

// Retrieve employee payroll salary disbursement records
export const getPayrolls = (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    let payrolls = [...Store.payrolls];

    if (month) {
      payrolls = payrolls.filter(p => p.month === String(month));
    }

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
export const createPayroll = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.employee_id || !data.basic_salary) {
      return res.status(400).json({ success: false, message: 'Employee ID and basic salary are required' });
    }

    const employee = Store.employees.find(e => e.id === data.employee_id || e.employee_code === data.employee_id);
    const basic = Number(data.basic_salary);
    const bonuses = Number(data.bonuses || 0);
    const deductions = Number(data.deductions || 0);
    const netPayable = basic + bonuses - deductions;

    const newPayroll: PayrollRecord = {
      id: data.id || `pr-${Date.now().toString().slice(-4)}`,
      employee_id: data.employee_id,
      employee_name: employee?.full_name || data.employee_name || 'Employee',
      month: data.month || new Date().toISOString().slice(0, 7),
      basic_salary: basic,
      bonuses,
      deductions,
      net_payable: netPayable,
      status: data.status || 'PAID',
      disbursed_at: data.status === 'PAID' ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString(),
    };

    Store.payrolls.unshift(newPayroll);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Payroll recorded successfully',
      data: newPayroll,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to record payroll' });
  }
};

// Calculate and retrieve high level financial metrics, revenue, and payroll summary
export const getFinancialSummary = (_req: Request, res: Response) => {
  try {
    const totalRetainers = Store.clients.reduce((acc, c) => acc + (c.monthly_retainer || c.monthly_revenue || 0), 0);
    const totalRevenue = Store.payments.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + p.amount, 0);
    const totalBills = Store.bills.filter(b => b.status === 'PAID').reduce((acc, b) => acc + b.amount, 0);
    const totalPayroll = Store.payrolls.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.net_payable, 0);
    const totalExpenses = totalBills + totalPayroll;

    const unpaidInvoicesAmount = Store.invoices.filter(inv => inv.status === 'UNPAID' || inv.status === 'OVERDUE').reduce((acc, inv) => acc + inv.amount, 0);
    const pendingPayrollAmount = Store.payrolls.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.net_payable, 0);

    const summary: FinancialSummary = {
      total_revenue: totalRevenue,
      monthly_recurring_revenue: totalRetainers,
      total_expenses: totalExpenses,
      net_profit: totalRevenue - totalExpenses,
      unpaid_invoices_amount: unpaidInvoicesAmount,
      pending_payroll_amount: pendingPayrollAmount,
      active_retainers_count: Store.clients.filter(c => (c.monthly_retainer || 0) > 0).length,
    };

    return res.json({
      success: true,
      status: 'success',
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to calculate financial summary' });
  }
};
