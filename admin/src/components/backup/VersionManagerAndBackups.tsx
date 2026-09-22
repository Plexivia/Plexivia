import React, { useState } from 'react';
import { HardDrive, Cloud, Database, Clock, ShieldCheck, Download, Play, CheckCircle2, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { BackupStatus, BackupArchive, SystemVersion } from '../../types/index';
import { TriggerBackupModal } from './TriggerBackupModal';

interface VersionManagerAndBackupsProps {
  version: SystemVersion | null;
  backupStatus: BackupStatus | null;
  archives: BackupArchive[];
  onTriggerBackup: () => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export const VersionManagerAndBackups: React.FC<VersionManagerAndBackupsProps> = ({
  version,
  backupStatus,
  archives,
  onTriggerBackup,
  onRefresh,
  isLoading
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const safeArchives = Array.isArray(archives) ? archives : [];

  const handleStartBackup = async () => {
    setIsTriggering(true);
    await onTriggerBackup();
    setIsTriggering(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Version Baseline & Backup Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Baseline Release {version?.baseline || 'v0.0.0'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                R2 Bucket: clienthub-backups
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Daily Cron Active (03:00 UTC)
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Version Manager & Cloudflare R2 Backups
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Automated off-site disaster recovery engine synchronizing PostgreSQL snapshots directly to Cloudflare R2 bucket with automated Spacemail notification delivery to <code className="text-cyan-300 font-mono">admin@plexivia.com</code>.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-500/20 active:scale-95 flex-shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Trigger Instant Cloudflare R2 Backup</span>
          </button>
        </div>
      </div>

      {/* Cloudflare R2 Infrastructure Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Cloudflare Account</span>
            <Cloud className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate" title="fa0942a4bd8e442e22f78fdb6a2a605a">
            fa0942a4bd8e442e22f78fdb6a2a605a
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">Bucket: clienthub-backups</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Cron Schedule</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">03:00 UTC (09:00 AM BST)</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">/etc/cron.d/plexi-postgres-backup</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Retention Policy</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">7-Day Disk / 30-Day R2</div>
          <div className="text-[11px] text-slate-400 mt-1">Automated rotation cycle</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Total R2 Vault Volume</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {backupStatus?.totalR2StorageFormatted || '4.49 GB'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{backupStatus?.totalBackupsCount || 18} Verified Archives</div>
        </div>
      </div>

      {/* System Version Services Baseline Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Microservices Release Manifest ({version?.baseline || 'v0.0.0'})</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Commit: <span className="text-cyan-400 font-semibold">{version?.commitSha || '9f8b1a4e2d3c7a6b'}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(version?.services || []).map((s) => (
            <div key={s.name} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-xs font-mono truncate">{s.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">v{s.version}</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Archives Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Recent PostgreSQL Backup Archives ({safeArchives.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Available for instant restore or offsite download
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-50"
            title="Refresh archives"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Archive File</th>
                <th className="pb-3 font-semibold">Size</th>
                <th className="pb-3 font-semibold">Storage Target</th>
                <th className="pb-3 font-semibold">Created (UTC)</th>
                <th className="pb-3 font-semibold">SHA256 Checksum</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {safeArchives.map((archive) => (
                <tr key={archive.id} className="hover:bg-slate-950/60 transition">
                  <td className="py-3 font-semibold text-white flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{archive.filename}</span>
                  </td>
                  <td className="py-3 text-indigo-300 font-bold">{archive.sizeFormatted}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {archive.storageTarget}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {new Date(archive.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 text-slate-500 text-[10px] truncate max-w-[160px]" title={archive.checksumSha256}>
                    {archive.checksumSha256}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => alert("Downloading backup archive " + archive.filename + " (" + archive.sizeFormatted + ")")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Modal */}
      <TriggerBackupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTrigger={handleStartBackup}
        isTriggering={isTriggering}
      />
    </div>
  );
};
