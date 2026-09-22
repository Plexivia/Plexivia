import React from 'react';
import { Layers, CheckCircle2, AlertCircle, RefreshCw, Cpu, Server, Globe } from 'lucide-react';
import { ContainerHealth } from '../../types';

interface ContainerHealthMatrixProps {
  containers: ContainerHealth[];
}

export const ContainerHealthMatrix: React.FC<ContainerHealthMatrixProps> = ({ containers }) => {
  const safeContainers = Array.isArray(containers) ? containers : [];
  const healthyCount = safeContainers.filter(c => c.status === 'healthy').length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Master Container Health Matrix ({safeContainers.length} Services)</h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> {healthyCount}/{safeContainers.length} Healthy
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
              <th className="pb-3 font-semibold">Service Container</th>
              <th className="pb-3 font-semibold">Internal Port</th>
              <th className="pb-3 font-semibold">Ingress Routing</th>
              <th className="pb-3 font-semibold">CPU</th>
              <th className="pb-3 font-semibold">Memory (Alloc/Limit)</th>
              <th className="pb-3 font-semibold">Restarts</th>
              <th className="pb-3 font-semibold text-right">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {safeContainers.map((c) => (
              <tr key={c.name} className="hover:bg-slate-950/60 transition">
                <td className="py-3">
                  <div className="font-bold text-white text-xs">{c.name}</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">{c.responsibility}</div>
                </td>
                <td className="py-3 text-cyan-300 font-semibold">{c.internalPort}</td>
                <td className="py-3">
                  <div className="flex items-center gap-1 text-slate-300 text-[11px] truncate max-w-[200px]" title={c.ingressDomain}>
                    <Globe className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <span>{c.ingressDomain}</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1 text-slate-200">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>{c.cpuPercent}%</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1 text-slate-200">
                    <Server className="w-3 h-3 text-indigo-400" />
                    <span>{c.memoryMb} MB / {c.memoryLimitMb} MB</span>
                  </div>
                </td>
                <td className="py-3">
                  <span className={c.restarts === 0 ? 'text-slate-400' : 'text-amber-400 font-bold'}>
                    {c.restarts}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    c.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{c.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
