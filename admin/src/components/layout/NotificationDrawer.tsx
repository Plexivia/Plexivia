import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { X, Activity, Bell, Mail, CheckCheck, Wifi, WifiOff, BellRing } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';

// Short relative time for notification rows
const timeAgo = (value: string) => {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleDateString();
};

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { activities, services, backups } = useData();
  const safeServices = Array.isArray(services) ? services : [];
  const safeActivities = Array.isArray(activities) ? activities : [];
  const navigate = useNavigate();
  const { notifications, unreadCount, connected, markRead, markAllRead } = useNotificationStore();
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied');

  const openNotification = (id: string, link: string) => {
    markRead(id);
    if (link) {
      navigate(link);
      onClose();
    }
  };

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
          {/* Live notifications */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                {connected ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
                Notifications {unreadCount > 0 && <span className="text-cyan-300">({unreadCount} new)</span>}
              </span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300 hover:text-white cursor-pointer">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {permission === 'default' && (
              <button
                onClick={() => Notification.requestPermission().then(setPermission)}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-cyan-500/40 text-[11px] text-cyan-300 hover:bg-cyan-500/10 cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" /> Enable desktop alerts for new mail
              </button>
            )}

            {notifications.length === 0 ? (
              <div className="text-center py-4 text-slate-500 font-mono text-xs">No notifications yet.</div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n._id}
                  onClick={() => openNotification(n._id, n.link)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    n.isRead ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700' : 'bg-cyan-500/5 border-cyan-500/30 hover:border-cyan-500/60'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                    {n.type === 'webmail' ? <Mail className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${n.isRead ? 'text-slate-300' : 'text-white font-semibold'}`}>{n.title}</p>
                    {n.description && <p className="text-[11px] text-slate-400 truncate mt-0.5">{n.description}</p>}
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">{timeAgo(n.created_at)}</span>
                  </div>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>

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
