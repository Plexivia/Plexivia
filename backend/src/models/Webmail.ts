import mongoose, { Schema, Document } from 'mongoose';
import { operationsDbConnection } from '../config/database.js';

export interface IMailAddress {
  name: string;
  address: string;
}

export interface IMailMessage extends Document {
  folder: string;
  uid?: number;
  messageId?: string;
  inReplyTo?: string;
  threadId?: string;
  from: IMailAddress;
  to: IMailAddress[];
  cc: IMailAddress[];
  subject: string;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  attachments: { filename: string; size: number; contentType: string }[];
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IMailSettings extends Document {
  key: string;
  imap: { isEnabled: boolean; host: string; port: number; secure: boolean; user: string; password: string };
  forwardTo: string;
  updated_at: Date;
}

export interface INotification extends Document {
  type: string;
  title: string;
  description: string;
  link: string;
  isRead: boolean;
  created_at: Date;
}

const AddressSchema = new Schema<IMailAddress>({ name: { type: String, default: '' }, address: { type: String, default: '' } }, { _id: false });

const MailMessageSchema = new Schema<IMailMessage>(
  {
    folder: { type: String, required: true, index: true },
    uid: { type: Number },
    messageId: { type: String, index: true },
    inReplyTo: { type: String },
    threadId: { type: String, index: true },
    from: { type: AddressSchema, default: () => ({}) },
    to: { type: [AddressSchema], default: [] },
    cc: { type: [AddressSchema], default: [] },
    subject: { type: String, default: '(no subject)' },
    snippet: { type: String, default: '' },
    bodyText: { type: String, default: '' },
    bodyHtml: { type: String, default: '' },
    attachments: { type: [{ filename: String, size: Number, contentType: String, _id: false }], default: [] },
    date: { type: Date, default: Date.now, index: true },
    isRead: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// A server message is stored once per folder; locally sent records have no uid
MailMessageSchema.index({ folder: 1, uid: 1 }, { unique: true, partialFilterExpression: { uid: { $type: 'number' } } });
MailMessageSchema.index({ subject: 'text', snippet: 'text', 'from.address': 'text', 'from.name': 'text' });

const MailSettingsSchema = new Schema<IMailSettings>(
  {
    key: { type: String, default: 'default', unique: true },
    imap: {
      isEnabled: { type: Boolean, default: false },
      host: { type: String, default: '' },
      port: { type: Number, default: 993 },
      secure: { type: Boolean, default: true },
      user: { type: String, default: '' },
      password: { type: String, default: '' },
    },
    forwardTo: { type: String, default: '' },
  },
  { timestamps: { createdAt: false, updatedAt: 'updated_at' } }
);

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

export const getMailMessageModel = (): mongoose.Model<IMailMessage> => {
  if (operationsDbConnection) return operationsDbConnection.models.MailMessage || operationsDbConnection.model<IMailMessage>('MailMessage', MailMessageSchema, 'mail_messages');
  return mongoose.models.MailMessage || mongoose.model<IMailMessage>('MailMessage', MailMessageSchema, 'mail_messages');
};

export const getMailSettingsModel = (): mongoose.Model<IMailSettings> => {
  if (operationsDbConnection) return operationsDbConnection.models.MailSettings || operationsDbConnection.model<IMailSettings>('MailSettings', MailSettingsSchema, 'mail_settings');
  return mongoose.models.MailSettings || mongoose.model<IMailSettings>('MailSettings', MailSettingsSchema, 'mail_settings');
};

export const getNotificationModel = (): mongoose.Model<INotification> => {
  if (operationsDbConnection) return operationsDbConnection.models.Notification || operationsDbConnection.model<INotification>('Notification', NotificationSchema, 'notifications');
  return mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema, 'notifications');
};
