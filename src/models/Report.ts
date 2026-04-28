import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId; // Usuario que reporta
  reportedProfileId: mongoose.Types.ObjectId; // Perfil reportado
  reportedUserId: mongoose.Types.ObjectId; // Usuario dueño del perfil reportado
  category: 'inappropriate_content' | 'fake_profile' | 'spam' | 'harassment' | 'other';
  reason: string; // Descripción detallada del reporte
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  actionTaken?: string; // Acción tomada por el admin
  reviewedBy?: mongoose.Types.ObjectId; // Admin que revisó
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['inappropriate_content', 'fake_profile', 'spam', 'harassment', 'other'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
    },
    actionTaken: {
      type: String,
      maxlength: 500,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
reportSchema.index({ reportedProfileId: 1, status: 1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

// Prevenir reportes duplicados del mismo usuario al mismo perfil en las últimas 24 horas
reportSchema.index(
  { reporterId: 1, reportedProfileId: 1, createdAt: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  }
);

const Report = mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema);

export default Report;
