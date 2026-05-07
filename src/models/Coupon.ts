import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  plan: 'premium' | 'vip';
  months: number;
  maxUses: number;
  usedCount: number;
  usedBy: mongoose.Types.ObjectId[];
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    plan: { type: String, enum: ['premium', 'vip'], default: 'premium' },
    months: { type: Number, default: 3 },
    maxUses: { type: Number, default: 50 },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
