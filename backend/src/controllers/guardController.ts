import { Request, Response } from 'express';
import { Store } from '../data/mockStore.js';
import { TelemetryPacket } from '../types/index.js';

export const getGuardHealth = (req: Request, res: Response) => {
  return res.json({
    status: 'healthy',
    service: 'plexiGuard SRE Telemetry & Anomaly Guard',
    version: '1.2.0',
    port: 5097,
    wsEndpoint: 'ws://127.0.0.1:5097/ws/telemetry (or /ws/telemetry via proxy)',
    uptimeSeconds: 4183200,
    monitoredNodes: Store.nodes.length,
    monitoredContainers: Store.containers.length,
    activeAnomalies: Store.anomalies.filter(a => !a.resolved).length,
    samplingRateMs: 1000,
    engineStatus: 'RUNNING'
  });
};

export const getTelemetry = (req: Request, res: Response) => {
  const master = Store.nodes.find(n => n.isMaster) || Store.nodes[0];
  const jitter = (Math.random() - 0.5) * 2;
  const cpuUsage = Math.min(100, Math.max(10, master.cpu.usagePercent + jitter));
  const packet: TelemetryPacket = {
    timestamp: new Date().toISOString(),
    cpu: {
      overallUsage: Number(cpuUsage.toFixed(1)),
      cores: [
        Number((cpuUsage * 0.9).toFixed(1)),
        Number((cpuUsage * 1.1).toFixed(1)),
        Number((cpuUsage * 0.95).toFixed(1)),
        Number((cpuUsage * 1.05).toFixed(1)),
        Number((cpuUsage * 0.88).toFixed(1)),
        Number((cpuUsage * 1.02).toFixed(1)),
        Number((cpuUsage * 0.96).toFixed(1)),
        Number((cpuUsage * 1.04).toFixed(1))
      ],
      loadAvg: [Number((0.70 + Math.random() * 0.1).toFixed(2)), 0.65, 0.58]
    },
    ram: {
      totalGb: 16.0,
      usedGb: Number((4.2 + (Math.random() * 0.2)).toFixed(2)),
      cachedGb: 3.8,
      freeGb: 8.0,
      usagePercent: Number(((4.2 / 16.0) * 100).toFixed(1))
    },
    network: {
      rxKbps: Number((1380 + Math.random() * 200).toFixed(1)),
      txKbps: Number((2750 + Math.random() * 400).toFixed(1)),
      activeConnections: 142 + Math.floor(Math.random() * 20),
      packetLossPercent: 0.00
    },
    disk: {
      readIops: 240 + Math.floor(Math.random() * 50),
      writeIops: 380 + Math.floor(Math.random() * 80),
      diskUsagePercent: 20.21
    },
    activeAnomaliesCount: Store.anomalies.filter(a => !a.resolved).length
  };

  return res.json({
    status: 'success',
    telemetry: packet
  });
};

export const getAnomalies = (req: Request, res: Response) => {
  return res.json({
    status: 'success',
    anomalies: Store.anomalies
  });
};

export const getContainers = (req: Request, res: Response) => {
  return res.json({
    status: 'success',
    containers: Store.containers
  });
};

export const acknowledgeAlert = (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = Store.anomalies.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ status: 'error', message: 'Alert not found' });
  }

  alert.acknowledged = true;
  alert.acknowledgedBy = req.body.acknowledgedBy || 'admin@plexivia.com';

  return res.json({
    status: 'success',
    message: 'Alert acknowledged',
    alert
  });
};

export const resolveAlert = (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = Store.anomalies.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ status: 'error', message: 'Alert not found' });
  }

  alert.resolved = true;
  alert.resolvedAt = new Date().toISOString();

  return res.json({
    status: 'success',
    message: 'Alert resolved',
    alert
  });
};
