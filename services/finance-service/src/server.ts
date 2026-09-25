import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { financeRouter } from './routes/finance.routes.js';
import { connectFinanceDb } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.FINANCE_SERVICE_PORT || process.env.PORT || 5004;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'finance-service', version: '2.0.0', timestamp: new Date().toISOString() });
});

// Register routes
app.use('/api/v1/finance', financeRouter);
app.use('/api/finance', financeRouter);

// Start server
const startServer = async () => {
  await connectFinanceDb();
  app.listen(PORT, () => {
    console.log(`💳 [finance-service] running on port ${PORT}`);
  });
};

startServer();
