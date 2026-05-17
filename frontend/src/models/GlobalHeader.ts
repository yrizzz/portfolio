import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalHeader extends Document {
  userId: string;
  name: string;
  description?: string;
  service: string; // instagram, tiktok, twitter, etc
  headers: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalHeaderSchema = new Schema<IGlobalHeader>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    service: {
      type: String,
      required: true,
      enum: ['instagram', 'tiktok', 'twitter', 'facebook', 'youtube', 'custom'],
      index: true,
    },
    headers: {
      type: Schema.Types.Mixed, // Accept both Map and Object
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk query cepat
GlobalHeaderSchema.index({ userId: 1, service: 1 });
GlobalHeaderSchema.index({ userId: 1, isActive: 1 });

export const GlobalHeader = mongoose.models.GlobalHeader || mongoose.model<IGlobalHeader>('GlobalHeader', GlobalHeaderSchema);
