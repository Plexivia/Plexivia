import mongoose from 'mongoose';

const DEFAULT_SECURE_URI = process.env.MONGODB_SECURE_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plexivia_secure_db';
const DEFAULT_OPERATIONS_URI = process.env.MONGODB_OPERATIONS_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plexivia_operations_db';

export let secureDbConnection: mongoose.Connection;
export let operationsDbConnection: mongoose.Connection;

// Initialize dual-tier database connections with failover
export const initDatabases = async (): Promise<{ secureDb: mongoose.Connection; operationsDb: mongoose.Connection }> => {
  const secureUri = process.env.MONGODB_SECURE_URI || process.env.MONGODB_URI || DEFAULT_SECURE_URI;
  const opsUri = process.env.MONGODB_OPERATIONS_URI || process.env.MONGODB_URI || DEFAULT_OPERATIONS_URI;

  try {
    secureDbConnection = mongoose.createConnection(secureUri, {
      serverSelectionTimeoutMS: 5000,
    });

    operationsDbConnection = mongoose.createConnection(opsUri, {
      serverSelectionTimeoutMS: 5000,
    });

    secureDbConnection.on('connected', () => {
      console.log('✅ [plexivia_secure_db] Connected to MongoDB Secure Database');
    });

    secureDbConnection.on('error', (err) => {
      console.warn('⚠️ [plexivia_secure_db] Connection error:', err.message);
    });

    operationsDbConnection.on('connected', () => {
      console.log('✅ [plexivia_operations_db] Connected to MongoDB Operations Database');
    });

    operationsDbConnection.on('error', (err) => {
      console.warn('⚠️ [plexivia_operations_db] Connection error:', err.message);
    });

    return { secureDb: secureDbConnection, operationsDb: operationsDbConnection };
  } catch (err: any) {
    console.warn('⚠️ Database initialization warning:', err.message);
    return { secureDb: secureDbConnection, operationsDb: operationsDbConnection };
  }
};
