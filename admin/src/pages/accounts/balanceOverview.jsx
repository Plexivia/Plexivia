import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  Receipt,
  CreditCard,
  Landmark,
  TrendingUp,
  Scale,
  Building,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  Calendar,
  Loader2,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/error-handler';
import { AssetFilter, ALL_ASSETS } from '@/components/dashboard/accounts/AssetFilter';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SELECT_CLASS =
  'h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer';

// Formats a numeric amount into BDT currency string
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `${num < 0 ? '−' : ''}৳${Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Formats a numeric value on the chart Y-axis into compact BDT string
const formatAxisAmount = (val) => `৳${Math.abs(val) >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`;

// Short month label (Jan, Feb...) from a YYYY-MM key
const shortMonth = (key) => MONTH_NAMES[Number(key.slice(5, 7)) - 1]?.slice(0, 3) || key;

// Renders custom tooltip card for the monthly chart
const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border bg-popover/95 p-3.5 text-popover-foreground shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[190px]">
      <div className="font-semibold text-foreground border-b pb-1.5 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
      </div>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-muted-foreground font-medium">{entry.name}:</span>
          </div>
          <span className="font-bold text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const TONES = {
  emerald: { card: 'to-emerald-500/5', glow: 'bg-emerald-500/10', icon: 'bg-emerald-500/10 text-emerald-600' },
  red: { card: 'to-red-500/5', glow: 'bg-red-500/10', icon: 'bg-red-500/10 text-red-600' },
  purple: { card: 'to-purple-500/5', glow: 'bg-purple-500/10', icon: 'bg-purple-500/10 text-purple-600' },
  blue: { card: 'to-blue-500/5', glow: 'bg-blue-500/10', icon: 'bg-blue-500/10 text-blue-600' },
};

// Renders one summary stat card
const StatCard = ({ title, value, icon: Icon, tone, footer, valueClass = 'text-foreground' }) => (
  <Card className={`border-border/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-card ${TONES[tone].card}`}>
    <div className={`absolute top-0 right-0 w-24 h-24 ${TONES[tone].glow} rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none`} />
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      <div className={`h-8 w-8 rounded-lg ${TONES[tone].icon} flex items-center justify-center`}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent className="space-y-1">
      <div className={`text-2xl font-bold tracking-tight ${valueClass}`}>{formatCurrency(value)}</div>
      <div className="flex items-center gap-1.5 text-xs font-medium">{footer}</div>
    </CardContent>
  </Card>
);

// Renders the monthly Account Balance page: received payments, paid bills, investments and cash balance
export const BalanceOverview = () => {
  const { t } = useTranslation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [asset, setAsset] = useState(ALL_ASSETS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Loads the 12-month balance breakdown for the selected year
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = asset === ALL_ASSETS ? { year } : { year, project: asset };
      const res = await apiClient.get('/api/v1/accounting/balance/monthly', { params });
      setData(res.data?.data || null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load account balance.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [year, asset]);

  useEffect(() => {
    load();
  }, [load]);

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const current = useMemo(
    () => data?.months?.find((m) => m.month === monthKey) || { received: 0, received_count: 0, bills: 0, bills_count: 0, investment: 0, investment_count: 0, cash_balance: 0, running_cash_balance: 0 },
    [data, monthKey]
  );
  const chartData = useMemo(
    () => (data?.months || []).map((m) => ({ label: shortMonth(m.month), received: m.received, bills: m.bills, investment: m.investment })),
    [data]
  );
  const yearOptions = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const cashBeforeInvestment = current.received - current.bills;

  return (
    <div className="page-container flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t('accounts.balance_overview_title', 'Account Balance')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Monthly cash position from received payments, paid bills and investments
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={SELECT_CLASS} aria-label="Month">
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={SELECT_CLASS} aria-label="Year">
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <AssetFilter value={asset} onChange={setAsset} />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Received"
          value={current.received}
          icon={CreditCard}
          tone="emerald"
          footer={
            <span className="flex items-center gap-1.5 text-emerald-600">
              <ArrowDownRight className="h-3.5 w-3.5" />
              {current.received_count} paid payment(s) in {MONTH_NAMES[month - 1]}
            </span>
          }
        />
        <StatCard
          title="Total Bills"
          value={current.bills}
          icon={Receipt}
          tone="red"
          footer={
            <span className="flex items-center gap-1.5 text-red-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {current.bills_count} paid bill(s) in {MONTH_NAMES[month - 1]}
            </span>
          }
        />
        <StatCard
          title="Total Investment"
          value={current.investment}
          icon={Landmark}
          tone="purple"
          footer={
            <span className="text-purple-600">
              {data?.investments_tracked === false ? 'Investments not recorded yet' : `${current.investment_count} investment(s)`}
            </span>
          }
        />
        <StatCard
          title="Total Cash Balance"
          value={current.cash_balance}
          icon={Wallet}
          tone="blue"
          valueClass={current.cash_balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
          footer={
            <>
              <Badge
                variant="outline"
                className={current.cash_balance >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-red-500/10 text-red-600 border-red-500/30'}
              >
                {current.cash_balance >= 0 ? t('accounts.surplus', 'Surplus') : t('accounts.deficit', 'Deficit')}
              </Badge>
              <span className="text-muted-foreground text-[11px]">Received − Bills + Investment</span>
            </>
          }
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <Card className="lg:col-span-5 border-border/70 shadow-sm bg-card overflow-hidden flex flex-col justify-between">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">{t('accounts.business_asset', 'Asset Evaluation')}</CardTitle>
                <CardDescription className="text-xs mt-0.5">{monthLabel} — only money actually received and paid is counted</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground font-medium">
                <span>1. Total Received (paid payments)</span>
                <span className="font-bold text-emerald-600 font-mono">+{formatCurrency(current.received)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground font-medium">
                <span>2. Total Bills (paid bills)</span>
                <span className="font-bold text-red-600 font-mono">−{formatCurrency(current.bills)}</span>
              </div>
              <div className="border-t border-border/60 pt-2 flex items-center justify-between font-semibold text-foreground">
                <span>= Operating Cash</span>
                <span className="font-mono">{formatCurrency(cashBeforeInvestment)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground font-medium">
                <span>3. Total Investment</span>
                <span className="font-bold text-purple-600 font-mono">+{formatCurrency(current.investment)}</span>
              </div>
              <div className="border-t border-border/60 pt-2 flex items-center justify-between font-semibold text-foreground">
                <span>= Total Cash Balance</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{formatCurrency(current.cash_balance)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-inner space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-primary" />
                  Cash in Hand (end of {MONTH_NAMES[month - 1]})
                </span>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                  Running
                </Badge>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-foreground font-mono">{formatCurrency(current.running_cash_balance)}</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Opening balance carried from earlier years plus every month's cash balance up to the selected month.
              </p>
            </div>

            {data?.investments_tracked === false && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Investments are not stored in the backend yet, so they count as ৳0 until the investments module is connected.</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
              <Link to="/accounts/bills" className="p-2 rounded-lg bg-muted/40 hover:bg-muted/80 text-[11px] font-semibold text-foreground transition-all flex flex-col items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-red-500" />
                <span>All Bills</span>
              </Link>
              <Link to="/accounts/payments" className="p-2 rounded-lg bg-muted/40 hover:bg-muted/80 text-[11px] font-semibold text-foreground transition-all flex flex-col items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                <span>All Payments</span>
              </Link>
              <Link to="/accounts/investments" className="p-2 rounded-lg bg-muted/40 hover:bg-muted/80 text-[11px] font-semibold text-foreground transition-all flex flex-col items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-purple-500" />
                <span>Investments</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 border-border/70 shadow-sm bg-card overflow-hidden flex flex-col">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Monthly Received vs Bills — {year}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">Paid payments received and paid bills, month by month</CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-6 flex-1 min-h-[360px] flex flex-col justify-center">
            {!loading && chartData.every((m) => !m.received && !m.bills && !m.investment) ? (
              <div className="h-[340px] flex flex-col items-center justify-center text-muted-foreground text-xs space-y-2">
                <Scale className="w-8 h-8 opacity-30" />
                <p>No paid payments or paid bills in {year}.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={formatAxisAmount} />
                  <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} />
                  <Bar dataKey="received" name="Received" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bills" name="Bills" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="investment" name="Investment" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Monthly Breakdown — {year}
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Opening balance: <span className="font-mono font-semibold text-foreground">{formatCurrency(data?.opening_balance)}</span>
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider border-b border-border/80">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Month</th>
                <th className="py-3 px-4 text-right font-semibold">Received</th>
                <th className="py-3 px-4 text-right font-semibold">Bills</th>
                <th className="py-3 px-4 text-right font-semibold">Investment</th>
                <th className="py-3 px-4 text-right font-semibold">Cash Balance</th>
                <th className="py-3 px-4 text-right font-semibold">Cash in Hand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(data?.months || []).map((m) => (
                <tr
                  key={m.month}
                  onClick={() => setMonth(Number(m.month.slice(5, 7)))}
                  className={`cursor-pointer transition-colors hover:bg-muted/40 ${m.month === monthKey ? 'bg-primary/5' : ''}`}
                >
                  <td className="py-2.5 px-4 font-semibold text-foreground">{MONTH_NAMES[Number(m.month.slice(5, 7)) - 1]}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-600">{formatCurrency(m.received)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-red-600">{formatCurrency(m.bills)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-purple-600">{formatCurrency(m.investment)}</td>
                  <td className={`py-2.5 px-4 text-right font-mono font-bold ${m.cash_balance >= 0 ? 'text-foreground' : 'text-red-600'}`}>{formatCurrency(m.cash_balance)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-blue-600 dark:text-blue-400">{formatCurrency(m.running_cash_balance)}</td>
                </tr>
              ))}
            </tbody>
            {data?.totals && (
              <tfoot className="border-t-2 border-border bg-muted/30 font-bold">
                <tr>
                  <td className="py-3 px-4 text-foreground">Total {year}</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600">{formatCurrency(data.totals.received)}</td>
                  <td className="py-3 px-4 text-right font-mono text-red-600">{formatCurrency(data.totals.bills)}</td>
                  <td className="py-3 px-4 text-right font-mono text-purple-600">{formatCurrency(data.totals.investment)}</td>
                  <td className="py-3 px-4 text-right font-mono text-foreground">{formatCurrency(data.totals.cash_balance)}</td>
                  <td className="py-3 px-4 text-right font-mono text-blue-600 dark:text-blue-400">{formatCurrency(data.closing_balance)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BalanceOverview;
