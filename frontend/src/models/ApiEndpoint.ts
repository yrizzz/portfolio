import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiEndpoint extends Document {
  _id: string;
  name: string;
  description?: string;
  method: string;
  path: string;
  category?: string;
  language: string;
  rawScript: string;
  code: string;
  aiAnalysis?: string;
  enabled: boolean;
  status: string;
  requiresAuth: boolean;
  rateLimit: number;
  params?: string;
  exampleCode?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedReason?: string;
}

const ApiEndpointSchema = new Schema<IApiEndpoint>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: false,
    },
    language: {
      type: String,
      required: true,
    },
    rawScript: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    aiAnalysis: {
      type: String,
      required: false,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'pending',
    },
    requiresAuth: {
      type: Boolean,
      default: false,
    },
    rateLimit: {
      type: Number,
      default: 100,
    },
    params: {
      type: String,
      required: false,
    },
    exampleCode: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    approvedAt: {
      type: Date,
      required: false,
    },
    approvedBy: {
      type: String,
      required: false,
    },
    rejectedReason: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ApiEndpoint: Model<IApiEndpoint> = mongoose.models.ApiEndpoint || mongoose.model<IApiEndpoint>('ApiEndpoint', ApiEndpointSchema);
