import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetType: 'user' | 'profile' | 'payment' | 'verification' | 'system';
  targetId?: mongoose.Types.ObjectId;
  details: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'profile', 'payment', 'verification', 'system'],
    },
    targetId: Schema.Types.ObjectId,
    details: {
      type: String,
      required: true,
    },
    metadata: Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AdminLogSchema.index({ createdAt: -1 });

export const AdminLog = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
