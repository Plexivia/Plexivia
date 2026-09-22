import { Request, Response } from 'express';
import { Store } from '../data/mockStore.js';

export const getFleetOverview = (req: Request, res: Response) => {
  const masterNode = Store.nodes.find(n => n.isMaster) || Store.nodes[0];
  const totalNodes = Store.nodes.length;
  const onlineNodes = Store.nodes.filter(n => n.status === 'ONLINE').length;
  const totalCores = Store.nodes.reduce((acc, n) => acc + n.cpu.cores, 0);
  const totalRamGb = (Store.nodes.reduce((acc, n) => acc + n.ram.totalBytes, 0) / (1024 ** 3)).toFixed(1);
  const usedRamGb = (Store.nodes.reduce((acc, n) => acc + n.ram.usedBytes, 0) / (1024 ** 3)).toFixed(1);
  const totalDiskGb = (Store.nodes.reduce((acc, n) => acc + n.disk.totalBytes, 0) / (1024 ** 3)).toFixed(0);
  const usedDiskGb = (Store.nodes.reduce((acc, n) => acc + n.disk.usedBytes, 0) / (1024 ** 3)).toFixed(1);

  return res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    summary: {
      totalNodes,
      onlineNodes,
      totalCores,
      totalRamGb: Number(totalRamGb),
      usedRamGb: Number(usedRamGb),
      ramUsagePercent: ((Number(usedRamGb) / Number(totalRamGb)) * 100).toFixed(1),
      totalDiskGb: Number(totalDiskGb),
      usedDiskGb: Number(usedDiskGb),
      diskUsagePercent: ((Number(usedDiskGb) / Number(totalDiskGb)) * 100).toFixed(1),
      masterNodeIp: masterNode.ipAddress,
      masterNodeStatus: masterNode.status,
      masterNodePingMs: masterNode.network.pingMs,
      masterNodeUptime: masterNode.uptime.formatted
    },
    nodes: Store.nodes
  });
};

export const getNodeById = (req: Request, res: Response) => {
  const { id } = req.params;
  const node = Store.nodes.find(n => n.id === id || n.ipAddress === id);
  if (!node) {
    return res.status(404).json({ status: 'error', message: 'Node not found' });
  }
  return res.json({ status: 'success', node });
};

export const rebootNode = (req: Request, res: Response) => {
  const { id } = req.params;
  const { mode = 'graceful' } = req.body;
  const node = Store.nodes.find(n => n.id === id || n.ipAddress === id);
  if (!node) {
    return res.status(404).json({ status: 'error', message: 'Node not found' });
  }

  node.status = 'REBOOTING';

  setTimeout(() => {
    node.status = 'ONLINE';
    node.uptime.seconds = 120;
    node.uptime.formatted = '0d 00h 02m';
  }, 4000);

  return res.json({
    status: 'success',
    message: "Node " + node.name + " (" + node.ipAddress + ") reboot initiated via " + mode + " mode.",
    rebootId: 'reb-' + Date.now(),
    nodeId: node.id,
    targetState: 'ONLINE'
  });
};

export const syncNode = (req: Request, res: Response) => {
  const { id } = req.params;
  const node = Store.nodes.find(n => n.id === id || n.ipAddress === id);
  if (!node) {
    return res.status(404).json({ status: 'error', message: 'Node not found' });
  }

  node.status = 'SYNCING';

  setTimeout(() => {
    node.status = 'ONLINE';
    node.lastHeartbeat = new Date().toISOString();
  }, 3000);

  return res.json({
    status: 'success',
    message: "Fleet configuration synchronized with " + node.name + " (" + node.ipAddress + "). Playbook executed.",
    syncId: 'sync-' + Date.now(),
    changesApplied: ['docker-compose.yml', 'nginx-proxy-rules', 'cron-schedules']
  });
};

export const probeNode = (req: Request, res: Response) => {
  const { id } = req.params;
  const node = Store.nodes.find(n => n.id === id || n.ipAddress === id);
  if (!node) {
    return res.status(404).json({ status: 'error', message: 'Node not found' });
  }

  // Realistic jitter
  node.network.pingMs = Number((16 + Math.random() * 5).toFixed(1));
  node.lastHeartbeat = new Date().toISOString();

  return res.json({
    status: 'success',
    nodeId: node.id,
    ipAddress: node.ipAddress,
    pingMs: node.network.pingMs,
    tcpPort22: 'OPEN',
    tcpPort80: 'OPEN',
    tcpPort443: 'OPEN',
    tcpPort8090: 'OPEN',
    roundTripTime: node.network.pingMs + "ms"
  });
};
