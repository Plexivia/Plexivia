import { Router } from 'express';
import {
  getTickets,
  createTicket,
  getDocs,
  ingestTelemetry,
} from '../controllers/hubController.js';

export const hubRouter = Router();

// Route: Tickets
hubRouter.get('/tickets', getTickets);
hubRouter.post('/tickets', createTicket);

// Route: Docs
hubRouter.get('/docs', getDocs);

// Route: Telemetry
hubRouter.post('/telemetry', ingestTelemetry);
