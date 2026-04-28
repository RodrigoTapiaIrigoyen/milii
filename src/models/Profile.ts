import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  gender: 'Mujer' | 'Hombre' | 'Trans Femenina' | 'Trans Masculino' | 'No binario';
  description: string;
  whatsapp: string;
  telegram: string;
  photos: string[];
  services: string[];
  pricing: {
    hourlyRate?: number;
    serviceRate?: number;
    currency: string;
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: Date;
    documents: string[];
  };
  status: {
    isActive: boolean;
    isSuspended: boolean;
    suspensionReason: string;
  };
  // Sistema de aprobación por admin (antifraude)
  approvalStatus: 'draft' | 'pending_review' | 'approved' | 'rejected';
  // Prioridad de revisión según plan (vip → priority → normal)
  verificationPriority: 'normal' | 'priority' | 'vip';
  approvalNotes?: string;        // Motivo de rechazo o notas del admin
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  submittedAt?: Date;            // Cuando el usuario envió a revisión
  submissionIp?: string;         // IP del envío para detectar fraudes
  fraudFlags: string[];          // Alertas automáticas de fraude detectadas
  isPublished: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  location: {
    country: string;
    state: string;
    city: string;
    zone: string;
  };
  stats: {
    views: number;
    whatsappClicks: number;
    favorites: number;
  };
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      enum: ['Mujer', 'Hombre', 'Trans Femenina', 'Trans Masculino', 'No binario'],
      required: true,
    },
    description: String,
    whatsapp: String,
    telegram: String,
    photos: [String],
    services: [String],
    pricing: {
      hourlyRate: Number,
      serviceRate: Number,
      currency: { type: String, default: 'MXN' },
    },
    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      documents: [String],
    },
    status: {
      isActive: { type: Boolean, default: true },
      isSuspended: { type: Boolean, default: false },
      suspensionReason: String,
    },
    // Sistema de aprobación admin (antifraude)
    approvalStatus: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected'],
      default: 'draft',
    },
    verificationPriority: {
      type: String,
      enum: ['normal', 'priority', 'vip'],
      default: 'normal',
    },
    approvalNotes: String,
    approvedAt: Date,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    submittedAt: Date,
    submissionIp: String,
    fraudFlags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    location: {
      country: { type: String, default: 'México' },
      state: String,
      city: String,
      zone: String,
    },
    stats: {
      views: { type: Number, default: 0 },
      whatsappClicks: { type: Number, default: 0 },
      favorites: { type: Number, default: 0 },
    },
    publishedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

ProfileSchema.index({ userId: 1 });
ProfileSchema.index({ isPublished: 1 });
ProfileSchema.index({ approvalStatus: 1 });
ProfileSchema.index({ 'verification.isVerified': 1 });
ProfileSchema.index({ 'location.state': 1 });
ProfileSchema.index({ submittedAt: -1 });

export const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
