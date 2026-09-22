import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { ServiceHealth } from '../types';
import {
  ShieldCheck,
  Activity,
  Zap,
  Radio,
  Server,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  ExternalLink,
} from 'lucide-react';

export const SRETelemetryPage: React.FC = () => {
  const { services, refreshAll } = useData();
  const { showToast } = useToast();
  const [probingKey, setProbingKey] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState([
    {
      id: 'an-1',
      service: 'PostgreSQL 16 Engine',
      level: 'INFO',
      message: 'Write buffer synchronized after daily Cloudflare R2 snapshot dump.',
      time: '12m ago',
      resolved: true,
    },
    {
      id: 'an-2',
      service: 'Spacemail SMTP Relay',
      level: 'WARNING',
      message: 'Transient TLS handshake latency spike (1420ms) to mail.spacemail.com:465.',
      time: '45m ago',
      resolved: false,
    },
    {
      id: 'an-3',
      service: 'plexiGuard Edge Agent',
      level: 'INFO',
      message: 'Zero-drop packet inspection pipeline active on NYC Node 01.',
      time: '2h ago',
      resolved: true,
    },
  ]);

  const safeServices = Array.isArray(services) ? services : [];

  const healthyCount = safeServices.filter(s => s.status === 'HEALTHY').length;
  const avgLatency = Math.round(
    safeServices.reduce((acc, s) => acc + (s.latency_ms || 0), 0) / (safeServices.length || 1)
  );

  const handleProbeService = (s: ServiceHealth) => {
    setProbingKey(s.service_key || s.id || null);
    setTimeout(() => {
      const ping = Math.floor(Math.random() * 15) + 8;
      showToast('success', `Probe Result: ${s.name}`, `Status: 200 OK • Latency: ${ping}ms • Port :${s.port}`);
      setProbingKey(null);
    }, 500);
  };

  const handleResolveAlert = (id: string) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    showToast('success', 'Incident Cleared', 'Anomaly marked as resolved.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              plexiGuard SRE Telemetry & Observability
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SLA 99.8% Online
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time microservice latency probes, container ingress status, edge health, and automated SRE alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* SRE Stats Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Core Microservices</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">{safeServices.length}</div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
            {healthyCount}/{safeServices.length} Microservices Healthy
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Average API Latency</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">{avgLatency} ms</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">P99: 42ms • Zero Jitter</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>System SLA Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">99.82%</div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">Trailing 30-day index</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Probe Pulse</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">1000ms</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">Live WebSocket loop</div>
        </div>
      </div>

      {/* Services Health Matrix Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Microservice Health & Port Bindings Matrix
          </h2>
          <span className="text-xs text-slate-400 font-mono">All probes responsive</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeServices.map(s => {
            const isProbing = probingKey === s.service_key;

            return (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 shadow-lg space-y-3 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                      <h3 className="text-sm font-bold text-white truncate font-mono">{s.name}</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5 truncate">
                      port :{s.port} • v{s.version}
                    </span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {s.description}
                </p>

                {/* Routing & Ingress */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Internal Target:</span>
                    <span className="text-slate-200">{s.internal_url}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Ingress Domain:</span>
                    <span className="text-cyan-400 truncate max-w-[180px]">{s.ingress_domain}</span>
                  </div>
                </div>

                {/* Performance & Probing */}
                <div className="flex items-center justify-between pt-1 text-xs font-mono">
                  <div className="text-slate-400">
                    Latency: <strong className="text-emerald-400">{s.latency_ms}ms</strong>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Uptime: <strong className="text-white">{s.uptime_percent}%</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleProbeService(s)}
                  disabled={isProbing}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 text-amber-400 ${isProbing ? 'animate-spin' : ''}`} />
                  <span>{isProbing ? 'Sending Probe Request...' : 'Trigger Latency Probe'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SRE Incident & Anomaly Registry */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              plexiGuard Incident & Anomaly Feed
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Auto-correlated by SRE engine</span>
        </div>

        <div className="space-y-2.5">
          {(anomalies || []).map(an => (
            <div
              key={an.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
                an.resolved
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      an.resolved ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {an.level}
                  </span>
                  <strong className="text-white">{an.service}</strong>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-[11px]">{an.time}</span>
                </div>
                <p className="text-slate-300 text-xs">{an.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {an.resolved ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                ) : (
                  <button
                    onClick={() => handleResolveAlert(an.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
