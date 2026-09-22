import React from 'react';
import { useData } from '../../context/DataContext';
import { X, Activity, CheckCircle2, ShieldCheck, Database, HardDrive, Bell } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { activities, services, backups } = useData();
  const safeServices = Array.isArray(services) ? services : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
              Live System Telemetry & Logs
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick SRE Status banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
              Core Microservices
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {safeServices.slice(0, 4).map(srv => (
                <div key={srv.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-300 font-mono text-[11px] truncate">{srv.service_key}</span>
                  <span className="text-emerald-400 font-bold font-mono text-[10px]">{srv.latency_ms}ms</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 font-mono">
              Operator Events Feed
            </span>

            {safeActivities.length === 0 ? (
              <div className="text-center py-6 text-slate-500 font-mono text-xs">
                No recent activity logs.
              </div>
            ) : (
              safeActivities.map(act => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200">
                      <strong className="text-white font-medium">{act.user_name}</strong>{' '}
                      {act.action}:{' '}
                      <span className="text-cyan-300 font-mono">{act.target_name}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
