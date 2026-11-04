import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useData } from '@/context/DataContext';
import { paymentMethodsApi } from '@/services/paymentsApi';

/**
 * The real records the Document Studio forms pick from: this dashboard's own
 * clients, employees and payment methods. Nothing here is sample data, so what
 * a form offers always matches what is in Accounts and the Clients directory.
 */

export const clientDisplayName = (client) =>
  client?.business_name || client?.client_name || client?.name || client?.client_key || 'Unnamed client';

// Clients as combobox options, from the directory the dashboard already loaded
export const useClientOptions = () => {
  const { clients } = useData();
  const list = Array.isArray(clients) ? clients : [];

  return useMemo(
    () =>
      list.map((client) => ({
        value: client.id,
        label: clientDisplayName(client),
        description: [client.contact_phone, client.contact_email].filter(Boolean).join(' • '),
        badge: client.client_key ? `@${client.client_key}` : '',
        keywords: [client.client_name, client.business_name, client.primary_domain].filter(Boolean).join(' '),
        client,
      })),
    [list]
  );
};

// Maps a directory client onto the fields the studio forms use
export const clientToStudioFields = (client) => ({
  clientId: client?.id || '',
  clientName: clientDisplayName(client),
  contactPerson: client?.client_name || '',
  phone: client?.contact_phone || client?.contact_whatsapp || '',
  email: client?.contact_email || '',
  address: client?.primary_domain || '',
  clientKey: client?.client_key || '',
});

/**
 * Payment methods exactly as configured under Accounts → Payment Methods
 * (Cash, bKash, Nagad, Rocket, Upay, bank…). Inactive methods are left out.
 */
export const usePaymentMethodOptions = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    paymentMethodsApi
      .list()
      .then((list) => {
        if (active) setMethods(list.filter((m) => m.status !== 'Inactive'));
      })
      .catch(() => {
        if (active) setMethods([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const options = useMemo(
    () =>
      methods.map((method) => ({
        value: method.name,
        label: method.name,
        description: [method.provider, method.accountNumber].filter(Boolean).join(' • '),
        badge: method.isDefault ? 'Default' : '',
        keywords: method.category,
        method,
      })),
    [methods]
  );

  const defaultMethod = useMemo(() => methods.find((m) => m.isDefault) || methods[0] || null, [methods]);

  return { methods, options, defaultMethod, loading };
};

// Agency employees, for the salary slip's employee picker
export const useEmployeeOptions = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiClient
      .get('/api/agency/employees')
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (active) setEmployees(list.filter((e) => e.status !== 'RESIGNED'));
      })
      .catch(() => {
        if (active) setEmployees([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const options = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.dId || employee.id || employee.employee_code,
        label: employee.full_name || 'Unnamed employee',
        description: [employee.designation, employee.department].filter(Boolean).join(' • '),
        badge: employee.employee_code || '',
        keywords: [employee.email, employee.role].filter(Boolean).join(' '),
        employee,
      })),
    [employees]
  );

  return { employees, options, loading };
};

// Maps an employee record onto the salary slip fields
export const employeeToSlipFields = (employee) => ({
  employeeRef: employee?.dId || employee?.id || '',
  employeeName: employee?.full_name || '',
  employeeId: employee?.employee_code || '',
  designation: employee?.designation || '',
  department: employee?.department || '',
  employeeEmail: employee?.email || '',
  joiningDate: (employee?.joined_date || '').slice(0, 10),
  basicSalary: employee?.salary_monthly || '',
});
