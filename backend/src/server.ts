import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { initDatabases } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5095;

const allowedOrigins = [
  'http://localhost:8010',
  'http://127.0.0.1:8010',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://admin.plexivia.com',
  'https://hub.plexivia.com',
  'https://plexivia.com',
];

// Single line comment before CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Two-Factor-Token'],
}));

app.use(express.json());

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'backend-gateway',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: [
      { id: 'auth-service', name: 'Auth Service (IAM & Vault)', port: 5001, base: '/api/v1/auth' },
      { id: 'hub-service', name: 'Hub Service (Core & Telemetry)', port: 5002, base: '/api/v1/hub' },
      { id: 'agency-service', name: 'Agency Service (Clients, Projects, Tasks, Teams)', port: 5003, base: '/api/v1/agency' },
      { id: 'finance-service', name: 'Finance Service (Invoices, Payments, Bills, Payroll)', port: 5004, base: '/api/v1/finance' },
    ],
  });
});

// Mount modular core router
app.use('/api', apiRoutes);

// Start unified gateway server
const startServer = async () => {
  await initDatabases();
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Plexivia Backend Gateway & Microservices v2.0.0`);
    console.log(`📡 HTTP Server listening on http://127.0.0.1:${PORT}`);
    console.log(`📦 Services: auth-service, hub-service, agency-service, finance-service`);
    console.log(`===================================================`);
  });
};

startServer();

export { app };
