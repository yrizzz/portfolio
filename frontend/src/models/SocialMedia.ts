import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISocialMedia extends Document {
  _id: string;
  platform: string;
  url: string;
  icon?: string;
  order: number;
  visible: boolean;
}

const SocialMediaSchema = new Schema<ISocialMedia>(
  {
    platform: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: false,
  }
);

export const SocialMedia: Model<ISocialMedia> = mongoose.models.SocialMedia || mongoose.model<ISocialMedia>('SocialMedia', SocialMediaSchema);
