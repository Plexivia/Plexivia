import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { TelemetryHub } from './websocket/telemetryHub.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5095;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'plexi-hub-server',
    version: '1.0.3',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/version',
      '/api/projects',
      '/api/issues',
      '/api/docs',
      '/api/cpanel/fleet-overview',
      '/api/guard/health',
      '/api/guard/telemetry',
      '/api/mail/health',
      '/api/mail/logs',
      '/api/gitea/status',
      '/api/backup/status',
      '/api/backup/trigger',
      '/ws/telemetry'
    ]
  });
});

// Mount modular microservices router
app.use('/api', apiRoutes);

const httpServer = createServer(app);

// Initialize real-time WebSocket telemetry broadcaster
TelemetryHub.initialize(httpServer);

httpServer.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Plexivia API Gateway & Microservices Bridge v1.0.3`);
  console.log(`📡 HTTP Server listening on http://127.0.0.1:${PORT}`);
  console.log(`⚡ WebSocket Telemetry stream at ws://127.0.0.1:${PORT}/ws/telemetry`);
  console.log(`===================================================`);
});

export { app, httpServer };
