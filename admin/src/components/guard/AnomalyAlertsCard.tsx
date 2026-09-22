import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldCheck, Clock, Check } from 'lucide-react';
import { AnomalyAlert } from '../../types';

interface AnomalyAlertsCardProps {
  anomalies: AnomalyAlert[];
  onAcknowledge: (id: string) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
}

export const AnomalyAlertsCard: React.FC<AnomalyAlertsCardProps> = ({
  anomalies,
  onAcknowledge,
  onResolve
}) => {
  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white text-base">SRE Anomaly & Incident Stream</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {safeAnomalies.filter(a => !a.resolved).length} Active Alerts
        </span>
      </div>

      <div className="space-y-3">
        {safeAnomalies.length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-mono text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            No active anomalies detected across VPS cluster nodes.
          </div>
        ) : (
          safeAnomalies.map((alert) => {
            const isResolved = alert.resolved;
            const isAcknowledged = alert.acknowledged;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition ${
                  isResolved
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-cyan-950/20 border-cyan-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {alert.severity === 'CRITICAL' ? (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      ) : alert.severity === 'WARNING' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Info className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          alert.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {alert.severity}
                        </span>
                        <h4 className="font-semibold text-white text-xs">{alert.title}</h4>
                      </div>

                      <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 mt-2 flex-wrap">
                        <span>Node: <strong className="text-slate-200">{alert.nodeName}</strong></span>
                        <span>Source: <strong className="text-cyan-400">{alert.source}</strong></span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start">
                    {!isAcknowledged && !isResolved && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                      >
                        Ack
                      </button>
                    )}
                    {!isResolved ? (
                      <button
                        onClick={() => onResolve(alert.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Cleared
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
