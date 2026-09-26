import { Request, Response } from 'express';
import { getEmployeeModel } from '../models/Agency.js';
import { generateDId } from '../utils/dId.js';

// Retrieve all agency employees with optional department and role filtering
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { department, role, search } = req.query;
    const filter: any = {};

    if (department) {
      filter.department = new RegExp(String(department), 'i');
    }
    if (role) {
      filter.role = new RegExp(String(role), 'i');
    }
    if (search) {
      const q = String(search);
      filter.full_name = new RegExp(q, 'i');
    }

    const EmployeeModel = getEmployeeModel();
    const employees = await EmployeeModel.find(filter).sort({ created_at: -1 });

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

// Retrieve a specific agency employee by identifier
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const EmployeeModel = getEmployeeModel();
    const employee = await EmployeeModel.findOne({ $or: [{ id }, { employee_code: id }] });

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

// Create a new agency internal employee record with 16-digit dId
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.full_name || !data.email) {
      return res.status(400).json({ success: false, message: 'Employee full name and email are required' });
    }

    const EmployeeModel = getEmployeeModel();
    const dId = generateDId();

    const created = await EmployeeModel.create({
      dId,
      employee_code: data.employee_code || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      email: String(data.email).trim().toLowerCase(),
      full_name: data.full_name.trim(),
      role: data.role || 'DEV',
      department: data.department || 'Engineering',
      designation: data.designation || 'Software Engineer',
      salary_monthly: Number(data.salary_monthly || 0),
      joined_date: data.joined_date || new Date().toISOString().split('T')[0],
      status: data.status || 'ACTIVE',
      created_at: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: `Employee '${created.full_name}' created successfully`,
      data: created,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create employee' });
  }
};

// Update an existing agency employee record by 16-digit dId
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const updates = req.body;
    const EmployeeModel = getEmployeeModel();

    const employee = await EmployeeModel.findOneAndUpdate(
      { $or: [{ dId: identifier }, { id: identifier }, { employee_code: identifier }] },
      { $set: updates },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: `Employee '${identifier}' not found` });
    }

    return res.json({
      success: true,
      status: 'success',
      message: `Employee '${employee.full_name}' updated successfully`,
      data: employee,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update employee' });
  }
};

// Delete an employee from the database
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const identifier = (req.params.dId || req.params.id) as string;
    const EmployeeModel = getEmployeeModel();
    const deleted = await EmployeeModel.findOneAndDelete({
      $or: [{ dId: identifier }, { id: identifier }, { employee_code: identifier }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: `Employee '${identifier}' not found` });
    }

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

