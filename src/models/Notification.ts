import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'welcome' | 'subscription' | 'profile_approved' | 'profile_rejected' | 'profile_verified' | 'payment' | 'favorite' | 'reminder' | 'general';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['welcome', 'subscription', 'profile_approved', 'profile_rejected', 'profile_verified', 'payment', 'favorite', 'reminder', 'general'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para queries eficientes
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
