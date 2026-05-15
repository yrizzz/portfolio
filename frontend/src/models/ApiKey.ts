import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiKey extends Document {
  _id: string;
  key: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

ApiKeySchema.index({ userId: 1 });
ApiKeySchema.index({ key: 1 });

export const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
