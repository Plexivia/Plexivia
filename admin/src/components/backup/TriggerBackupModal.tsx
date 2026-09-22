import React, { useState, useEffect } from 'react';
import { X, HardDrive, Database, Cloud, Mail, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface TriggerBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrigger: () => Promise<void>;
  isTriggering: boolean;
}

export const TriggerBackupModal: React.FC<TriggerBackupModalProps> = ({
  isOpen,
  onClose,
  onTrigger,
  isTriggering
}) => {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (isTriggering) {
      setStep(1);
      timer = setTimeout(() => {
        setStep(2);
        timer = setTimeout(() => {
          setStep(3);
          timer = setTimeout(() => {
            setStep(4);
          }, 1000);
        }, 1200);
      }, 1000);
    } else {
      setStep(0);
    }
    return () => clearTimeout(timer);
  }, [isTriggering]);

  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Dumping PostgreSQL Database', desc: 'Executing pg_dump -U plexi_admin -d plexihub_db', icon: Database },
    { num: 2, title: 'Gzip Compression & SHA256 Hashing', desc: 'Compressing SQL archive and computing checksum', icon: ShieldCheck },
    { num: 3, title: 'Streaming to Cloudflare R2 Bucket', desc: 'S3 API Multipart Upload to bucket clienthub-backups', icon: Cloud },
    { num: 4, title: 'Spacemail Report Dispatch', desc: 'Sent automated confirmation email to admin@plexivia.com', icon: Mail }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Trigger Instant Cloudflare R2 Backup</h3>
              <p className="text-xs text-slate-400 font-mono">
                Bucket: <span className="text-cyan-400 font-semibold">clienthub-backups</span> • Account: fa0942a4bd8e442e22f78fdb6a2a605a
              </p>
            </div>
          </div>
          {!isTriggering && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs">
          {!isTriggering && step === 0 ? (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-300 leading-relaxed text-xs">
                  This action will manually execute the complete backup pipeline defined in make -C /opt/Plexivia backup:
                </p>
                <ul className="mt-3 space-y-2 text-slate-400 font-mono text-[11px]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>1. Live dump of PostgreSQL database (plexihub_db)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>2. Tar Gzip compression with SHA256 integrity calculation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>3. Dual upload: Local 7-day disk cache + Cloudflare R2 bucket (clienthub-backups)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>4. Spacemail email dispatch with download link to admin@plexivia.com</span>
                  </li>
                </ul>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3.5 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className="text-cyan-300 text-xs">
                  Zero-downtime execution: database read transactions will not be blocked during the snapshot.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="text-center mb-6">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">Executing Cloudflare R2 Backup Pipeline...</h4>
                <p className="text-slate-400 font-mono text-xs">Connecting to VPS Host 14.128.14.223</p>
              </div>

              <div className="space-y-3">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const isDone = step > s.num || step === 4;
                  const isCurrent = step === s.num;

                  return (
                    <div
                      key={s.num}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${isDone
                          ? 'bg-slate-950/80 border-emerald-500/30'
                          : isCurrent
                            ? 'bg-slate-950/90 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                            : 'bg-slate-950/30 border-slate-800/60 opacity-40'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                          }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white text-xs">{s.title}</h5>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{s.desc}</p>
                        </div>
                      </div>

                      <div>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isTriggering}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition text-xs disabled:opacity-50"
          >
            Cancel
          </button>

          {!isTriggering && (
            <button
              onClick={onTrigger}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold transition shadow-lg shadow-cyan-500/20 text-xs active:scale-95"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Start Cloudflare R2 Backup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
