import mongoose from 'mongoose';

const DEFAULT_SECURE_URI = process.env.MONGODB_SECURE_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plexivia_secure_db';

export let secureDb: mongoose.Connection;

// Connect to secure database for finance service
export const connectFinanceDb = async (): Promise<mongoose.Connection> => {
  const uri = process.env.MONGODB_SECURE_URI || DEFAULT_SECURE_URI;
  try {
    secureDb = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 });
    secureDb.on('connected', () => console.log('💳 [finance-service] Connected to plexivia_secure_db'));
    secureDb.on('error', (err) => console.warn('⚠️ [finance-service] DB error:', err.message));
    return secureDb;
  } catch (err: any) {
    console.warn('⚠️ [finance-service] DB connect warning:', err.message);
    return secureDb;
  }
};
