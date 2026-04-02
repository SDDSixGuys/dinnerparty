import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const themePreferencesSchema = new Schema(
  {
    mode: {
      type: String,
      enum: ["light", "dark", "custom"],
      default: "light",
    },
    primaryColor: { type: String, default: "#4A90D9" },
    accentColor: { type: String, default: "#F5A623" },
    backgroundColor: { type: String, default: "#FFFFFF" },
    fontFamily: { type: String, default: "Inter" },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    avatarUrl: { type: String, default: "" },

    // Account state
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Preferences
    theme: { type: themePreferencesSchema, default: () => ({}) },
    defaultServings: { type: Number, default: 4 },
    measurementSystem: {
      type: String,
      enum: ["metric", "imperial"],
      default: "imperial",
    },

    // Root folder created on registration
    rootFolderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export interface IUser extends Document {
  uuid: string;
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string;
  avatarUrl: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  theme: {
    mode: "light" | "dark" | "custom";
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  defaultServings: number;
  measurementSystem: "metric" | "imperial";
  rootFolderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export default mongoose.model<IUser>("User", userSchema);
