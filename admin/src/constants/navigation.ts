import {
  FolderKanban,
  Building2,
  Users,
  CheckSquare,
  FileText,
  FileCheck,
  CreditCard,
  Banknote,
  Receipt,
  Coins,
  Award,
  ShieldCheck,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';
import type { MenuGroup } from '@/types';

export const NAVIGATION_MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Agency Management',
    items: [
      {
        title: 'Users',
        url: '/users',
        icon: UserCheck,
      },
      {
        title: 'Projects',
        url: '/projects',
        icon: FolderKanban,
      },
      {
        title: 'Tasks',
        url: '/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Clients',
        url: '/clients',
        icon: Building2,
      },
      {
        title: 'Team',
        url: '/team',
        icon: Users,
      },
    ],
  },
  {
    label: 'Document Studio',
    items: [
      {
        title: 'Document Studio',
        url: '/documents',
        icon: FileText,
        badge: '9 Tools',
        badgeVariant: 'secondary',
        items: [
          {
            title: 'Employment Agreement',
            url: '/documents/agreement',
            icon: FileCheck,
          },
          {
            title: 'ID Card Builder',
            url: '/documents/idcard',
            icon: CreditCard,
          },
          {
            title: 'Salary / Payslip',
            url: '/documents/salary',
            icon: Banknote,
          },
          {
            title: 'Money Receipt',
            url: '/documents/receipt',
            icon: Receipt,
          },
          {
            title: 'Cash Voucher',
            url: '/documents/cash-voucher',
            icon: Coins,
          },
          {
            title: 'Experience Certificate',
            url: '/documents/experience-certificate',
            icon: Award,
          },
          {
            title: 'Character Certificate',
            url: '/documents/character-certificate',
            icon: ShieldCheck,
          },
          {
            title: 'Marriage Certificate',
            url: '/documents/marriage-certificate',
            icon: HeartHandshake,
          },
          {
            title: 'Resume & Bio-Data',
            url: '/documents/resume',
            icon: UserCheck,
          },
        ],
      },
    ],
  },
];
