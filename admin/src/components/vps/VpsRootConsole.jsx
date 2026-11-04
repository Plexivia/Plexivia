import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ChevronDown,
  FolderGit2,
  History,
  Lock,
  Play,
  Plug,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal as TerminalIcon,
  Unlock,
} from 'lucide-react';
import {
  clearUnlock,
  execCommand,
  fetchCommands,
  fetchConsoleState,
  fetchLogs,
  fetchTargets,
  getUnlockExpiry,
  getUnlockToken,
  isLockedError,
  lockConsole,
  saveServer,
  testConnection,
  vpsErrorMessage,
} from '@/services/vpsApi';
import VpsUnlockPanel from './VpsUnlockPanel';
import VpsTerminal from './VpsTerminal';
import { cn } from '@/lib/utils';

/**
 * Root console for the VPS this dashboard runs on.
 *
 * Locked by default. Once unlocked it offers the premade commands from the
 * backend whitelist against a chosen checkout — the Plexivia app itself, or a
 * client folder under the configured clients root — plus a real SSH shell for
 * anything the list does not cover. The dashboard never sends a command string;
 * it sends an id, and the backend decides what runs.
 */

const RISK_TONE = {
  READ: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  WRITE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  DESTRUCTIVE: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
};

const RISK_LABEL = { READ: 'read only', WRITE: 'changes the server', DESTRUCTIVE: 'destructive' };

const Section = ({ title, icon: Icon, children, aside = null, collapsible = false, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => collapsible && setOpen((v) => !v)}
          className={cn('flex items-center gap-2 text-sm font-semibold text-foreground', collapsible && 'cursor-pointer')}
        >
          {Icon && <Icon className="size-4 text-primary" />}
          {title}
          {collapsible && <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />}
        </button>
        {aside}
      </div>
      {(!collapsible || open) && children}
    </section>
  );
};

