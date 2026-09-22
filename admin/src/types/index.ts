export * from '../types';
export * from './auth';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface MenuItem {
  title?: string;
  name?: string;
  label?: string;
  titleBn?: string;
  nameBn?: string;
  url?: string;
  path?: string;
  href?: string;
  icon?: any;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  items?: MenuItem[];
  childItems?: MenuItem[];
  roles?: string[];
  excludeRoles?: string[];
}

export interface MenuGroup {
  label?: string;
  groupLabel?: string;
  labelBn?: string;
  groupLabelBn?: string;
  items: MenuItem[];
  roles?: string[];
  excludeRoles?: string[];
}
