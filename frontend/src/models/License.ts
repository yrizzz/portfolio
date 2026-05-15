import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILicense extends Document {
  _id: string;
  userId: string;
  type: string;
  price: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  createdAt: Date;
}

const LicenseSchema = new Schema<ILicense>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

LicenseSchema.index({ userId: 1 });

export const License: Model<ILicense> = mongoose.models.License || mongoose.model<ILicense>('License', LicenseSchema);
