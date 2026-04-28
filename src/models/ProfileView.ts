import mongoose, { Schema, Document } from 'mongoose';

export interface IProfileView extends Document {
  profileId: mongoose.Types.ObjectId;
  viewerId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  viewedAt: Date;
}

const ProfileViewSchema = new Schema<IProfileView>({
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true,
  },
  viewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  ipAddress: {
    type: String,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

ProfileViewSchema.index({ profileId: 1, viewedAt: -1 });

const ProfileView = mongoose.models.ProfileView || mongoose.model<IProfileView>('ProfileView', ProfileViewSchema);
export default ProfileView;
