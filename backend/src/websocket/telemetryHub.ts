import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { Store } from '../data/mockStore.js';
import { TelemetryPacket } from '../types/index.js';

export class TelemetryHub {
  private static wss: WebSocketServer | null = null;
  private static intervalId: NodeJS.Timeout | null = null;

  public static initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws/telemetry' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('[WebSocket Telemetry] Client connected from ' + (req.socket.remoteAddress || 'unknown'));

      // Send immediate baseline packet
      const baseline = this.generatePacket();
      ws.send(JSON.stringify({ type: 'TELEMETRY_STREAM_INIT', data: baseline }));

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          } else if (parsed.type === 'PROBE_NODE') {
            const node = Store.nodes.find(n => n.id === parsed.nodeId);
            if (node) {
              node.network.pingMs = Number((16 + Math.random() * 5).toFixed(1));
              ws.send(JSON.stringify({ type: 'NODE_PROBE_RESULT', nodeId: node.id, pingMs: node.network.pingMs }));
            }
          }
        } catch (e) {
          // ignore non-json
        }
      });

      ws.on('close', () => {
        console.log('[WebSocket Telemetry] Client disconnected');
      });

      ws.on('error', (err) => {
        console.error('[WebSocket Telemetry] Socket error:', err.message);
      });
    });

    // Broadcast 1-second telemetry ticks
    this.intervalId = setInterval(() => {
      if (this.wss && this.wss.clients.size > 0) {
        const packet = this.generatePacket();
        const payload = JSON.stringify({
          type: 'TELEMETRY_TICK',
          timestamp: new Date().toISOString(),
          data: packet
        });

        this.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    }, 1000);

    console.log('[WebSocket Telemetry] Telemetry broadcast engine running at path /ws/telemetry');
  }

  private static generatePacket(): TelemetryPacket {
    const master = Store.nodes.find(n => n.isMaster) || Store.nodes[0];
    const jitter = (Math.random() - 0.48) * 4;
    const cpuUsage = Math.min(96, Math.max(12, master.cpu.usagePercent + jitter));
    master.cpu.usagePercent = Number(cpuUsage.toFixed(1));

    const usedRamGb = Number((4.2 + (Math.sin(Date.now() / 10000) * 0.4) + Math.random() * 0.1).toFixed(2));
    const rxKb = Number((1200 + Math.random() * 500).toFixed(1));
    const txKb = Number((2400 + Math.random() * 800).toFixed(1));

    return {
      timestamp: new Date().toISOString(),
      cpu: {
        overallUsage: Number(cpuUsage.toFixed(1)),
        cores: Array.from({ length: 8 }).map((_, i) => {
          const coreJitter = (Math.random() - 0.5) * 8;
          return Number(Math.min(100, Math.max(5, cpuUsage + coreJitter)).toFixed(1));
        }),
        loadAvg: [
          Number((0.68 + Math.random() * 0.12).toFixed(2)),
          0.64,
          0.59
        ]
      },
      ram: {
        totalGb: 16.0,
        usedGb: usedRamGb,
        cachedGb: 3.8,
        freeGb: Number((16.0 - usedRamGb - 3.8).toFixed(2)),
        usagePercent: Number(((usedRamGb / 16.0) * 100).toFixed(1))
      },
      network: {
        rxKbps: rxKb,
        txKbps: txKb,
        activeConnections: 140 + Math.floor(Math.random() * 25),
        packetLossPercent: 0.00
      },
      disk: {
        readIops: 240 + Math.floor(Math.random() * 40),
        writeIops: 380 + Math.floor(Math.random() * 60),
        diskUsagePercent: 20.21
      },
      activeAnomaliesCount: Store.anomalies.filter(a => !a.resolved).length
    };
  }

  public static broadcastEvent(type: string, data: any) {
    if (this.wss && this.wss.clients.size > 0) {
      const payload = JSON.stringify({
        type,
        timestamp: new Date().toISOString(),
        data
      });

      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
      console.log(`[WebSocket Telemetry] Broadcast event '${type}' dispatched to ${this.wss.clients.size} active client(s)`);
    }
  }

  public static shutdown() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}
