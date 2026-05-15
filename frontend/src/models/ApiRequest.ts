import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiRequest extends Document {
  _id: string;
  apiKeyId?: string;
  userId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
}

const ApiRequestSchema = new Schema<IApiRequest>(
  {
    apiKeyId: {
      type: String,
      required: false,
      ref: 'ApiKey',
    },
    userId: {
      type: String,
      required: false,
      ref: 'User',
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ApiRequestSchema.index({ apiKeyId: 1 });
ApiRequestSchema.index({ userId: 1 });
ApiRequestSchema.index({ createdAt: -1 });

export const ApiRequest: Model<IApiRequest> = mongoose.models.ApiRequest || mongoose.model<IApiRequest>('ApiRequest', ApiRequestSchema);
