import { HeaderTitle } from '@/components/common/HeaderTitle';
import { UnifiedDataTable, DataTableColumnHeader } from '@/components/ui/unified-table';
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  Building,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Coins
} from 'lucide-react';

// Render accounts and financial ledger page with BDT retainer and payroll metrics
export const AccountsPage: React.FC = () => {
  const { clients, users, refreshAll } = useData();

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const totalMonthlyRetainers = useMemo(() => {
    return safeClients.reduce((acc, c) => acc + (c.monthly_retainer || 0), 0);
  }, [safeClients]);

  const totalMonthlyPayroll = useMemo(() => {
    return safeUsers.reduce((acc, u) => acc + ((u.hourly_rate || 0) * 160), 0);
  }, [safeUsers]);

  const netMonthlyCashflow = totalMonthlyRetainers - totalMonthlyPayroll;

  const columns = [
    {
      id: 'business',
      accessorFn: (c: any) => `${c.business_name || ''} ${c.client_key || ''}`,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Client / Business" />,
      cell: ({ row }: any) => <span className="font-bold text-foreground">{row.original.business_name}</span>,
    },
    {
      accessorKey: 'client_key',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Slug" />,
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-primary">@{getValue()}</span>,
    },
    {
      accessorKey: 'client_type',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Architecture" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ getValue }: any) => <span className="text-muted-foreground">{getValue() === 'MULTI_TENANT_ECOMMERCE' ? 'Multi-Tenant' : 'Single-Tenant'}</span>,
    },
    {
      accessorKey: 'monthly_retainer',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Monthly Retainer (BDT)" />,
      cell: ({ getValue }: any) => (
        <span className="font-mono text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">৳{Number(getValue() || 0).toLocaleString('en-BD')} / mo</span>
      ),
    },
    {
      id: 'annual',
      accessorFn: (c: any) => (c.monthly_retainer || 0) * 12,
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Annualized Value (BDT)" />,
      cell: ({ getValue }: any) => <span className="font-mono text-xs tabular-nums text-foreground">৳{Number(getValue()).toLocaleString('en-BD')} / yr</span>,
    },
    {
      id: 'status',
      accessorFn: (c: any) => c.status || 'ACTIVE',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Contract Status" />,
      filterFn: 'arrIncludesSome' as const,
      cell: ({ getValue }: any) => (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
          getValue() === 'ACTIVE'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'border-slate-500/30 bg-slate-500/10 text-muted-foreground'
        }`}>
          {getValue()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <HeaderTitle
        icon={Wallet}
        title="Accounts & Financial Ledger"
        onRefresh={refreshAll}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Monthly Runrate (MRR)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            ৳{totalMonthlyRetainers.toLocaleString('en-BD')}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
            +{safeClients.length} active client retainers
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-cyan-700 dark:text-cyan-400 text-xs font-mono">
            <span>Forecasted ARR</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-300 font-mono">
            ৳{(totalMonthlyRetainers * 12).toLocaleString('en-BD')}
          </div>
          <span className="text-[11px] text-cyan-600/70 dark:text-cyan-400/70 font-medium block">
            Annualized contract value
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-mono">
            <span>Est. Monthly Payroll</span>
            <Coins className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-300 font-mono">
            ৳{totalMonthlyPayroll.toLocaleString('en-BD')}
          </div>
          <span className="text-[11px] text-purple-600/70 dark:text-purple-400/70 font-medium block">
            {safeUsers.length} team engineers & ops
          </span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs space-y-2 ${
          netMonthlyCashflow >= 0
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/20'
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/20'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={netMonthlyCashflow >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
              Est. Net Monthly Flow
            </span>
            {netMonthlyCashflow >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className={`text-2xl font-bold font-mono ${
            netMonthlyCashflow >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
          }`}>
            ৳{Math.abs(netMonthlyCashflow).toLocaleString('en-BD')}
          </div>
          <span className={`text-[11px] font-medium block ${
            netMonthlyCashflow >= 0 ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-rose-600/70 dark:text-rose-400/70'
          }`}>
            {netMonthlyCashflow >= 0 ? 'Positive operational margin' : 'Deficit / expansion phase'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Receipt className="size-4 text-primary" />
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
          Client Monthly Billing & Retainer Ledger (BDT)
        </h3>
      </div>

      <UnifiedDataTable
        columns={columns}
        data={safeClients}
        searchPlaceholder="Search billing ledger by business name or slug..."
        facetedFilters={[
          {
            columnId: 'client_type',
            title: 'Architecture',
            options: [
              { label: 'Multi-Tenant', value: 'MULTI_TENANT_ECOMMERCE' },
              { label: 'Single-Tenant', value: 'SINGLE_TENANT' },
            ],
          },
          {
            columnId: 'status',
            title: 'Contract Status',
            options: [
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ],
          },
        ]}
        exportFilename="billing-ledger"
        emptyTitle="No client accounts found"
      />
    </div>
  );
};

export default AccountsPage;
