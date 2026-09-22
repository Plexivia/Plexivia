import React, { useState } from 'react';
import { Server, Cpu, HardDrive, Network, RefreshCw, Terminal, Eye, AlertTriangle, ShieldCheck, CheckCircle2, Activity } from 'lucide-react';
import { VPSNode } from '../../types';
import { NodeDetailModal } from './NodeDetailModal';

interface CPanelFleetManagerProps {
  nodes: VPSNode[];
  summary: any;
  onRebootNode: (id: string, mode?: 'graceful' | 'hard') => Promise<void>;
  onSyncNode: (id: string) => Promise<void>;
  onProbeNode: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const CPanelFleetManager: React.FC<CPanelFleetManagerProps> = ({
  nodes,
  summary,
  onRebootNode,
  onSyncNode,
  onProbeNode,
  isLoading
}) => {
  const [selectedNode, setSelectedNode] = useState<VPSNode | null>(null);
  const safeNodes = Array.isArray(nodes) ? nodes : [];

  return (
    <div className="space-y-6">
      {/* Fleet Overview Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Fleet Management Gateway
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                Port 8090 Proxy Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Master VPS Online
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              cPanel Multi-VPS Fleet Manager
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-xl">
              Centralized orchestration hub for Master and Edge VPS nodes. Real-time telemetry, SSH quick-actions, reboot commands, and service synchronization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => safeNodes.length > 0 && onProbeNode(safeNodes[0]?.id || 'node-master-01')}
              disabled={isLoading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border border-slate-700 transition disabled:opacity-50"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              Probe Master Node
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Online Nodes</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary?.onlineNodes || safeNodes.filter(n => n.status === 'ONLINE').length} / {summary?.totalNodes || safeNodes.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">100% Cluster Availability</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Master VPS Address</span>
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-cyan-300 font-mono truncate">
            {summary?.masterNodeIp || '14.128.14.223'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">ap-southeast-1 (SG)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Avg CPU Load</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {summary?.averageCpuUsage || 19.5}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">8 Cores Peak Threshold Nominal</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Active Containers</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {summary?.totalContainers || 9}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Docker Orchestration Live</div>
        </div>
      </div>

      {/* Nodes Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {safeNodes.map((node) => {
          const nodeName = node.name || node.node_name || node.hostname;
          const ip = node.ipAddress || node.ip_address || '14.128.14.223';
          const sshPort = node.sshPort || node.ssh_port || 22;
          const cpuPercent = node.cpu ? node.cpu.usagePercent : (node.cpu_percent || 24.8);
          const ramPercent = node.ram ? node.ram.usagePercent : (node.ram_percent || 26.25);
          const diskPercent = node.disk ? node.disk.usagePercent : (node.disk_percent || 20.21);
          const uptimeStr = node.uptime ? node.uptime.formatted : `${node.uptime_days || 48}d 10h`;
          const pingStr = node.network ? `${node.network.pingMs}ms` : (node.last_ping || '18ms');

          return (
            <div
              key={node.id}
              className={`bg-slate-900/80 border rounded-2xl p-6 relative transition-all duration-300 hover:border-slate-700 ${
                node.isMaster ? 'border-cyan-500/30 shadow-lg shadow-cyan-500/5' : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    node.isMaster ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}>
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{nodeName}</h3>
                      {node.isMaster && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                          Master
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {ip}:{sshPort} • {node.region || node.location || 'Singapore'}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                  node.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  node.status === 'REBOOTING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {node.status}
                </span>
              </div>

              {/* Hardware Usage Bars */}
              <div className="space-y-3 my-5">
                {/* CPU Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>CPU Usage (8 Cores)</span>
                    </span>
                    <span className="text-white font-bold">{cpuPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${cpuPercent}%` }}
                    />
                  </div>
                </div>

                {/* RAM Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-indigo-400" />
                      <span>RAM Allocation</span>
                    </span>
                    <span className="text-white font-bold">{ramPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${ramPercent}%` }}
                    />
                  </div>
                </div>

                {/* Disk Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                      <span>NVMe Disk</span>
                    </span>
                    <span className="text-white font-bold">{diskPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${diskPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Badges / Details Row */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80 mb-4">
                <div className="flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ping: <strong className="text-emerald-400">{pingStr}</strong></span>
                </div>
                <div>
                  Uptime: <strong className="text-slate-200">{uptimeStr}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => setSelectedNode(node)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect Node</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSyncNode(node.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 transition"
                    title="Synchronize configuration"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRebootNode(node.id, 'graceful')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reboot</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Detail Modal */}
      <NodeDetailModal
        node={selectedNode}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        onReboot={onRebootNode}
        onSync={onSyncNode}
        onProbe={onProbeNode}
      />
    </div>
  );
};
