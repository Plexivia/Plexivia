import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { GitRepo } from '../types';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Star,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Search,
  RefreshCw,
  FolderGit2,
  Code2,
} from 'lucide-react';

export const PrivateGitPage: React.FC = () => {
  const { repos, refreshAll } = useData();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedRepoId, setCopiedRepoId] = useState<string | null>(null);

  const safeRepos = Array.isArray(repos) ? repos : [];

  const filteredRepos = safeRepos.filter(r => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (r.name || '').toLowerCase().includes(q);
      const matchDesc = (r.description || '').toLowerCase().includes(q);
      const matchAuthor = (r.last_commit_author || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchAuthor) return false;
    }
    return true;
  });

  const handleCopySSH = (repo: GitRepo) => {
    navigator.clipboard.writeText(repo.clone_url_ssh);
    setCopiedRepoId(repo.id);
    showToast('info', 'SSH Clone String Copied', repo.clone_url_ssh);
    setTimeout(() => setCopiedRepoId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              Private Gitea Git Subsystem
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
              git.plexivia.com Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Self-hosted repository fleet, automated deploy keys, branch trees, and SSH clone generators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Repos</span>
          </button>
          <a
            href="https://git.plexivia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-lg transition cursor-pointer"
          >
            <span>Gitea Web UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Cluster Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Self-Hosted Gitea Server</h3>
              <p className="text-xs text-slate-400 font-mono">
                Host: <span className="text-purple-300 font-semibold">git.plexivia.com</span> • SSH Port:{' '}
                <span className="text-purple-300 font-semibold">22 / 2222</span> • Storage: NVMe Encrypted
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> All Repos Encrypted & Private
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search repositories by name or author..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
          {filteredRepos.length} Repositories Registered
        </span>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRepos.map(repo => {
          const isCopied = copiedRepoId === repo.id;

          return (
            <div
              key={repo.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 shadow-lg space-y-4 transition-all"
            >
              {/* Repo Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-400" />
                    <h3 className="text-base font-bold text-white font-mono">{repo.full_name}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{repo.description}</p>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  Private
                </span>
              </div>

              {/* Stats & Branch Bar */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
                <div className="flex items-center gap-1 text-cyan-400">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>{repo.default_branch}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5" />
                  <span>{repo.stars} stars</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>{repo.open_issues} open issues</span>
                </div>
              </div>

              {/* Last Commit Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <GitCommit className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-200 font-semibold">{repo.last_commit_author}</span>
                  <span className="text-slate-600">•</span>
                  <span>{repo.last_commit_time}</span>
                </div>
                <p className="text-slate-300 text-xs truncate pl-5">
                  "{repo.last_commit_message}"
                </p>
              </div>

              {/* Clone SSH Command & Copy */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 truncate pr-2">{repo.clone_url_ssh}</span>
                <button
                  onClick={() => handleCopySSH(repo)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 transition-colors text-[11px] shrink-0 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy SSH'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
