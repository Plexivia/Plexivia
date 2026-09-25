import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { hubRouter } from './routes/hub.routes.js';
import { connectHubDb } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.HUB_SERVICE_PORT || process.env.PORT || 5002;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hub-service', version: '2.0.0', timestamp: new Date().toISOString() });
});

// Register routes
app.use('/api/v1/hub', hubRouter);
app.use('/api/hub', hubRouter);

// Start server
const startServer = async () => {
  await connectHubDb();
  app.listen(PORT, () => {
    console.log(`📡 [hub-service] running on port ${PORT}`);
  });
};

startServer();
