import { Request, Response } from 'express';
import { Store } from '../data/store.js';
import { Employee } from '../types/index.js';

// Retrieve all agency employees with optional department and role filtering
export const getEmployees = (req: Request, res: Response) => {
  try {
    const { department, role, search } = req.query;
    let employees = [...Store.employees];

    if (department) {
      employees = employees.filter(e => e.department.toLowerCase() === String(department).toLowerCase());
    }
    if (role) {
      employees = employees.filter(e => e.role.toLowerCase() === String(role).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      employees = employees.filter(e =>
        e.full_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employee_code.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      status: 'success',
      count: employees.length,
      data: employees,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve employees' });
  }
};

// Retrieve a specific agency employee by identifier or employee code
export const getEmployeeById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = Store.employees.find(e => e.id === id || e.employee_code === id);

    if (!employee) {
      return res.status(404).json({ success: false, message: `Employee '${id}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      data: employee,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to retrieve employee' });
  }
};

// Create a new agency internal employee record
export const createEmployee = (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.full_name || !data.email) {
      return res.status(400).json({ success: false, message: 'Employee full name and email are required' });
    }

    const newEmployee: Employee = {
      id: data.id || `emp-${Date.now().toString().slice(-4)}`,
      employee_code: data.employee_code || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      email: String(data.email).trim().toLowerCase(),
      full_name: data.full_name.trim(),
      role: data.role || 'DEV',
      department: data.department || 'Engineering',
      designation: data.designation || 'Software Engineer',
      phone: data.phone,
      salary_monthly: Number(data.salary_monthly || 0),
      joined_date: data.joined_date || new Date().toISOString().split('T')[0],
      status: data.status || 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    Store.employees.unshift(newEmployee);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Employee '${newEmployee.full_name}' created successfully`,
      data: newEmployee,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create employee' });
  }
};

// Update an existing agency employee record
export const updateEmployee = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const index = Store.employees.findIndex(e => e.id === id || e.employee_code === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Employee '${id}' not found` });
    }

    Store.employees[index] = {
      ...Store.employees[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return res.json({
      success: true,
      status: 'success',
      message: `Employee '${Store.employees[index].full_name}' updated successfully`,
      data: Store.employees[index],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update employee' });
  }
};

// Delete an employee from the agency team roster
export const deleteEmployee = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = Store.employees.findIndex(e => e.id === id || e.employee_code === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Employee '${id}' not found` });
    }

    const [deleted] = Store.employees.splice(index, 1);
    return res.json({
      success: true,
      status: 'success',
      message: `Employee '${deleted.full_name}' removed successfully`,
      data: deleted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete employee' });
  }
};
