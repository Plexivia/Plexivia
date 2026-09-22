import { useState, useEffect, useRef } from 'react';
import { TelemetryPacket } from '../types';

const INITIAL_TELEMETRY: TelemetryPacket = {
  timestamp: new Date().toISOString(),
  cpu: {
    overallUsage: 24.8,
    cores: [22.4, 28.1, 19.5, 31.0, 24.2, 18.7, 27.5, 26.9],
    loadAvg: [0.72, 0.65, 0.58]
  },
  ram: {
    totalGb: 16.0,
    usedGb: 4.2,
    cachedGb: 3.8,
    freeGb: 8.0,
    usagePercent: 26.25
  },
  network: {
    rxKbps: 1380.4,
    txKbps: 2740.8,
    activeConnections: 142,
    packetLossPercent: 0.0
  },
  disk: {
    readIops: 124,
    writeIops: 380,
    diskUsagePercent: 20.21
  },
  activeAnomaliesCount: 0
};

export const useTelemetrySocket = () => {
  const [telemetry, setTelemetry] = useState<TelemetryPacket>(INITIAL_TELEMETRY);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const jitterIntervalRef = useRef<any>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use host if in dev proxy or 5095 default
    const wsUrl = window.location.port === '5173' || window.location.port === '3000' || window.location.port === '8010'
      ? `${protocol}//${window.location.hostname}:5095/ws/telemetry`
      : `${protocol}//${window.location.host}/ws/telemetry`;

    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (jitterIntervalRef.current) {
          clearInterval(jitterIntervalRef.current);
          jitterIntervalRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'TELEMETRY_PACKET' && parsed.data) {
            setTelemetry(parsed.data);
          } else if (parsed.cpu && parsed.ram) {
            setTelemetry(parsed);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        startJitterFallback();
      };

      ws.onerror = () => {
        setIsConnected(false);
        startJitterFallback();
      };
    } catch {
      setIsConnected(false);
      startJitterFallback();
    }

    function startJitterFallback() {
      if (jitterIntervalRef.current) return;
      jitterIntervalRef.current = setInterval(() => {
        setTelemetry(prev => {
          const jitter = (val: number, delta: number, min = 0, max = 100) => {
            const res = val + (Math.random() * delta * 2 - delta);
            return Math.min(Math.max(res, min), max);
          };

          const newCores = prev.cpu.cores.map(c => Number(jitter(c, 3.5, 5, 95).toFixed(1)));
          const overall = Number((newCores.reduce((a, b) => a + b, 0) / newCores.length).toFixed(1));
          const usedRam = Number(jitter(prev.ram.usedGb, 0.15, 3.8, 14.0).toFixed(2));
          const cachedRam = Number(jitter(prev.ram.cachedGb, 0.08, 2.5, 6.0).toFixed(2));
          const freeRam = Number((prev.ram.totalGb - usedRam - cachedRam).toFixed(2));

          return {
            timestamp: new Date().toISOString(),
            cpu: {
              overallUsage: overall,
              cores: newCores,
              loadAvg: [
                Number(jitter(prev.cpu.loadAvg[0], 0.05, 0.1, 4.0).toFixed(2)),
                Number(jitter(prev.cpu.loadAvg[1], 0.03, 0.1, 4.0).toFixed(2)),
                Number(jitter(prev.cpu.loadAvg[2], 0.02, 0.1, 4.0).toFixed(2))
              ]
            },
            ram: {
              totalGb: 16.0,
              usedGb: usedRam,
              cachedGb: cachedRam,
              freeGb: Math.max(freeRam, 0.5),
              usagePercent: Number(((usedRam / 16.0) * 100).toFixed(1))
            },
            network: {
              rxKbps: Number(jitter(prev.network.rxKbps, 80, 200, 10000).toFixed(1)),
              txKbps: Number(jitter(prev.network.txKbps, 150, 400, 25000).toFixed(1)),
              activeConnections: Math.floor(jitter(prev.network.activeConnections, 4, 20, 500)),
              packetLossPercent: 0.0
            },
            disk: {
              readIops: Math.floor(jitter(prev.disk.readIops, 15, 10, 800)),
              writeIops: Math.floor(jitter(prev.disk.writeIops, 30, 20, 2000)),
              diskUsagePercent: prev.disk.diskUsagePercent
            },
            activeAnomaliesCount: prev.activeAnomaliesCount
          };
        });
      }, 1200);
    }

    return () => {
      if (ws) {
        ws.close();
      }
      if (jitterIntervalRef.current) {
        clearInterval(jitterIntervalRef.current);
      }
    };
  }, []);

  return { telemetry, isConnected };
};
