import mongoose, { Schema, Document } from 'mongoose';

export interface IProfileClick extends Document {
  profileId: mongoose.Types.ObjectId;
  clickerId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  clickType?: string;
  clickedAt: Date;
}

const ProfileClickSchema = new Schema<IProfileClick>({
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true,
  },
  clickerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  ipAddress: {
    type: String,
  },
  clickType: {
    type: String,
  },
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

ProfileClickSchema.index({ profileId: 1, clickedAt: -1 });

const ProfileClick = mongoose.models.ProfileClick || mongoose.model<IProfileClick>('ProfileClick', ProfileClickSchema);
export default ProfileClick;
