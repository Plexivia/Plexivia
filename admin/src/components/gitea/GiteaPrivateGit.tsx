import React, { useState } from 'react';
import { GitBranch, GitFork, Star, Lock, Copy, Check, Terminal, ExternalLink, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { GiteaRepository } from '../../types';
import { DualRemoteGuideModal } from './DualRemoteGuideModal';

interface GiteaPrivateGitProps {
  giteaStatus: any;
  repositories: GiteaRepository[];
  isLoading: boolean;
}

export const GiteaPrivateGit: React.FC<GiteaPrivateGitProps> = ({
  giteaStatus,
  repositories,
  isLoading
}) => {
  const [selectedRepoForGuide, setSelectedRepoForGuide] = useState<GiteaRepository | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const safeRepos = Array.isArray(repositories) ? repositories : [];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Gitea Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                Gitea Private Git Server
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Web: 3001 • SSH: 2222
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> git.plexivia.com Online
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Self-Hosted Private Git Infrastructure
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Air-gapped private source code repository hosting with automated dual-remote synchronization to GitHub mirrors and multi-VPS CI/CD pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedRepoForGuide(safeRepos[0] || null)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold text-xs transition shadow-lg shadow-orange-500/20 active:scale-95 flex-shrink-0"
            >
              <Terminal className="w-4 h-4" />
              <span>Open Dual-Remote Setup Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gitea Cluster Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Gitea Web Portal</span>
            <ExternalLink className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono">https://git.plexivia.com</div>
          <div className="text-[11px] text-orange-400 mt-1 font-mono">Port 3001 (Nginx SSL Ingress)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>SSH Clone Port</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">Port 2222</div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">ED25519 & RSA Keys Active</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Private Repositories</span>
            <GitBranch className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {safeRepos.length} Active
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% Private Sovereignty</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Commit Sync Engine</span>
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-indigo-300 font-mono">Dual-Remote Bridge</div>
          <div className="text-[11px] text-slate-400 mt-1">Gitea &lt;=&gt; GitHub Mirror</div>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {safeRepos.map((repo) => (
          <div
            key={repo.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative transition hover:border-slate-700 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{repo.name}</h3>
                    {repo.isPrivate && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Default Branch: <strong className="text-cyan-400">{repo.defaultBranch}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRepoForGuide(repo)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-300 text-xs font-semibold transition"
              >
                Dual-Remote Guide
              </button>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-xs leading-relaxed">
              {repo.description}
            </p>

            {/* Last Commit Box */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-cyan-300 font-semibold">{repo.lastCommit.author}</span>
                <span>{new Date(repo.lastCommit.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-300 text-xs font-mono truncate">
                {repo.lastCommit.message}
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                SHA: {repo.lastCommit.sha}
              </div>
            </div>

            {/* Clone URLs Box */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 text-[11px] font-mono">SSH (Port 2222):</span>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-cyan-300 font-mono text-[11px] flex-1 max-w-[340px] truncate">
                  <span className="truncate">{repo.cloneUrlSsh}</span>
                  <button
                    onClick={() => handleCopy(repo.cloneUrlSsh)}
                    className="p-1 hover:text-white transition ml-auto"
                    title="Copy SSH URL"
                  >
                    {copiedUrl === repo.cloneUrlSsh ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 text-[11px] font-mono">HTTPS:</span>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 font-mono text-[11px] flex-1 max-w-[340px] truncate">
                  <span className="truncate">{repo.cloneUrlHttps}</span>
                  <button
                    onClick={() => handleCopy(repo.cloneUrlHttps)}
                    className="p-1 hover:text-white transition ml-auto"
                    title="Copy HTTPS URL"
                  >
                    {copiedUrl === repo.cloneUrlHttps ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Modal */}
      {selectedRepoForGuide && (
        <DualRemoteGuideModal
          isOpen={!!selectedRepoForGuide}
          onClose={() => setSelectedRepoForGuide(null)}
          repoName={selectedRepoForGuide.name}
          sshUrl={selectedRepoForGuide.cloneUrlSsh}
        />
      )}
    </div>
  );
};
