import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Timer,
  Users,
  Server,
  Activity,
  Mail,
  GitBranch,
  Archive,
  FileText,
  Settings,
  FileCheck,
  CreditCard,
  Banknote,
  ReceiptText,
  Receipt,
  Coins,
  Award,
  ShieldCheck,
  HeartHandshake,
  Medal,
  UserCheck,
  CheckSquare,
  BookOpen,
  Globe,
  UserPlus,
} from 'lucide-react';
import type { MenuGroup } from '@/types';

export const NAVIGATION_MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Agency Operations',
    items: [
      {
        title: 'Overview',
        url: '/',
        icon: LayoutDashboard,
      },
      {
        title: 'Projects & Tasks',
        url: '/projects',
        icon: FolderKanban,
      },
      {
        title: 'Clients Directory',
        url: '/clients',
        icon: Building2,
      },
      {
        title: 'Time Tracker',
        url: '/timer',
        icon: Timer,
      },
      {
        title: 'Agency Team',
        url: '/team',
        icon: Users,
      },
    ],
  },
  {
    label: 'Infrastructure & SRE',
    items: [
      {
        title: 'VPS Fleet',
        url: '/fleet',
        icon: Server,
        badge: 'Fleet',
        badgeVariant: 'default',
      },
      {
        title: 'SRE Telemetry',
        url: '/sre',
        icon: Activity,
      },
      {
        title: 'Mail Subsystem',
        url: '/mail',
        icon: Mail,
      },
      {
        title: 'Private Git & CI',
        url: '/git',
        icon: GitBranch,
      },
      {
        title: 'Backups & Storage',
        url: '/backups',
        icon: Archive,
      },
    ],
  },
  {
    label: 'Tools & Studio',
    items: [
      {
        title: 'Document Studio',
        url: '/documents',
        icon: FileText,
        badge: '15 Tools',
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
            title: 'Tax Invoice',
            url: '/documents/invoice',
            icon: ReceiptText,
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
            title: 'General Certificate',
            url: '/documents/certificate',
            icon: Medal,
          },
          {
            title: 'Resume & Bio-Data',
            url: '/documents/resume',
            icon: UserCheck,
          },
          {
            title: 'Job Verification',
            url: '/documents/job-verification',
            icon: CheckSquare,
          },
          {
            title: 'Passport Submission',
            url: '/documents/passport',
            icon: BookOpen,
          },
          {
            title: 'Indian Visa Application',
            url: '/documents/indian-visa',
            icon: Globe,
          },
          {
            title: 'Client & Guardian Form',
            url: '/documents/client-form',
            icon: UserPlus,
          },
        ],
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
      },
    ],
  },
];

