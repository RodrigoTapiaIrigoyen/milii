import mongoose, { Schema, Document } from 'mongoose';

export interface ISanction extends Document {
  userId: mongoose.Types.ObjectId;
  profileId?: mongoose.Types.ObjectId;
  type: 'warning' | 'temporary_suspension' | 'permanent_suspension' | 'account_ban';
  category: string;
  reason: string;
  appliedBy: mongoose.Types.ObjectId;
  appliedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'appealed';
  createdAt: Date;
}

const SanctionSchema = new Schema<ISanction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
    },
    type: {
      type: String,
      enum: ['warning', 'temporary_suspension', 'permanent_suspension', 'account_ban'],
      required: true,
    },
    category: String,
    reason: String,
    appliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'appealed'],
      default: 'active',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SanctionSchema.index({ userId: 1 });
SanctionSchema.index({ status: 1 });

export const Sanction = mongoose.models.Sanction || mongoose.model<ISanction>('Sanction', SanctionSchema);
