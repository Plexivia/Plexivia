/**
 * The whitelist of commands the root console may run.
 *
 * The dashboard only ever sends a command **id**; the string executed on the VPS
 * comes from this file and nothing else, so no part of a request can shape the
 * command line. Anything not listed here has to go through the web terminal,
 * where the operator types it themselves and it is logged as a shell session.
 *
 * `make` targets mirror the repository Makefile. `scope: 'TARGET'` commands run
 * inside the selected checkout; `scope: 'SYSTEM'` commands run from the home
 * directory and ignore the selection.
 */

export type VpsCommandRisk = 'READ' | 'WRITE' | 'DESTRUCTIVE';

export interface VpsCommand {
  id: string;
  label: string;
  description: string;
  group: 'Git' | 'Deploy' | 'Docker' | 'System';
  scope: 'TARGET' | 'SYSTEM';
  risk: VpsCommandRisk;
  /** Exactly what runs on the VPS, after `cd` into the target for scope TARGET */
  command: string;
  timeoutMs: number;
}

const MINUTE = 60_000;

export const VPS_COMMANDS: VpsCommand[] = [
  // ---------------------------------------------------------------- Git ----
  {
    id: 'git-status',
    label: 'Git status',
    description: 'Current branch and uncommitted changes.',
    group: 'Git',
    scope: 'TARGET',
    risk: 'READ',
    command: 'git status --short --branch',
    timeoutMs: MINUTE,
  },
  {
    id: 'git-log',
    label: 'Git log (last 20)',
    description: 'The twenty most recent commits on this checkout.',
    group: 'Git',
    scope: 'TARGET',
    risk: 'READ',
    command: "git log --oneline --decorate -n 20 --date=relative --pretty='%h %d %s — %an, %cr'",
    timeoutMs: MINUTE,
  },
  {
    id: 'git-fetch',
    label: 'Git fetch --all --prune',
    description: 'Refresh remote refs without touching the working tree.',
    group: 'Git',
    scope: 'TARGET',
    risk: 'READ',
    command: 'git fetch --all --prune',
    timeoutMs: 2 * MINUTE,
  },
  {
    id: 'git-pull',
    label: 'Git pull (fast-forward only)',
    description: 'Pull the current branch. Stops rather than merging if the history diverged.',
    group: 'Git',
    scope: 'TARGET',
    risk: 'WRITE',
    command: 'git pull --ff-only',
    timeoutMs: 3 * MINUTE,
  },
  {
    id: 'git-reset-pull',
    label: 'Git reset --hard HEAD, then pull',
    description: 'Throws away uncommitted changes to tracked files, then pulls.',
    group: 'Git',
    scope: 'TARGET',
    risk: 'DESTRUCTIVE',
    command: 'git reset --hard HEAD && git pull',
    timeoutMs: 3 * MINUTE,
  },
  {
    id: 'git-reset-remote',
    label: 'Force match remote branch',
    description: 'Fetch and hard-reset onto origin/<current branch>. Local commits on this branch are lost.',
    group: 'Git',
    scope: 'TARGET',
    risk: 'DESTRUCTIVE',
    command: 'git fetch origin && git reset --hard "origin/$(git rev-parse --abbrev-ref HEAD)"',
    timeoutMs: 3 * MINUTE,
  },
  {
    id: 'git-clean',
    label: 'Git clean -fd',
    description: 'Delete untracked files and directories in this checkout.',
    group: 'Git',
    scope: 'TARGET',
    risk: 'DESTRUCTIVE',
    command: 'git clean -fd',
    timeoutMs: MINUTE,
  },

  // ------------------------------------------------------------- Deploy ----
  {
    id: 'make-deploy',
    label: 'make deploy',
    description: 'Pull, build, publish the frontends and restart services.',
    group: 'Deploy',
    scope: 'TARGET',
    risk: 'WRITE',
    command: 'make deploy',
    timeoutMs: 15 * MINUTE,
  },
  {
    id: 'make-build',
    label: 'make build',
    description: 'Build the backend and admin bundles without restarting anything.',
    group: 'Deploy',
    scope: 'TARGET',
    risk: 'WRITE',
    command: 'make build',
    timeoutMs: 15 * MINUTE,
  },
  {
    id: 'make-restart',
    label: 'make restart',
    description: 'Restart all services for this checkout.',
    group: 'Deploy',
    scope: 'TARGET',
    risk: 'WRITE',
    command: 'make restart',
    timeoutMs: 5 * MINUTE,
  },
  {
    id: 'make-status',
    label: 'make status',
    description: 'Service status as the Makefile reports it.',
    group: 'Deploy',
    scope: 'TARGET',
    risk: 'READ',
    command: 'make status',
    timeoutMs: 2 * MINUTE,
  },
  {
    id: 'make-health',
    label: 'make health',
    description: 'Hit the API gateway health endpoint.',
    group: 'Deploy',
    scope: 'TARGET',
    risk: 'READ',
    command: 'make health',
    timeoutMs: MINUTE,
  },
  {
    id: 'make-nginx',
    label: 'make nginx',
    description: 'Install the nginx site configs and reload nginx.',
    group: 'Deploy',
    scope: 'TARGET',
    risk: 'WRITE',
    command: 'make nginx',
    timeoutMs: 2 * MINUTE,
  },

  // ------------------------------------------------------------- Docker ----
  {
    id: 'compose-ps',
    label: 'docker compose ps',
    description: 'Container status for this checkout’s compose stack.',
    group: 'Docker',
    scope: 'TARGET',
    risk: 'READ',
    command: 'docker compose ps',
    timeoutMs: MINUTE,
  },
  {
    id: 'compose-logs',
    label: 'docker compose logs (last 200)',
    description: 'Recent log lines from every container in the stack.',
    group: 'Docker',
    scope: 'TARGET',
    risk: 'READ',
    command: 'docker compose logs --tail=200 --no-color',
    timeoutMs: 2 * MINUTE,
  },
  {
    id: 'compose-deploy',
    label: 'make docker-deploy',
    description: 'Pull the latest branch, rebuild the images and restart the containers.',
    group: 'Docker',
    scope: 'TARGET',
    risk: 'WRITE',
    command: 'make docker-deploy',
    timeoutMs: 20 * MINUTE,
  },
  {
    id: 'compose-up',
    label: 'docker compose up -d --build',
    description: 'Rebuild and start the stack in the background.',
    group: 'Docker',
    scope: 'TARGET',
    risk: 'WRITE',
    command: 'docker compose up -d --build',
    timeoutMs: 20 * MINUTE,
  },
  {
    id: 'compose-restart',
    label: 'docker compose restart',
    description: 'Restart every container in the stack.',
    group: 'Docker',
    scope: 'TARGET',
    risk: 'WRITE',
    command: 'docker compose restart',
    timeoutMs: 5 * MINUTE,
  },
  {
    id: 'compose-down',
    label: 'docker compose down',
    description: 'Stop and remove the stack’s containers. The site goes offline until it is started again.',
    group: 'Docker',
    scope: 'TARGET',
    risk: 'DESTRUCTIVE',
    command: 'docker compose down',
    timeoutMs: 5 * MINUTE,
  },

  // ------------------------------------------------------------- System ----
  {
    id: 'sys-disk',
    label: 'Disk usage',
    description: 'df -h across all mounted filesystems.',
    group: 'System',
    scope: 'SYSTEM',
    risk: 'READ',
    command: 'df -h',
    timeoutMs: MINUTE,
  },
  {
    id: 'sys-memory',
    label: 'Memory usage',
    description: 'free -h plus load average.',
    group: 'System',
    scope: 'SYSTEM',
    risk: 'READ',
    command: 'free -h && echo && uptime',
    timeoutMs: MINUTE,
  },
  {
    id: 'sys-top',
    label: 'Top processes',
    description: 'The fifteen heaviest processes by CPU.',
    group: 'System',
    scope: 'SYSTEM',
    risk: 'READ',
    command: 'ps -eo pcpu,pmem,pid,user,comm --sort=-pcpu | head -n 16',
    timeoutMs: MINUTE,
  },
  {
    id: 'sys-docker-ps',
    label: 'All containers',
    description: 'Every container on the VPS, not just one stack.',
    group: 'System',
    scope: 'SYSTEM',
    risk: 'READ',
    command: "docker ps -a --format 'table {{.Names}}\\t{{.State}}\\t{{.Status}}\\t{{.Ports}}'",
    timeoutMs: MINUTE,
  },
  {
    id: 'sys-services',
    label: 'Plexivia systemd units',
    description: 'Status of every plexivia-* service.',
    group: 'System',
    scope: 'SYSTEM',
    risk: 'READ',
    command: "systemctl list-units 'plexivia-*' --all --no-pager",
    timeoutMs: MINUTE,
  },
  {
    id: 'sys-nginx-test',
    label: 'nginx -t',
    description: 'Validate the nginx configuration without reloading.',
    group: 'System',
    scope: 'SYSTEM',
    risk: 'READ',
    command: 'nginx -t',
    timeoutMs: MINUTE,
  },
  {
    id: 'sys-nginx-reload',
    label: 'Reload nginx',
    description: 'Apply the nginx configuration on disk.',
    group: 'System',
    scope: 'SYSTEM',
    risk: 'WRITE',
    command: 'nginx -t && systemctl reload nginx',
    timeoutMs: MINUTE,
  },
];

export const findVpsCommand = (id: unknown): VpsCommand | undefined =>
  VPS_COMMANDS.find((entry) => entry.id === String(id));

/** The catalog as the dashboard needs it — without the command string itself. */
export const publicVpsCommands = () =>
  VPS_COMMANDS.map(({ command, timeoutMs, ...rest }) => ({
    ...rest,
    needsConfirm: rest.risk !== 'READ',
    timeoutSeconds: Math.round(timeoutMs / 1000),
  }));
