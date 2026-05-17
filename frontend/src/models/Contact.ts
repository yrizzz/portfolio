import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReply {
  id: string;
  name: string;
  email?: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface IContact extends Document {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  replied: boolean;
  replyMessage?: string;
  repliedAt?: Date;
  replies: IReply[];
  ipAddress?: string;
  createdAt: Date;
}

const ReplySchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    replied: {
      type: Boolean,
      default: false,
    },
    replyMessage: {
      type: String,
      required: false,
    },
    repliedAt: {
      type: Date,
      required: false,
    },
    replies: {
      type: [ReplySchema],
      default: [],
    },
    ipAddress: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
