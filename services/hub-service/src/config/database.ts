import mongoose from 'mongoose';

const DEFAULT_OPERATIONS_URI = process.env.MONGODB_OPERATIONS_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plexivia_operations_db';

export let operationsDb: mongoose.Connection;

// Connect to operations database for hub service
export const connectHubDb = async (): Promise<mongoose.Connection> => {
  const uri = process.env.MONGODB_OPERATIONS_URI || DEFAULT_OPERATIONS_URI;
  try {
    operationsDb = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 });
    operationsDb.on('connected', () => console.log('📡 [hub-service] Connected to plexivia_operations_db'));
    operationsDb.on('error', (err) => console.warn('⚠️ [hub-service] DB error:', err.message));
    return operationsDb;
  } catch (err: any) {
    console.warn('⚠️ [hub-service] DB connect warning:', err.message);
    return operationsDb;
  }
};
