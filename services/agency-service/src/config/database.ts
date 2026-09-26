import mongoose from 'mongoose';
import { seedDefaultProjectTypes } from '../models/ProjectType.js';
import { seedDefaultWhiteLabelProjects } from '../models/WhiteLabelEcommerce.js';

const DEFAULT_OPERATIONS_URI = process.env.MONGODB_OPERATIONS_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plexivia_operations_db';

export let operationsDb: mongoose.Connection;
export let operationsDbConnection: mongoose.Connection;

// Connect to operations database for agency service
export const connectAgencyDb = async (): Promise<mongoose.Connection> => {
  const uri = process.env.MONGODB_OPERATIONS_URI || DEFAULT_OPERATIONS_URI;
  try {
    operationsDb = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 });
    operationsDbConnection = operationsDb;
    operationsDb.on('connected', () => {
      console.log('🏢 [agency-service] Connected to plexivia_operations_db');
      seedDefaultProjectTypes(operationsDb);
      seedDefaultWhiteLabelProjects(operationsDb);
    });
    operationsDb.on('error', (err) => console.warn('⚠️ [agency-service] DB error:', err.message));
    return operationsDb;
  } catch (err: any) {
    console.warn('⚠️ [agency-service] DB connect warning:', err.message);
    return operationsDb;
  }
};

