import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5095;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'plexi-backend-core',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    collections: ['user', 'project', 'task', 'client', 'team'],
    endpoints: [
      '/api/auth/login',
      '/api/auth/me',
      '/api/users',
      '/api/clients',
      '/api/projects',
      '/api/tasks',
      '/api/teams',
    ]
  });
});

// Mount modular core router
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Plexivia Core Backend Service v2.0.0`);
  console.log(`📡 HTTP Server listening on http://127.0.0.1:${PORT}`);
  console.log(`📦 Collections: User, Project, Task, Client, Team`);
  console.log(`===================================================`);
});

export { app };
