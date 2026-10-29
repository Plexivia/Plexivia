import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  Cpu,
  ExternalLink,
  GitCommitHorizontal,
  HardDrive,
  Layers,
  MemoryStick,
  Network,
  Server,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { HeaderTitle } from '@/components/common/HeaderTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const POLL_MS = 10_000;
const NETWORK_POINTS = 30;

const GB = 1024 ** 3;
const formatGb = (bytes) => (bytes / GB).toFixed(bytes / GB >= 10 ? 0 : 1);

// "12d 4h" style uptime
const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`;
};

// "3 min ago" style relative time
const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Bar colour by usage level
const usageTone = (percent) =>
  percent >= 85 ? 'bg-rose-500' : percent >= 65 ? 'bg-amber-500' : 'bg-emerald-500';

const Card = ({ title, icon: Icon, children, className = '', aside = null }) => (
  <section className={cn('rounded-xl border bg-card p-4 shadow-xs', className)}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {Icon && <Icon className="size-4 text-primary" />}
        {title}
      </h2>
      {aside}
    </div>
    {children}
  </section>
);

// One vital: big value, percent and a usage bar
const VitalCard = ({ title, icon, value, percent, detail }) => (
  <Card title={title} icon={icon}>
    <div className="flex items-end justify-between gap-2">
      <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
      {percent !== null && <span className="text-sm font-semibold tabular-nums text-muted-foreground">{percent}%</span>}
    </div>
    {percent !== null && (
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all duration-500', usageTone(percent))} style={{ width: `${percent}%` }} />
      </div>
    )}
    {detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
  </Card>
);

// Two-line sparkline: incoming solid, outgoing dashed
const NetworkChart = ({ points }) => {
  const width = 300;
  const height = 70;
  const max = Math.max(1, ...points.flatMap((p) => [p.in, p.out]));
  const line = (key) =>
    points
      .map((p, i) => {
        const x = points.length > 1 ? (i / (NETWORK_POINTS - 1)) * width : 0;
        const y = height - (p[key] / max) * (height - 6) - 3;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[70px] w-full text-primary" preserveAspectRatio="none" aria-hidden="true">
      {points.length > 1 && (
        <>
          <path d={line('in')} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d={line('out')} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" opacity="0.6" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  );
};

// Server Watch: live VPS vitals, deployments, control panel links and activity
export const CpanelPage = () => {
  const [vitals, setVitals] = useState(null);
  const [error, setError] = useState('');
  const [network, setNetwork] = useState([]);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/v1/hub/server/vitals');
      const v = data?.data;
      setVitals(v);
      setError('');
      if (v?.network) {
        setNetwork((prev) => [...prev, { in: v.network.inMbps, out: v.network.outMbps }].slice(-NETWORK_POINTS));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not reach the server.');
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [load]);

  const memPercent = vitals ? Math.round((vitals.memory.used / vitals.memory.total) * 100) : 0;
  const diskPercent = vitals?.disk ? Math.round((vitals.disk.used / vitals.disk.total) * 100) : null;
  const deployments = vitals?.deployments || [];

  return (
    <div className="space-y-5">
      <HeaderTitle icon={Server} title="Server Watch" onRefresh={load} />

      {/* Host line */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3">
        {vitals ? (
          <p className="text-sm text-foreground">
            <span className="font-semibold">{vitals.hostname}</span>
            <span className="text-muted-foreground"> · {vitals.osName} · up {formatUptime(vitals.uptimeSeconds)}</span>
          </p>
        ) : (
          <Skeleton className="h-4 w-64" />
        )}
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className={cn('size-2 rounded-full', error ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse')} />
          {error ? 'Offline' : vitals ? `Live, updated ${timeAgo(vitals.sampledAt)}` : 'Connecting...'}
        </span>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}

      {/* Server vitals */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {vitals ? (
          <>
            <VitalCard
              title="RAM"
              icon={MemoryStick}
              value={`${formatGb(vitals.memory.used)} / ${formatGb(vitals.memory.total)} GB`}
              percent={memPercent}
            />
            <VitalCard
              title="Disk (ROM)"
              icon={HardDrive}
              value={vitals.disk ? `${formatGb(vitals.disk.used)} / ${formatGb(vitals.disk.total)} GB` : '—'}
              percent={diskPercent}
            />
            <VitalCard
              title="CPU"
              icon={Cpu}
              value={`${vitals.cpu.cores} vCPU`}
              percent={vitals.cpu.percent}
            />
            <Card title="Network" icon={Network}>
              {vitals.network ? (
                <>
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {vitals.network.inMbps} <span className="text-sm font-medium text-muted-foreground">in</span> / {vitals.network.outMbps}{' '}
                    <span className="text-sm font-medium text-muted-foreground">out Mbps</span>
                  </p>
                  <NetworkChart points={network} />
                  <p className="text-xs text-muted-foreground">Solid: incoming. Dashed: outgoing.</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Network stats are only available on the Linux server.</p>
              )}
            </Card>
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[132px] rounded-xl" />)
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Deployments */}
        <Card
          title="Deployments"
          icon={GitCommitHorizontal}
          aside={vitals && <span className="text-xs text-muted-foreground">{vitals.deploymentsLast7Days} in the last 7 days</span>}
        >
          <p className="mb-3 text-xs text-muted-foreground">Every git pull on the VPS, newest first.</p>
          {deployments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{vitals ? 'No git pulls recorded yet.' : 'Loading...'}</p>
          ) : (
            <ul className="max-h-72 divide-y overflow-y-auto scrollbar-theme">
              {deployments.map((d) => (
                <li key={d.commit + d.date} className="flex items-start justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground" title={d.subject}>{d.subject}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {d.commit} · {d.action}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(d.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          {/* Queue */}
          <Card title="Queue" icon={Layers}>
            <p className="text-sm text-muted-foreground">No background job queue is set up on this server yet.</p>
          </Card>

          {/* Control panel */}
          <Card title="Control panel" icon={ExternalLink}>
            <p className="mb-3 text-xs text-muted-foreground">Shortcuts to cPanel or your hosting control panel.</p>
            {vitals?.controlPanels?.length ? (
              <div className="flex flex-wrap gap-2">
                {vitals.controlPanels.map((panel) => (
                  <a
                    key={panel.url}
                    href={panel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    {panel.name}
                    <ExternalLink className="size-3.5" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No links yet. Add <code className="rounded bg-muted px-1 font-mono text-xs">CONTROL_PANEL_LINKS</code> to the backend .env.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Activity */}
      <Card title="Activity" icon={Activity}>
        <p className="mb-3 text-xs text-muted-foreground">Deployments as they happen.</p>
        {deployments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {deployments.slice(0, 8).map((d) => (
              <li key={`act-${d.commit}-${d.date}`} className="flex items-center gap-3 text-sm">
                <span className="size-2 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  Deployed <span className="font-mono text-xs">{d.commit}</span> — {d.subject}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(d.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default CpanelPage;
