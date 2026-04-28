import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'admin';
  accountType: 'profesional' | 'cliente';
  status: 'active' | 'suspended' | 'banned';
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLogin?: Date;
  // Programa de referidos
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referralCredit: number; // Saldo acumulado en MXN para aplicar en próxima renovación
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    accountType: {
      type: String,
      enum: ['profesional', 'cliente'],
      default: 'cliente',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    lastLogin: Date,
    // Programa de referidos
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // permite null sin violar unique
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralCredit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password antes de guardar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
