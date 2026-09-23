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

export const AccountsPage: React.FC = () => {
  const { clients, users } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const totalMonthlyRetainers = useMemo(() => {
    return safeClients.reduce((acc, c) => acc + (c.monthly_retainer || 0), 0);
  }, [safeClients]);

  const totalMonthlyPayroll = useMemo(() => {
    return safeUsers.reduce((acc, u) => acc + ((u.hourly_rate || 0) * 160), 0);
  }, [safeUsers]);

  const netMonthlyCashflow = totalMonthlyRetainers - totalMonthlyPayroll;

  const filteredClients = useMemo(() => {
    return safeClients.filter(c => {
      const matchSearch =
        (c.business_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.client_key || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [safeClients, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
              Accounts & Financial Ledger
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Agency cashflow, monthly retainer revenue, payroll disbursement forecasts, and billing logs.
          </p>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-mono">
            <span>Monthly Runrate (MRR)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            ${totalMonthlyRetainers.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
            +{safeClients.length} active client retainers
          </span>
        </div>

        {/* Estimated Annual Revenue */}
        <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-cyan-700 dark:text-cyan-400 text-xs font-mono">
            <span>Forecasted ARR</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-300 font-mono">
            ${(totalMonthlyRetainers * 12).toLocaleString()}
          </div>
          <span className="text-[11px] text-cyan-600/70 dark:text-cyan-400/70 font-medium block">
            Annualized contract value
          </span>
        </div>

        {/* Payroll Expense */}
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-mono">
            <span>Est. Monthly Payroll</span>
            <Coins className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-300 font-mono">
            ${totalMonthlyPayroll.toLocaleString()}
          </div>
          <span className="text-[11px] text-purple-600/70 dark:text-purple-400/70 font-medium block">
            {safeUsers.length} team engineers & ops
          </span>
        </div>

        {/* Net Monthly Cashflow */}
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
            ${Math.abs(netMonthlyCashflow).toLocaleString()}
          </div>
          <span className={`text-[11px] font-medium block ${
            netMonthlyCashflow >= 0 ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-rose-600/70 dark:text-rose-400/70'
          }`}>
            {netMonthlyCashflow >= 0 ? 'Positive operational margin' : 'Deficit / expansion phase'}
          </span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search billing ledger by business name or slug..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Contracts</option>
            <option value="INACTIVE">Inactive Contracts</option>
          </select>
        </div>
      </div>

      {/* Client Accounts Billing Ledger Table */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Client Monthly Billing & Retainer Ledger
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Showing {filteredClients.length} accounts
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-theme">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Client / Business</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Architecture</th>
                <th className="p-3">Monthly Retainer</th>
                <th className="p-3">Annualized Value</th>
                <th className="p-3">Contract Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {client.business_name}
                  </td>
                  <td className="p-3 text-cyan-600 dark:text-cyan-400 font-mono">
                    @{client.client_key}
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">
                    {client.client_type === 'MULTI_TENANT_ECOMMERCE' ? 'Multi-Tenant' : 'Single-Tenant'}
                  </td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ${(client.monthly_retainer || 0).toLocaleString()} / mo
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-mono">
                    ${((client.monthly_retainer || 0) * 12).toLocaleString()} / yr
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      client.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                    }`}>
                      {client.status || 'ACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-mono text-xs">
                    No client accounts matching current search/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
