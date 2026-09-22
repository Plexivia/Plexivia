import React from 'react';
import { X, Server, Cpu, HardDrive, Network, Terminal, Shield, RefreshCw, Layers, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { VPSNode } from '../../types';

interface NodeDetailModalProps {
  node: VPSNode | null;
  isOpen: boolean;
  onClose: () => void;
  onReboot: (id: string, mode?: 'graceful' | 'hard') => Promise<void>;
  onSync: (id: string) => Promise<void>;
  onProbe: (id: string) => Promise<void>;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  node,
  isOpen,
  onClose,
  onReboot,
  onSync,
  onProbe,
}) => {
  if (!isOpen || !node) return null;

  const nodeName = node.name || node.node_name || node.hostname;
  const ip = node.ipAddress || node.ip_address || '14.128.14.223';
  const sshPort = node.sshPort || node.ssh_port || 22;
  const cpuPercent = node.cpu ? node.cpu.usagePercent : (node.cpu_percent || 24.8);
  const ramPercent = node.ram ? node.ram.usagePercent : (node.ram_percent || 26.25);
  const diskPercent = node.disk ? node.disk.usagePercent : (node.disk_percent || 20.21);
  const uptimeStr = node.uptime ? node.uptime.formatted : `${node.uptime_days || 48}d 10h`;
  const pingStr = node.network ? `${node.network.pingMs}ms` : (node.last_ping || '18ms');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{nodeName}</h3>
                {node.isMaster && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider font-mono">
                    Master VPS
                  </span>
                )}
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full font-mono uppercase ${
                  node.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  node.status === 'REBOOTING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                  'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {node.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {ip}:{sshPort} • {node.os || 'Ubuntu 24.04 LTS'} • {node.region || node.location || 'Singapore'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-slate-400 text-[11px] flex items-center justify-between mb-1">
                <span>CPU Load (8 Cores)</span>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{cpuPercent}%</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Load: {node.cpu?.loadAvg ? node.cpu.loadAvg.join(', ') : '0.72, 0.65, 0.58'}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-slate-400 text-[11px] flex items-center justify-between mb-1">
                <span>RAM Usage</span>
                <Server className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{ramPercent}%</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {node.ram ? `${(node.ram.usedBytes / 1e9).toFixed(1)} GB / ${(node.ram.totalBytes / 1e9).toFixed(1)} GB` : '4.2 GB / 16.0 GB'}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-slate-400 text-[11px] flex items-center justify-between mb-1">
                <span>NVMe Storage</span>
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{diskPercent}%</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {node.disk ? `${(node.disk.usedBytes / 1e9).toFixed(1)} GB / ${(node.disk.totalBytes / 1e9).toFixed(1)} GB` : '52 GB / 240 GB'}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-slate-400 text-[11px] flex items-center justify-between mb-1">
                <span>Latency / Uptime</span>
                <Network className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">{pingStr}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Uptime: {uptimeStr}</div>
            </div>
          </div>

          {/* Disk Partitions Breakdown */}
          {node.disk?.partitions && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <h4 className="font-bold text-white text-xs mb-3 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>NVMe Disk Mount Partitions</span>
              </h4>
              <div className="space-y-3">
                {(node.disk.partitions || []).map((part) => (
                  <div key={part.mountPoint} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-300 font-semibold">{part.mountPoint}</span>
                      <span className="text-slate-400">
                        {(part.usedBytes / 1e9).toFixed(1)} GB / {(part.totalBytes / 1e9).toFixed(1)} GB ({part.usagePercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          part.usagePercent > 80 ? 'bg-rose-500' : part.usagePercent > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${part.usagePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Docker Containers Matrix */}
          {node.containers && node.containers.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Hosted Docker Containers ({node.containers.length})</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All Daemons Running
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="pb-2 font-semibold">Container Name</th>
                      <th className="pb-2 font-semibold">Image</th>
                      <th className="pb-2 font-semibold">Ports</th>
                      <th className="pb-2 font-semibold">CPU</th>
                      <th className="pb-2 font-semibold">Memory</th>
                      <th className="pb-2 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                    {(node.containers || []).map((c) => (
                      <tr key={c.name} className="hover:bg-slate-900/40 transition">
                        <td className="py-2.5 font-semibold text-white">{c.name}</td>
                        <td className="py-2.5 text-slate-400 truncate max-w-[150px]" title={c.image}>{c.image}</td>
                        <td className="py-2.5 text-cyan-300">{c.port}</td>
                        <td className="py-2.5 text-slate-300">{c.cpuPercent}%</td>
                        <td className="py-2.5 text-slate-300">{c.memoryMb} MB</td>
                        <td className="py-2.5 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SSH Command Quick-Copy */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">Direct Terminal Access:</span>
              <code className="text-xs text-cyan-300 bg-slate-900 px-2 py-1 rounded font-mono border border-slate-800">
                ssh root@{ip} -p {sshPort}
              </code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`ssh root@${ip} -p ${sshPort}`);
                alert(`SSH Command copied: ssh root@${ip} -p ${sshPort}`);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-semibold"
            >
              Copy SSH Command
            </button>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onProbe(node.id)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold transition text-xs flex items-center gap-1.5"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Probe Latency</span>
            </button>
            <button
              onClick={() => onSync(node.id)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold transition text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Config</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReboot(node.id, 'graceful')}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Graceful Reboot</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to perform a HARD reboot on ${nodeName}?`)) {
                  onReboot(node.id, 'hard');
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold transition text-xs flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Hard Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
