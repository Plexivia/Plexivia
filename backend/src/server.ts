import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';

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
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.use(express.json());

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'backend-core',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    services: [
      { id: 'auth-service', name: 'Auth Service (IAM & Vault)', base: '/api/auth' },
      { id: 'hub-service', name: 'Hub Service (Core & Telemetry)', base: '/api/hub' },
      { id: 'agency-service', name: 'Agency Service (Clients, Projects, Tasks, Teams)', base: '/api/agency' },
      { id: 'finance-service', name: 'Finance Service (Invoices, Payments, Bills, Payroll)', base: '/api/finance' },
    ],
  });
});

// Mount modular core router
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Modular Micro-Backend Services v2.1.0`);
  console.log(`📡 HTTP Server listening on http://127.0.0.1:${PORT}`);
  console.log(`📦 Services: auth-service, hub-service, agency-service, finance-service`);
  console.log(`===================================================`);
});

export { app };
