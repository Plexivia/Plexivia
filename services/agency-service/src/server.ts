import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agencyRouter } from './routes/agency.routes.js';
import { connectAgencyDb } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.AGENCY_SERVICE_PORT || process.env.PORT || 5003;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'agency-service', version: '2.0.0', timestamp: new Date().toISOString() });
});

// Register routes
app.use('/api/v1/agency', agencyRouter);
app.use('/api/agency', agencyRouter);

// Start server
const startServer = async () => {
  await connectAgencyDb();
  app.listen(PORT, () => {
    console.log(`🏢 [agency-service] running on port ${PORT}`);
  });
};

startServer();
