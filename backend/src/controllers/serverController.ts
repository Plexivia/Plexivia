import os from 'os';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { Request, Response } from 'express';

const execFileAsync = promisify(execFile);

const SAMPLE_MS = 500;
const MAX_DEPLOYMENTS = 30;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Sum of idle and total CPU ticks across all cores
const cpuTicks = () =>
  os.cpus().reduce(
    (acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      return { idle: acc.idle + cpu.times.idle, total: acc.total + total };
    },
    { idle: 0, total: 0 }
  );

// Received/sent bytes summed over all non-loopback interfaces (Linux only)
const readNetBytes = (): { rx: number; tx: number } | null => {
  try {
    const lines = fs.readFileSync('/proc/net/dev', 'utf8').split('\n').slice(2);
    return lines.reduce(
      (acc, line) => {
        const [iface, data] = line.split(':');
        if (!data || iface.trim() === 'lo') return acc;
        const fields = data.trim().split(/\s+/).map(Number);
        return { rx: acc.rx + fields[0], tx: acc.tx + fields[8] };
      },
      { rx: 0, tx: 0 }
    );
  } catch {
    return null;
  }
};

// Pretty OS name, e.g. "Ubuntu 22.04.4 LTS"
const readOsName = () => {
  try {
    const release = fs.readFileSync('/etc/os-release', 'utf8');
    const match = release.match(/^PRETTY_NAME="?([^"\n]+)"?/m);
    if (match) return match[1];
  } catch {
    // Not Linux, fall back to the kernel description
  }
  return `${os.type()} ${os.release()}`;
};

// Total and used bytes of the filesystem holding the app
const readDisk = (target: string) => {
  try {
    const stat = fs.statfsSync(target);
    const total = stat.blocks * stat.bsize;
    const free = stat.bavail * stat.bsize;
    return { total, used: total - free };
  } catch {
    return null;
  }
};

// Finds the git checkout the server runs from (walks up from the working directory)
const findRepoRoot = (start: string) => {
  let dir = start;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
};

// Every `git pull` recorded in the HEAD reflog, newest first
const readDeployments = async () => {
  const repo = findRepoRoot(process.cwd());
  if (!repo) return [];
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['reflog', '-n', '200', '--date=iso-strict', '--format=%h%x09%gd%x09%gs%x09%s'],
      { cwd: repo, timeout: 5000 }
    );
    return stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [commit, selector, action, subject] = line.split('\t');
        const date = selector.match(/\{(.+)\}/)?.[1] || null;
        return { commit, date, action, subject };
      })
      .filter((entry) => entry.action?.startsWith('pull'))
      .slice(0, MAX_DEPLOYMENTS);
  } catch {
    return [];
  }
};

// Parses CONTROL_PANEL_LINKS="cPanel|https://host:2083,Hostinger|https://hpanel.hostinger.com"
const readControlPanels = () =>
  (process.env.CONTROL_PANEL_LINKS || '')
    .split(',')
    .map((entry) => entry.split('|').map((part) => part.trim()))
    .filter(([name, url]) => name && /^https?:\/\//.test(url || ''))
    .map(([name, url]) => ({ name, url }));

// Live server vitals for the Cpanel page: RAM, disk, CPU, network, uptime, deployments
export const getServerVitals = async (_req: Request, res: Response) => {
  try {
    const cpuStart = cpuTicks();
    const netStart = readNetBytes();
    const [deployments] = await Promise.all([readDeployments(), sleep(SAMPLE_MS)]);
    const cpuEnd = cpuTicks();
    const netEnd = readNetBytes();

    const totalTicks = cpuEnd.total - cpuStart.total;
    const cpuPercent = totalTicks > 0 ? Math.round((1 - (cpuEnd.idle - cpuStart.idle) / totalTicks) * 100) : 0;
    const seconds = SAMPLE_MS / 1000;
    const network =
      netStart && netEnd
        ? {
            inMbps: Number((((netEnd.rx - netStart.rx) * 8) / seconds / 1_000_000).toFixed(2)),
            outMbps: Number((((netEnd.tx - netStart.tx) * 8) / seconds / 1_000_000).toFixed(2)),
          }
        : null;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return res.json({
      success: true,
      data: {
        hostname: os.hostname(),
        osName: readOsName(),
        uptimeSeconds: Math.round(os.uptime()),
        memory: { total: os.totalmem(), used: os.totalmem() - os.freemem() },
        disk: readDisk(process.cwd()),
        cpu: { cores: os.cpus().length, percent: Math.max(0, Math.min(100, cpuPercent)) },
        network,
        deployments,
        deploymentsLast7Days: deployments.filter((d) => d.date && new Date(d.date).getTime() >= weekAgo).length,
        controlPanels: readControlPanels(),
        sampledAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to read server vitals' });
  }
};
