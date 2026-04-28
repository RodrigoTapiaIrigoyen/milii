import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  profileId: mongoose.Types.ObjectId; // Perfil que está siendo evaluado
  reviewerId: mongoose.Types.ObjectId; // Usuario que hace la review
  rating: number; // 1-5 estrellas
  comment: string;
  isVerified: boolean; // Si se verificó que el usuario contrató el servicio
  helpful: number; // Contador de "útil"
  unhelpful: number; // Contador de "no útil"
  helpfulBy: mongoose.Types.ObjectId[]; // IDs de usuarios que votaron útil
  unhelpfulBy: mongoose.Types.ObjectId[]; // IDs de usuarios que votaron no útil
  response?: string; // Respuesta del dueño del perfil
  respondedAt?: Date;
  status: 'pending' | 'approved' | 'rejected'; // Moderación
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    unhelpfulBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    response: {
      type: String,
      maxlength: 500,
    },
    respondedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Índices
reviewSchema.index({ profileId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ status: 1 });

// Prevenir múltiples reviews del mismo usuario al mismo perfil
reviewSchema.index(
  { profileId: 1, reviewerId: 1 },
  { unique: true }
);

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review;
