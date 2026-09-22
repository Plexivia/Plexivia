import React, { useState } from 'react';
import { X, GitBranch, Copy, Check, Terminal, Shield, ArrowRight } from 'lucide-react';

interface DualRemoteGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName?: string;
  sshUrl?: string;
}

export const DualRemoteGuideModal: React.FC<DualRemoteGuideModalProps> = ({
  isOpen,
  onClose,
  repoName = 'plexi-hub-core',
  sshUrl = 'ssh://git@git.plexivia.com:2222/plexivia/plexi-hub-core.git'
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Inspect Current Remotes',
      desc: 'Verify that origin points to your GitHub or primary remote.',
      cmd: 'git remote -v'
    },
    {
      num: 2,
      title: 'Add Self-Hosted Gitea Private Remote',
      desc: 'Add the private SSH endpoint running on Gitea (port 2222).',
      cmd: `git remote add gitea ${sshUrl}`
    },
    {
      num: 3,
      title: 'Synchronize & Push to Both Remotes',
      desc: 'Push updates simultaneously to keep your private self-hosted and cloud mirror synchronized.',
      cmd: `git push origin main && git push gitea main`
    },
    {
      num: 4,
      title: '(Optional) Single-Command Multi-Push Configuration',
      desc: 'Configure git to push to both remotes with a single `git push` command.',
      cmd: `git remote set-url --add --push origin git@github.com:plexivia/${repoName}.git\ngit remote set-url --add --push origin ${sshUrl}`
    }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dual-Remote Synchronization Architecture</h3>
              <p className="text-xs text-slate-400 font-mono">
                Repository: <span className="text-orange-400 font-semibold">{repoName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-300 leading-relaxed">
              Plexivia uses a dual-remote topology for absolute data sovereignty. Follow these terminal commands to link your local workspace with both GitHub and the private Gitea instance on <code className="text-orange-300 font-mono">git.plexivia.com:2222</code>:
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((s, idx) => (
              <div key={s.num} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px] font-mono">
                      {s.num}
                    </span>
                    <span>{s.title}</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(s.cmd, idx)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px] font-mono"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-slate-400 text-[11px]">{s.desc}</p>

                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-cyan-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {s.cmd}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
