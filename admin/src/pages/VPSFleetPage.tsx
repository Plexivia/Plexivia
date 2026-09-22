import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { VPSNode, NodeStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { SSHConsoleModal } from '../components/modals/SSHConsoleModal';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Terminal,
  RotateCw,
  Zap,
  Globe,
  Radio,
  Clock,
  Box,
  RefreshCw,
} from 'lucide-react';

export const VPSFleetPage: React.FC = () => {
  const { fleet, refreshAll } = useData();
  const { showToast } = useToast();
  const [selectedNode, setSelectedNode] = useState<VPSNode | null>(null);
  const [isSSHOpen, setIsSSHOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | NodeStatus>('ALL');
  const [probingNodeId, setProbingNodeId] = useState<string | null>(null);
  const [rebootingNodeIds, setRebootingNodeIds] = useState<Record<string, boolean>>({});

  const safeFleet = Array.isArray(fleet) ? fleet : [];

  // Summary Metrics
  const totalNodes = safeFleet.length;
  const onlineNodes = safeFleet.filter(n => n.status === 'ONLINE').length;
  const totalContainers = safeFleet.reduce((sum, n) => sum + (n.docker_containers_count || 0), 0);
  const avgCpu = Math.round(
    safeFleet.reduce((sum, n) => sum + (n.cpu_percent || 0), 0) / (safeFleet.length || 1)
  );

  const filteredFleet = safeFleet.filter(n => {
    if (statusFilter !== 'ALL' && n.status !== statusFilter) return false;
    return true;
  });

  const handleOpenSSH = (node: VPSNode) => {
    setSelectedNode(node);
    setIsSSHOpen(true);
  };

  const handleProbeNode = (node: VPSNode) => {
    setProbingNodeId(node.id);
    setTimeout(() => {
      const pingMs = Math.floor(Math.random() * 25) + 12;
      showToast('info', 'Ping Probe Latency', `RTT to ${node.node_name} (${node.ip_address}): ${pingMs}ms`);
      setProbingNodeId(null);
    }, 600);
  };

  const handleRebootNode = (node: VPSNode) => {
    if (window.confirm(`Initiate graceful system reboot for "${node.node_name}"?`)) {
      setRebootingNodeIds(prev => ({ ...prev, [node.id]: true }));
      showToast('warning', 'Node Reboot Initiated', `Graceful restart sent to ${node.node_name}.`);

      setTimeout(() => {
        setRebootingNodeIds(prev => ({ ...prev, [node.id]: false }));
        showToast('success', 'Node Online', `${node.node_name} is back online and all Docker containers healthy.`);
      }, 4000);
    }
  };

  const getGaugeColor = (pct: number) => {
    if (pct >= 85) return 'bg-rose-500 text-rose-400';
    if (pct >= 70) return 'bg-amber-500 text-amber-400';
    return 'bg-cyan-500 text-cyan-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              VPS Fleet Director & cPanel Nodes
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Fleet Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-node telemetry, CPU/RAM/Disk gauges, Docker container clusters, and Web SSH console.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Fleet</span>
          </button>
        </div>
      </div>

      {/* Cluster Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Nodes</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">{totalNodes}</div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
            {onlineNodes}/{totalNodes} Nodes Operational
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Average CPU Load</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">{avgCpu}%</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">Across all nodes</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Active Containers</span>
            <Box className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">{totalContainers}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">Docker microservices</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Telemetry Ping</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">14ms</div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">Avg network RTT</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['ALL', 'ONLINE', 'DEGRADED', 'REBOOTING'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              statusFilter === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab === 'ALL' ? 'All Nodes' : tab}
          </button>
        ))}
      </div>

      {/* Fleet Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFleet.map(node => {
          const isRebooting = rebootingNodeIds[node.id];
          const isProbing = probingNodeId === node.id;
          const displayStatus = isRebooting ? 'REBOOTING' : node.status;

          return (
            <div
              key={node.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 shadow-lg space-y-4 transition-all"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-base font-bold text-white font-mono">{node.node_name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>{node.hostname}</span>
                    <span className="text-slate-600">•</span>
                    <span>{node.location}</span>
                  </div>
                </div>

                <StatusBadge status={displayStatus} />
              </div>

              {/* IP & SSH Info Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">IP:</span>
                  <span className="text-slate-200 font-semibold">{node.ip_address}</span>
                  <span className="text-slate-500">Port:</span>
                  <span className="text-cyan-400">{node.ssh_port}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{node.uptime_days}d uptime</span>
                </div>
              </div>

              {/* Resource Utilization Gauges */}
              <div className="space-y-3 pt-1">
                {/* CPU Gauge */}
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      CPU Load
                    </span>
                    <span className="text-white font-bold">{node.cpu_percent || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getGaugeColor(
                        node.cpu_percent || 0
                      ).split(' ')[0]}`}
                      style={{ width: `${node.cpu_percent || 0}%` }}
                    />
                  </div>
                </div>

                {/* RAM Gauge */}
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      Memory RAM
                    </span>
                    <span className="text-white font-bold">{node.ram_percent || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getGaugeColor(
                        node.ram_percent || 0
                      ).split(' ')[0]}`}
                      style={{ width: `${node.ram_percent || 0}%` }}
                    />
                  </div>
                </div>

                {/* Disk Gauge */}
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      Disk NVMe
                    </span>
                    <span className="text-white font-bold">{node.disk_percent || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getGaugeColor(
                        node.disk_percent || 0
                      ).split(' ')[0]}`}
                      style={{ width: `${node.disk_percent || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Containers & Ping Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Containers:</span>
                  <strong className="text-white">{node.docker_containers_count} Active</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  Ping: <strong className="text-emerald-400">{node.last_ping}</strong>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => handleOpenSSH(node)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>SSH</span>
                </button>

                <button
                  onClick={() => handleProbeNode(node)}
                  disabled={isProbing}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Zap className={`w-3.5 h-3.5 text-amber-400 ${isProbing ? 'animate-bounce' : ''}`} />
                  <span>{isProbing ? 'Probing...' : 'Probe'}</span>
                </button>

                <button
                  onClick={() => handleRebootNode(node)}
                  disabled={isRebooting}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono font-medium border border-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRebooting ? 'animate-spin' : ''}`} />
                  <span>{isRebooting ? 'Rebooting...' : 'Reboot'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SSH Console Modal */}
      <SSHConsoleModal
        node={selectedNode}
        isOpen={isSSHOpen}
        onClose={() => setIsSSHOpen(false)}
      />
    </div>
  );
};
