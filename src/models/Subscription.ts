import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;
  plan: 'free' | 'premium' | 'vip';
  status: 'active' | 'expired' | 'cancelled';
  priceAmount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  nextBillingDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'premium', 'vip'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    priceAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'MXN',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    nextBillingDate: Date,
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, profileId: 1 });
SubscriptionSchema.index({ status: 1 });

export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
