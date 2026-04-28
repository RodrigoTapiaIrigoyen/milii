import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketReply {
  from: 'admin' | 'user';
  message: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  plan: 'free' | 'premium' | 'vip';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
  replies: ITicketReply[];
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },
    plan: { type: String, enum: ['free', 'premium', 'vip'], default: 'free' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    adminNotes: String,
    resolvedAt: Date,
    replies: [
      {
        from: { type: String, enum: ['admin', 'user'], required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

SupportTicketSchema.index({ userId: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ plan: 1 });
SupportTicketSchema.index({ createdAt: -1 });

export const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
