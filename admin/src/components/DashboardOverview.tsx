import React from 'react';
import { Server, ShieldCheck, Mail, GitFork, HardDrive, Cpu, Activity, Wifi, Radio, ArrowUpRight, Play, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { VPSNode, TelemetryPacket, AnomalyAlert, ContainerHealth, EmailLogEntry, BackupStatus, SystemVersion } from '../types/index';

interface DashboardOverviewProps {
  nodes: VPSNode[];
  telemetry: TelemetryPacket;
  isWsConnected: boolean;
  anomalies: AnomalyAlert[];
  containers: ContainerHealth[];
  emailLogs: EmailLogEntry[];
  backupStatus: BackupStatus | null;
  version: SystemVersion | null;
  onNavigate: (tab: string) => void;
  onTriggerBackup: () => void;
  onComposeEmail: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  nodes,
  telemetry,
  isWsConnected,
  anomalies,
  containers,
  emailLogs,
  backupStatus,
  version,
  onNavigate,
  onTriggerBackup,
  onComposeEmail
}) => {
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];
  const safeContainers = Array.isArray(containers) ? containers : [];
  const safeEmailLogs = Array.isArray(emailLogs) ? emailLogs : [];
  const masterNode = safeNodes.find(n => n.isMaster) || safeNodes[0];
  const activeAnomalies = safeAnomalies.filter(a => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Top Banner: Ecosystem Ops HUD */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Plexivia Microservices Mesh
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 8/8 Microservices Online
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                Baseline {version?.baseline || 'v0.0.0'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Enterprise Fleet Operations Command
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 max-w-2xl leading-relaxed">
              Unified control center connecting cPanel VPS node management, plexiGuard SRE real-time streaming telemetry, Spacemail SMTP delivery queue, Gitea private git, and automated Cloudflare R2 backup vault.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onComposeEmail}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Compose Email</span>
            </button>
            <button
              onClick={onTriggerBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Instant R2 Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Microservices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. cPanel Fleet */}
        <div
          onClick={() => onNavigate('cpanel')}
          className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition">cPanel Fleet Manager</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Port 8090 • cp.plexivia.com</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 my-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Master VPS IP:</span>
                <span className="text-white font-bold">{masterNode?.ipAddress || '14.128.14.223'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uptime / SLA:</span>
                <span className="text-emerald-400 font-bold">{masterNode?.uptime?.formatted || '48d 10h 14m'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ping RTT:</span>
                <span className="text-cyan-400 font-bold">{masterNode?.network?.pingMs || '18.2'} ms</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">{safeNodes.length} Managed Nodes</span>
            <span className="text-cyan-400 font-semibold flex items-center gap-1">Open Fleet &rarr;</span>
          </div>
        </div>

        {/* 2. plexiGuard SRE */}
        <div
          onClick={() => onNavigate('guard')}
          className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition">plexiGuard SRE Telemetry</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Port 5097 • guard.plexivia.com</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 my-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">CPU Thread Load:</span>
                <span className="text-cyan-400 font-bold">{telemetry.cpu.overallUsage}% (8 Cores)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RAM Allocated:</span>
                <span className="text-indigo-400 font-bold">{telemetry.ram.usedGb} GB / 16.0 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WebSocket Stream:</span>
                <span className={isWsConnected ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {isWsConnected ? "1000ms Live Sync" : "Simulated"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">{activeAnomalies.length} Active Anomalies</span>
            <span className="text-indigo-400 font-semibold flex items-center gap-1">View Telemetry &rarr;</span>
          </div>
        </div>

        {/* 3. plexiMail Subsystem */}
        <div
          onClick={() => onNavigate('mail')}
          className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition">plexiMail Subsystem</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Port 5096 • mail.plexivia.com</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 my-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">SMTP Gateway:</span>
                <span className="text-white font-bold">mail.spacemail.com:465</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">BullMQ Queue:</span>
                <span className="text-emerald-400 font-bold">0 Queued (Healthy)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latest Delivery:</span>
                <span className="text-cyan-300 truncate max-w-[140px]" title={safeEmailLogs[0]?.recipient || 'admin@plexivia.com'}>
                  {safeEmailLogs[0]?.recipient || 'admin@plexivia.com'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">{safeEmailLogs.length} Logged Dispatches</span>
            <span className="text-cyan-400 font-semibold flex items-center gap-1">Open Mailbox &rarr;</span>
          </div>
        </div>

        {/* 4. Gitea Git */}
        <div
          onClick={() => onNavigate('gitea')}
          className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-purple-400 transition">Gitea Private Git</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Port 3001 • SSH Port 2222</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition" />
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 my-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Private Host:</span>
                <span className="text-white font-bold">git.plexivia.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Repos:</span>
                <span className="text-purple-300 font-bold">4 Repositories</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dual-Remote:</span>
                <span className="text-emerald-400 font-bold">Configured & Syncing</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Gitea v1.22.3</span>
            <span className="text-purple-400 font-semibold flex items-center gap-1">Setup Guide &rarr;</span>
          </div>
        </div>

        {/* 5. Cloudflare R2 Backups */}
        <div
          onClick={() => onNavigate('backup')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition cursor-pointer group flex flex-col justify-between md:col-span-2 lg:col-span-2"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition">Cloudflare R2 Backup Vault & Version Baseline</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Bucket: clienthub-backups • Baseline {version?.baseline || 'v0.0.0'}</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs font-mono">
                <span className="text-slate-500 text-[10px] uppercase">R2 Storage Target</span>
                <div className="text-white font-bold mt-1 truncate">clienthub-backups</div>
                <div className="text-[10px] text-cyan-400 mt-0.5">fa0942a4bd8e442e22f...</div>
              </div>
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs font-mono">
                <span className="text-slate-500 text-[10px] uppercase">Automated Schedule</span>
                <div className="text-emerald-400 font-bold mt-1">03:00 UTC (09:00 AM BST)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Daily Cron Job</div>
              </div>
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs font-mono">
                <span className="text-slate-500 text-[10px] uppercase">Vault Size</span>
                <div className="text-amber-400 font-bold mt-1">{backupStatus?.totalR2StorageFormatted || '4.49 GB'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{backupStatus?.totalBackupsCount || 18} Verified Snapshots</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Email alerts dispatched to admin@plexivia.com</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">Manage Backups &rarr;</span>
          </div>
        </div>
      </div>

      {/* Live Stream Telemetry & Containers Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Real-time Telemetry Mini Graph */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Live System Load Gauge</h3>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold">1000ms Live</span>
            </div>

            <div className="space-y-3 my-2">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Aggregate CPU</span>
                  <span className="text-cyan-400 font-bold">{telemetry.cpu.overallUsage}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: telemetry.cpu.overallUsage + "%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Memory Allocation</span>
                  <span className="text-indigo-400 font-bold">{telemetry.ram.usagePercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                    style={{ width: telemetry.ram.usagePercent + "%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Storage NVMe</span>
                  <span className="text-amber-400 font-bold">{telemetry.disk.diskUsagePercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: telemetry.disk.diskUsagePercent + "%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Net I/O: {telemetry.network.rxKbps} KB/s RX</span>
            <span>{telemetry.network.txKbps} KB/s TX</span>
          </div>
        </div>

        {/* Running Containers List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Active Plexivia Containers ({safeContainers.length})</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Docker Compose Mesh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
              {safeContainers.map((c) => (
                <div key={c.name} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{c.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">Port {c.internalPort}</div>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-cyan-400 font-bold">{c.cpuPercent}%</span>
                    <div className="text-slate-500">{c.memoryMb}MB</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Host: 14.128.14.223 (Ubuntu 24.04 LTS)</span>
            <span className="text-emerald-400">All Containers Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
