import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const safeToasts = Array.isArray(toasts) ? toasts : [];
  if (!safeToasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {safeToasts.map((toast) => {
        let Icon = Info;
        let borderCls = 'border-slate-700 bg-slate-900/95';
        let iconCls = 'text-cyan-400';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderCls = 'border-emerald-500/40 bg-slate-900/95 shadow-emerald-500/10 shadow-lg';
          iconCls = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderCls = 'border-amber-500/40 bg-slate-900/95 shadow-amber-500/10 shadow-lg';
          iconCls = 'text-amber-400';
        } else if (toast.type === 'error') {
          Icon = XCircle;
          borderCls = 'border-rose-500/40 bg-slate-900/95 shadow-rose-500/10 shadow-lg';
          iconCls = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${borderCls} backdrop-blur-md text-slate-100 transition animate-in fade-in slide-in-from-bottom-3`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconCls}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white tracking-tight">{toast.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
