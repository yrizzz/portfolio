import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
  _id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sessionToken: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

SessionSchema.index({ userId: 1 });

export const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
