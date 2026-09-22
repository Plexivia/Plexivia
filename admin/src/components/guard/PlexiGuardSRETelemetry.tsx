import React from 'react';
import { Activity, Radio, Cpu, Server, Network, HardDrive, ShieldCheck, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { TelemetryPacket, AnomalyAlert, ContainerHealth } from '../../types';
import { AnomalyAlertsCard } from './AnomalyAlertsCard';
import { ContainerHealthMatrix } from './ContainerHealthMatrix';

interface PlexiGuardSRETelemetryProps {
  telemetry: TelemetryPacket;
  isWsConnected: boolean;
  anomalies: AnomalyAlert[];
  containers: ContainerHealth[];
  onAcknowledgeAlert: (id: string) => Promise<void>;
  onResolveAlert: (id: string) => Promise<void>;
}

export const PlexiGuardSRETelemetry: React.FC<PlexiGuardSRETelemetryProps> = ({
  telemetry,
  isWsConnected,
  anomalies,
  containers,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
  const safeCores = Array.isArray(telemetry?.cpu?.cores) ? telemetry.cpu.cores : [];
  const safeLoadAvg = Array.isArray(telemetry?.cpu?.loadAvg) ? telemetry.cpu.loadAvg : [0, 0, 0];
  const overallCpu = telemetry?.cpu?.overallUsage ?? 0;
  const ramUsage = telemetry?.ram?.usagePercent ?? 0;
  const diskUsage = telemetry?.disk?.diskUsagePercent ?? 0;

  return (
    <div className="space-y-6">
      {/* SRE Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/30 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                plexiGuard SRE Engine
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider font-mono flex items-center gap-1.5 ${
                isWsConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                {isWsConnected ? 'WebSocket Live Streaming (1000ms)' : 'Simulated Real-time Fallback'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Site Reliability Engineering Telemetry
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Real-time kernel metrics, multi-core CPU distribution, memory cache analysis, network packet throughput, and container anomaly detection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Master SRE Probe</div>
              <div className="text-sm font-bold text-emerald-400">14.128.14.223:5097</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Hardware Metrics HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Tile */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Overall CPU Load</span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">{overallCpu}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${overallCpu}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Load Avg: {safeLoadAvg.join(', ')}
          </div>
        </div>

        {/* RAM Tile */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>RAM Allocation</span>
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300">{ramUsage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${ramUsage}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Used: {telemetry?.ram?.usedGb ?? 0}G • Cache: {telemetry?.ram?.cachedGb ?? 0}G • Free: {telemetry?.ram?.freeGb ?? 0}G
          </div>
        </div>

        {/* Network Throughput Tile */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <Network className="w-4 h-4 text-emerald-400" />
              <span>Network I/O</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300">0.0% Loss</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            Rx: {(((telemetry?.network?.rxKbps ?? 0)) / 1024).toFixed(2)} MB/s • Tx: {(((telemetry?.network?.txKbps ?? 0)) / 1024).toFixed(2)} MB/s
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Active Sockets: {telemetry?.network?.activeConnections ?? 0}
          </div>
        </div>

        {/* NVMe Disk IOPS Tile */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Disk IOPS</span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">{diskUsage}%</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            Read: {telemetry?.disk?.readIops ?? 0} IOPS • Write: {telemetry?.disk?.writeIops ?? 0} IOPS
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Storage Pool: NVMe Gen4 Array
          </div>
        </div>
      </div>

      {/* 8-Core Dynamic CPU Load Distribution */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>8-Core Dynamic CPU Topology (Master Node: 14.128.14.223)</span>
          </h3>
          <span className="text-xs font-mono text-cyan-400">AMD EPYC™ 8-Core Dedicated</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {safeCores.map((usage, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center space-y-2">
              <div className="text-[11px] font-mono text-slate-400">Core #{idx}</div>
              <div className="h-24 bg-slate-900 rounded-lg p-1 flex items-end justify-center">
                <div
                  className={`w-full rounded-md transition-all duration-300 ${
                    usage > 75 ? 'bg-rose-500' : usage > 45 ? 'bg-amber-500' : 'bg-cyan-500'
                  }`}
                  style={{ height: `${Math.max(usage, 5)}%` }}
                />
              </div>
              <div className="text-xs font-mono font-bold text-white">{usage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* SRE Anomaly Alerts */}
      <AnomalyAlertsCard
        anomalies={anomalies}
        onAcknowledge={onAcknowledgeAlert}
        onResolve={onResolveAlert}
      />

      {/* Docker Containers Matrix */}
      <ContainerHealthMatrix
        containers={containers}
      />
    </div>
  );
};
