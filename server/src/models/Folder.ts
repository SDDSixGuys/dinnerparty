import mongoose, { Schema, Document } from "mongoose";

const folderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
      index: true,
    },
    // Materialized path for efficient subtree queries
    // e.g., "/rootId/parentId/thisId"
    path: {
      type: String,
      default: "/",
      index: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    color: { type: String, default: "" },
    icon: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
folderSchema.index({ userId: 1, parentId: 1 });
folderSchema.index({ userId: 1, path: 1 });

export interface IFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  parentId: mongoose.Types.ObjectId | null;
  path: string;
  depth: number;
  sortOrder: number;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export default mongoose.model<IFolder>("Folder", folderSchema);
