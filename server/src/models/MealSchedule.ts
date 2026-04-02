import mongoose, { Schema, Document } from "mongoose";

const scheduledMealSchema = new Schema(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    servings: { type: Number, default: 1 },
    notes: { type: String, trim: true },
    // Copied from recipe at schedule time for conflict detection
    equipment: [{ type: String, trim: true }],
  },
  { _id: true }
);

const mealScheduleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    meals: [scheduledMealSchema],
  },
  {
    timestamps: true,
  }
);

// One schedule document per user per day
mealScheduleSchema.index({ userId: 1, date: 1 }, { unique: true });

export interface IScheduledMeal {
  recipeId: mongoose.Types.ObjectId;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  notes?: string;
  equipment: string[];
}

export interface IMealSchedule extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  meals: IScheduledMeal[];
  createdAt: Date;
  updatedAt: Date;
}

export default mongoose.model<IMealSchedule>("MealSchedule", mealScheduleSchema);
