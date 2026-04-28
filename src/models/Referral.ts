import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  // Quien refirió
  referrerId: mongoose.Types.ObjectId;
  // Quien se registró usando el código
  referredUserId: mongoose.Types.ObjectId;
  // Código usado
  code: string;
  // Estado del referido
  status: 'pending' | 'rewarded' | 'expired';
  // Cuándo el referido hizo su primer pago (activa la recompensa)
  rewardedAt?: Date;
  // Descuento aplicado al referidor (en MXN)
  rewardAmount: number;
  // Si el crédito ya fue aplicado en una renovación
  creditApplied: boolean;
  creditAppliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Un usuario solo puede haber sido referido una vez
    },
    code: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'rewarded', 'expired'],
      default: 'pending',
    },
    rewardedAt: Date,
    rewardAmount: {
      type: Number,
      default: 100, // $100 MXN de crédito
    },
    creditApplied: {
      type: Boolean,
      default: false,
    },
    creditAppliedAt: Date,
  },
  { timestamps: true }
);

export const Referral =
  mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