// "4m 12s" style countdown to the automatic re-lock
const formatRemaining = (ms) => {
  if (ms <= 0) return 'expired';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CredentialsForm = ({ server, onSaved }) => {
  const [form, setForm] = useState({
    label: server?.label || '',
    host: server?.host || '',
    port: server?.port || 22,
    username: server?.username || 'root',
    authMethod: server?.auth_method || 'PASSWORD',
    appPath: server?.app_path || '',
    clientsRoot: server?.clients_root || '',
    password: '',
    privateKey: '',
    passphrase: '',
  });
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      // Secrets left blank keep whatever is already stored
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.privateKey) delete payload.privateKey;
      if (!payload.passphrase) delete payload.passphrase;
      const result = await saveServer(payload);
      toast.success(result?.message || 'VPS connection saved.');
      setForm((prev) => ({ ...prev, password: '', privateKey: '', passphrase: '' }));
      onSaved?.();
    } catch (error) {
      toast.error(vpsErrorMessage(error, 'Could not save the VPS connection.'));
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        The root password or private key is encrypted before it is stored and never sent back to the browser. Leave a secret field empty to keep
        the one already saved.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Label<input className={field} value={form.label} onChange={set('label')} placeholder="Plexivia VPS" />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Host / IP<input className={field} value={form.host} onChange={set('host')} placeholder="127.0.0.1" />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          SSH port<input className={field} type="number" value={form.port} onChange={set('port')} placeholder="22" />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          SSH user<input className={field} value={form.username} onChange={set('username')} placeholder="root" />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Authentication
          <select className={field} value={form.authMethod} onChange={set('authMethod')}>
            <option value="PASSWORD">Root password</option>
            <option value="PRIVATE_KEY">Private key</option>
          </select>
        </label>
        {form.authMethod === 'PASSWORD' ? (
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Root password
            <input className={field} type="password" value={form.password} onChange={set('password')} placeholder={server?.has_password ? '•••••••• (saved)' : 'Not set'} autoComplete="new-password" />
          </label>
        ) : (
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Key passphrase
            <input className={field} type="password" value={form.passphrase} onChange={set('passphrase')} placeholder="Optional" autoComplete="new-password" />
          </label>
        )}
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          App path on VPS<input className={field} value={form.appPath} onChange={set('appPath')} placeholder="/opt/plexivia" />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Clients root<input className={field} value={form.clientsRoot} onChange={set('clientsRoot')} placeholder="/opt/clients" />
        </label>
      </div>

      {form.authMethod === 'PRIVATE_KEY' && (
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Private key {server?.has_private_key && <span className="text-emerald-600 dark:text-emerald-400">(one is saved)</span>}
          <textarea
            className={cn(field, 'min-h-28 font-mono text-[11px]')}
            value={form.privateKey}
            onChange={set('privateKey')}
            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Save connection'}
      </button>
    </form>
  );
};

const VpsRootConsole = () => {
  const [state, setState] = useState(null);
  const [unlocked, setUnlocked] = useState(Boolean(getUnlockToken()));
  const [remaining, setRemaining] = useState(0);
  const [targets, setTargets] = useState([]);
  const [commands, setCommands] = useState([]);
  const [targetId, setTargetId] = useState('app');
  const [commandId, setCommandId] = useState('');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadError, setLoadError] = useState('');

  const loadState = useCallback(async () => {
    try {
      setState(await fetchConsoleState());
    } catch (error) {
      setLoadError(vpsErrorMessage(error, 'Could not read the console state.'));
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Drop to the lock screen the moment the unlock window closes
  useEffect(() => {
    if (!unlocked) return undefined;
    const tick = () => {
      const left = getUnlockExpiry() - Date.now();
      setRemaining(left);
      if (left <= 0) {
        clearUnlock();
        setUnlocked(false);
        toast.info('Root console re-locked after 20 minutes.');
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [unlocked]);

  const handleLocked = useCallback(() => {
    clearUnlock();
    setUnlocked(false);
    setResult(null);
  }, []);

  const loadConsole = useCallback(async () => {
    setLoadError('');
    try {
      const [targetData, commandData] = await Promise.all([fetchTargets(), fetchCommands()]);
      setTargets(targetData?.targets || []);
      setCommands(commandData?.commands || []);
    } catch (error) {
      if (isLockedError(error)) {
        handleLocked();
        return;
      }
      setLoadError(vpsErrorMessage(error, 'Could not reach the VPS.'));
    }
  }, [handleLocked]);

  useEffect(() => {
    if (unlocked) loadConsole();
  }, [unlocked, loadConsole]);

  const selectedTarget = useMemo(() => targets.find((t) => t.id === targetId) || targets[0], [targets, targetId]);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const command of commands) {
      // Hide stack commands for a checkout that has no compose file or Makefile
      if (selectedTarget && command.scope === 'TARGET') {
        if (command.group === 'Docker' && !selectedTarget.hasCompose && !selectedTarget.hasMake) continue;
        if (command.group === 'Deploy' && !selectedTarget.hasMake) continue;
        if (command.group === 'Git' && !selectedTarget.isGit) continue;
      }
      groups.set(command.group, [...(groups.get(command.group) || []), command]);
    }
    return [...groups.entries()];
  }, [commands, selectedTarget]);

  const selectedCommand = useMemo(() => commands.find((c) => c.id === commandId), [commands, commandId]);

  const run = async () => {
    if (!selectedCommand) return;
    if (selectedCommand.needsConfirm) {
      const where = selectedCommand.scope === 'TARGET' ? ` in ${selectedTarget?.name || targetId}` : ' on the server';
      const warning =
        selectedCommand.risk === 'DESTRUCTIVE'
          ? '\n\nThis is destructive and cannot be undone.'
          : '';
      if (!window.confirm(`Run "${selectedCommand.label}"${where} as root?${warning}`)) return;
    }
    setRunning(true);
    setResult(null);
    try {
      const data = await execCommand(selectedCommand.scope === 'TARGET' ? targetId : 'app', selectedCommand.id);
      setResult(data);
      if (data?.exitCode === 0) toast.success(`${data.label} finished.`);
      else toast.warning(`${data?.label || 'Command'} exited with code ${data?.exitCode}.`);
      loadConsole();
    } catch (error) {
      if (isLockedError(error)) {
        handleLocked();
        return;
      }
      toast.error(vpsErrorMessage(error, 'Command failed.'));
    } finally {
      setRunning(false);
    }
  };

  const runTest = async () => {
    try {
      const data = await testConnection();
      toast.success(data?.message || 'Connected.');
    } catch (error) {
      if (isLockedError(error)) handleLocked();
      else toast.error(vpsErrorMessage(error, 'SSH connection failed.'));
    }
  };

  const loadLogs = async () => {
    try {
      const data = await fetchLogs(50);
      setLogs(data?.logs || []);
    } catch (error) {
      if (isLockedError(error)) handleLocked();
      else toast.error(vpsErrorMessage(error, 'Could not read the audit log.'));
    }
  };

  const lockNow = async () => {
    await lockConsole();
    setUnlocked(false);
    setResult(null);
    toast.success('Root console locked.');
  };

  if (!unlocked) {
    return (
      <Section title="VPS root console" icon={Lock}>
        {loadError && <p className="mb-3 text-sm text-rose-600 dark:text-rose-400">{loadError}</p>}
        {state && !state.credentialsPresent && (
          <p className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            No SSH credentials are saved yet. Unlock the console and, as the owner, add the root password or private key under “VPS connection”.
          </p>
        )}
        <VpsUnlockPanel
          state={state}
          onUnlocked={() => {
            setUnlocked(true);
            loadState();
          }}
        />
      </Section>
    );
  }

  const output = result ? [result.stdout, result.stderr].filter(Boolean).join('\n') : '';

  return (
    <div className="space-y-4">
      {/* Unlocked header */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15">
            <Unlock className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Root console unlocked — {state?.server?.username}@{state?.server?.host}:{state?.server?.port}
            </p>
            <p className="text-xs text-muted-foreground">Re-locks in {formatRemaining(remaining)}. Every command is logged.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runTest}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <Plug className="size-3.5" />
            Test SSH
          </button>
          <button
            type="button"
            onClick={loadConsole}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={lockNow}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            <Lock className="size-3.5" />
            Lock console
          </button>
        </div>
      </section>

      {loadError && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{loadError}</p>
      )}

      {/* Target + command runner */}
      <Section
        title="Run a command"
        icon={Play}
        aside={selectedTarget && <span className="font-mono text-[11px] text-muted-foreground">{selectedTarget.path}</span>}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Target checkout
            <select
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              className="w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {targets.length === 0 && <option value="app">Loading…</option>}
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.kind === 'APP' ? `${target.name} (this app)` : target.name} — {target.path}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Command
            <select
              value={commandId}
              onChange={(event) => setCommandId(event.target.value)}
              className="w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Select a command…</option>
              {grouped.map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((command) => (
                    <option key={command.id} value={command.id}>
                      {command.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        {selectedTarget && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
            <FolderGit2 className="size-4 text-primary" />
            {selectedTarget.isGit ? (
              <>
                <span className="font-semibold text-foreground">{selectedTarget.branch}</span>
                <span className="font-mono text-muted-foreground">{selectedTarget.commit}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{selectedTarget.subject}</span>
                {selectedTarget.committedAt && <span className="text-muted-foreground">{timeAgo(selectedTarget.committedAt)}</span>}
                {selectedTarget.dirtyFiles > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                    {selectedTarget.dirtyFiles} uncommitted
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Not a git checkout.</span>
            )}
          </div>
        )}

        {selectedCommand && (
          <div className="mt-3 space-y-2 rounded-lg border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', RISK_TONE[selectedCommand.risk])}>
                {RISK_LABEL[selectedCommand.risk]}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedCommand.scope === 'SYSTEM' ? 'Runs on the server, not in a checkout' : 'Runs inside the selected checkout'} · timeout{' '}
                {selectedCommand.timeoutSeconds}s
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{selectedCommand.description}</p>
          </div>
        )}

        <button
          type="button"
          onClick={run}
          disabled={running || !selectedCommand}
          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play className="size-4" />
          {running ? 'Running…' : 'Execute'}
        </button>

        {(running || result) && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {result && (
                <>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-semibold',
                      result.exitCode === 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    )}
                  >
                    exit {result.exitCode ?? '—'}
                  </span>
                  <span className="text-muted-foreground">
                    {result.label} · {result.target} · {(result.durationMs / 1000).toFixed(1)}s
                  </span>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{result.ranCommand}</code>
                </>
              )}
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg bg-[#0b1020] p-3 font-mono text-[12px] leading-relaxed text-slate-200 scrollbar-theme">
              {running ? 'Running on the VPS…' : output || '(no output)'}
            </pre>
            {result?.truncated && <p className="text-[11px] text-amber-600 dark:text-amber-400">Output was truncated at 512 KB.</p>}
          </div>
        )}
      </Section>

      {/* Interactive SSH */}
      <Section title="SSH terminal" icon={TerminalIcon} collapsible defaultOpen={false}>
        <VpsTerminal host={`${state?.server?.username}@${state?.server?.host}:${state?.server?.port}`} />
      </Section>

      {/* Audit log */}
      <Section
        title="Console audit log"
        icon={History}
        collapsible
        defaultOpen={false}
        aside={
          <button type="button" onClick={loadLogs} className="cursor-pointer text-xs font-medium text-primary hover:underline">
            Load latest
          </button>
        }
      >
        {logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Press “Load latest” to read the recorded runs.</p>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto scrollbar-theme">
            {logs.map((log) => (
              <li key={log._id} className="flex items-start justify-between gap-3 py-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {log.command_id} <span className="font-normal text-muted-foreground">· {log.target}</span>
                  </p>
                  <p className="truncate text-muted-foreground">
                    {log.admin_email} {log.error ? `· ${log.error}` : `· exit ${log.exit_code ?? '—'}`}
                  </p>
                </div>
                <span className="shrink-0 text-muted-foreground">{timeAgo(log.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Credentials (owner only) */}
      {state?.canEditCredentials && (
        <Section title="VPS connection" icon={Server} collapsible defaultOpen={!state?.credentialsPresent}>
          <CredentialsForm server={state.server} onSaved={loadState} />
        </Section>
      )}

      {!state?.canEditCredentials && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Only the owner account can change the stored root credentials.
        </p>
      )}
    </div>
  );
};

export default VpsRootConsole;
