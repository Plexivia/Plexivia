import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';
import { generateDId } from '../utils/dId.js';

export interface IProjectType extends Document {
  dId: string;
  name: string;
  key: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

const ProjectTypeSchema = new Schema<IProjectType>(
  {
    dId: { type: String, required: true, unique: true, index: true, default: generateDId },
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'project_types', timestamps: false }
);

// Retrieve or compile ProjectType model
export const getProjectTypeModel = (): mongoose.Model<IProjectType> => {
  if (operationsDbConnection) {
    return operationsDbConnection.models.ProjectType || operationsDbConnection.model<IProjectType>('ProjectType', ProjectTypeSchema);
  }
  return mongoose.models.ProjectType || mongoose.model<IProjectType>('ProjectType', ProjectTypeSchema);
};

// Seed initial default project types (WhiteLabel Ecommerce, Custom, ERP)
export const seedDefaultProjectTypes = async (conn: mongoose.Connection) => {
  try {
    const col = conn.collection('project_types');
    const defaultTypes = [
      {
        dId: generateDId(),
        name: 'WhiteLabel Ecommerce',
        key: 'whitelabel_ecommerce',
        description: 'Multi-tenant white-label ecommerce storefront and merchant operations',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        dId: generateDId(),
        name: 'Custom',
        key: 'custom',
        description: 'Bespoke custom software engineering and application architecture',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        dId: generateDId(),
        name: 'ERP',
        key: 'erp',
        description: 'Enterprise resource planning, internal workflows, and business automation',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    for (const item of defaultTypes) {
      const exists = await col.findOne({ key: item.key });
      if (!exists) {
        await col.insertOne(item);
        console.log(`📦 [project_types] Seeded project type: ${item.name} (dId: ${item.dId})`);
      }
    }
  } catch (err: any) {
    console.warn('⚠️ [seedDefaultProjectTypes] notice:', err.message);
  }
};
