import mongoose from 'mongoose';
import { hashPassword } from '../utils/security.js';
import { seedDefaultProjectTypes } from '../models/ProjectType.js';
import { seedDefaultWhiteLabelProjects } from '../models/WhiteLabelEcommerce.js';

const DEFAULT_SECURE_URI = process.env.MONGODB_SECURE_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27025/plexivia_secure_db';
const DEFAULT_OPERATIONS_URI = process.env.MONGODB_OPERATIONS_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27025/plexivia_operations_db';

export let secureDbConnection: mongoose.Connection;
export let operationsDbConnection: mongoose.Connection;

// Ensure initial super admin account exists in secure database
const seedSuperAdmin = async (conn: mongoose.Connection) => {
  try {
    const admins = conn.collection('admins');
    const adminEmail = (process.env.ADMIN_EMAIL || 'plexivia.ikram@gmail.com').trim().toLowerCase();
    const existing = await admins.findOne({ email: adminEmail });
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (existing && !existing.password_hash && initialPassword) {
      await admins.updateOne(
        { _id: existing._id },
        { $set: { password_hash: hashPassword(initialPassword), updated_at: new Date().toISOString() } }
      );
      console.log('👑 [plexivia_secure_db] Super Admin password initialized from ADMIN_INITIAL_PASSWORD.');
    }

    if (!existing) {
      await admins.insertOne({
        email: adminEmail,
        ...(initialPassword ? { password_hash: hashPassword(initialPassword) } : {}),
        full_name: 'Plexivia Super Owner',
        role: 'OWNER',
        is_active: true,
        two_factor_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log('👑 [plexivia_secure_db] Initial Super Admin initialized.');
    }
  } catch (err: any) {
    console.warn('⚠️ [seedSuperAdmin] notice:', err.message);
  }
};

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
      seedSuperAdmin(secureDbConnection);
    });

    secureDbConnection.on('error', (err) => {
      console.warn('⚠️ [plexivia_secure_db] Connection error:', err.message);
    });

    operationsDbConnection.on('connected', () => {
      console.log('✅ [plexivia_operations_db] Connected to MongoDB Operations Database');
      seedDefaultProjectTypes(operationsDbConnection);
      seedDefaultWhiteLabelProjects(operationsDbConnection);
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

