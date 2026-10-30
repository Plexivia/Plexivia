import React from 'react';
import { Modal } from '@/components/common/Modal';
import { TableV2 } from '@/components/table/versionTwo';

type Access = 'full' | 'partial' | 'none';
interface RbacRow {
  role: string;
  roleClass: string;
  cells: Record<string, [string, Access]>;
}

const ACCESS_CLASS: Record<Access, string> = {
  full: 'text-emerald-600 dark:text-emerald-400',
  partial: 'text-muted-foreground',
  none: 'text-muted-foreground/60',
};

const RBAC_ROWS: RbacRow[] = [
  {
    role: 'SUPER_ADMIN',
    roleClass: 'text-rose-500 dark:text-rose-400',
    cells: { projects: ['Full Read/Write', 'full'], clients: ['Full Manage', 'full'], users: ['Full Control', 'full'], studio: ['Full Access', 'full'] },
  },
  {
    role: 'PM (Project Manager)',
    roleClass: 'text-purple-600 dark:text-purple-400',
    cells: { projects: ['Full Manage', 'full'], clients: ['View & Edit', 'full'], users: ['View Only', 'none'], studio: ['Generate & Edit', 'full'] },
  },
  {
    role: 'DEV (Developer)',
    roleClass: 'text-cyan-600 dark:text-cyan-400',
    cells: { projects: ['Manage Tasks', 'full'], clients: ['View Client Info', 'partial'], users: ['No Access', 'none'], studio: ['View Only', 'partial'] },
  },
  {
    role: 'DESIGNER',
    roleClass: 'text-amber-600 dark:text-amber-400',
    cells: { projects: ['Manage UI Tasks', 'full'], clients: ['No Access', 'none'], users: ['No Access', 'none'], studio: ['No Access', 'none'] },
  },
];

// Render one permission cell with its access-level colour
const accessCell = (key: string) => (row: RbacRow) => {
  const [label, level] = row.cells[key];
  return <span className={`font-mono text-[11px] ${ACCESS_CLASS[level]}`}>{label}</span>;
};

const RBAC_COLUMNS = [
  {
    key: 'role',
    header: 'User Type',
    className: 'w-[200px]',
    render: (row: RbacRow) => <span className={`font-mono text-[11px] font-bold ${row.roleClass}`}>{row.role}</span>,
  },
  { key: 'projects', header: 'Projects & Tasks', render: accessCell('projects') },
  { key: 'clients', header: 'Clients & Billing', render: accessCell('clients') },
  { key: 'users', header: 'User Management', render: accessCell('users') },
  { key: 'studio', header: 'Document Studio', render: accessCell('studio') },
];

// Role-based access control matrix showing what each user type can access
export const AccessMatrixModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="User Types & Access"
    subtitle="Role-Based Access Control (RBAC) matrix"
    maxWidth="4xl"
  >
    <div className="overflow-hidden rounded-lg border">
      <TableV2 columns={RBAC_COLUMNS} rows={RBAC_ROWS} getRowId={(row: RbacRow) => row.role} minWidth="min-w-[720px]" />
    </div>
  </Modal>
);

export default AccessMatrixModal;
