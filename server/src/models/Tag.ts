import mongoose, { Schema, Document } from 'mongoose';

const tagSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
    },
    color: { type: String, default: '#808080' },
  },
  {
    timestamps: true,
  }
);

// Enforce uniqueness per user (no duplicate tag names for same user)
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export interface ITag extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export default mongoose.model<ITag>('Tag', tagSchema);
