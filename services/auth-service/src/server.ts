import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes.js';
import { connectAuthDb } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || process.env.PORT || 5001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', version: '2.0.0', timestamp: new Date().toISOString() });
});

// Register routes
app.use('/api/v1/auth', authRouter);
app.use('/api/auth', authRouter);

// Start server
const startServer = async () => {
  await connectAuthDb();
  app.listen(PORT, () => {
    console.log(`🚀 [auth-service] running on port ${PORT}`);
  });
};

startServer();
