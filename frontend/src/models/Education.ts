import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEducation extends Document {
  _id: string;
  degree: string;
  institution: string;
  location: string;
  period: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Education: Model<IEducation> = mongoose.models.Education || mongoose.model<IEducation>('Education', EducationSchema);
