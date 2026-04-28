import mongoose, { Schema, Document } from 'mongoose';

export interface IVerification extends Document {
  userId: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;
  idDocumentUrl: string;
  selfieUrl: string;
  documentType: 'ine' | 'pasaporte' | 'licencia';
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
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
    idDocumentUrl: {
      type: String,
      required: true,
    },
    selfieUrl: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      enum: ['ine', 'pasaporte', 'licencia'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    rejectReason: String,
  },
  { timestamps: true }
);

VerificationSchema.index({ userId: 1 });
VerificationSchema.index({ status: 1 });

export const Verification = mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema);
