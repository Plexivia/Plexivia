import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { VPSNode } from '../../types';
import { Terminal, Copy, Check } from 'lucide-react';

interface SSHConsoleModalProps {
  node: VPSNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SSHConsoleModal: React.FC<SSHConsoleModalProps> = ({ node, isOpen, onClose }) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'uname -a && uptime',
      output: 'Linux plexi-vps 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64\n11:35:00 up 142 days, 4:18, 1 user, load average: 0.24, 0.38, 0.42',
    },
    {
      cmd: 'docker compose ps',
      output: 'NAME                   IMAGE                 STATUS         PORTS\nplexi-hub-dashboard   plexi-hub-ui:prod     Up 142 days    0.0.0.0:8010->80/tcp\nplexi-hub-server      plexi-server:1.2.4    Up 142 days    0.0.0.0:5095->5095/tcp\nplexi-mail            plexi-mail:1.0.2      Up 142 days    0.0.0.0:5096->5096/tcp\nplexi-guard           plexi-guard:2.0.1     Up 142 days    0.0.0.0:5097->5097/tcp\nplexi-postgres        postgres:16-alpine    Up 210 days    127.0.0.1:5432->5432/tcp\nplexi-redis           redis:7.2-alpine      Up 210 days    127.0.0.1:6380->6380/tcp',
    },
  ]);
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    let out = '';
    const c = command.trim().toLowerCase();
    if (c === 'clear') {
      setHistory([]);
      setCommand('');
      return;
    } else if (c.includes('docker') || c.includes('ps')) {
      out = 'All 8 container microservices running normally. Status: 100% HEALTHY.';
    } else if (c.includes('free') || c.includes('ram') || c.includes('mem')) {
      out = '               total        used        free      shared  buff/cache   available\nMem:        32768Mi    18942Mi    11420Mi       240Mi      2406Mi    13586Mi\nSwap:        8192Mi       420Mi     7772Mi';
    } else if (c.includes('backup') || c.includes('make')) {
      out = '[SUCCESS] R2 Snapshot verified. pg_dump compressed to 46.0 MB and dispatched to clienthub-backups.';
    } else {
      out = '[plexi-ops@' + node.node_name + ']: command executed successfully. (Code: 0)';
    }

    setHistory(prev => [...prev, { cmd: command, output: out }]);
    setCommand('');
  };

  const sshCommand = 'ssh -p ' + node.ssh_port + ' root@' + node.ip_address;

  const copySsh = () => {
    navigator.clipboard.writeText(sshCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'SSH Terminal: ' + node.node_name}
      subtitle={node.hostname + ' (' + node.ip_address + ':' + node.ssh_port + ') • ' + node.location}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Quick Connect Command */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-cyan-400 font-bold">$</span>
            <span className="truncate text-slate-200">{sshCommand}</span>
          </div>
          <button
            onClick={copySsh}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 transition-colors text-[11px] shrink-0 ml-2 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Terminal Window */}
        <div className="bg-black border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 min-h-[260px] max-h-[380px] overflow-y-auto space-y-3">
          {history.map((h, i) => (
            <div key={i} className="space-y-1">
              <div className="text-cyan-300 flex items-center gap-1.5">
                <span className="text-slate-500">root@{node.node_name}:~#</span>
                <span className="text-white font-bold">{h.cmd}</span>
              </div>
              <pre className="text-emerald-400 text-[11px] whitespace-pre-wrap leading-relaxed opacity-90">
                {h.output}
              </pre>
            </div>
          ))}

          {/* Prompt line */}
          <form onSubmit={handleRunCommand} className="flex items-center gap-2 text-white pt-1">
            <span className="text-slate-500 shrink-0">root@{node.node_name}:~#</span>
            <input
              type="text"
              autoFocus
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder="docker compose ps, free -m, make backup, clear..."
              className="flex-1 bg-transparent text-emerald-300 focus:outline-none placeholder-slate-600 text-xs font-mono"
            />
          </form>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>CPU: {node.cpu_percent}% • RAM: {node.ram_percent}% • Disk: {node.disk_percent}%</span>
          <span>Containers: {node.docker_containers_count} online</span>
        </div>
      </div>
    </Modal>
  );
};
