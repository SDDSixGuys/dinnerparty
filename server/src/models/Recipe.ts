import mongoose, { Schema, Document } from 'mongoose';

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number },
    unit: { type: String, trim: true },
    notes: { type: String, trim: true },
    group: { type: String, trim: true },
  },
  { _id: false }
);

const instructionStepSchema = new Schema(
  {
    stepNumber: { type: Number, required: true },
    text: { type: String, required: true },
    timerMinutes: { type: Number },
    group: { type: String, trim: true },
  },
  { _id: false }
);

const macrosSchema = new Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    isPerServing: { type: Boolean, default: true },
  },
  { _id: false }
);

const recipeSchema = new Schema(
  {
    // Ownership
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Core fields
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true, maxlength: 2000 },
    imageUrl: { type: String, default: '' },

    // Ingredients and instructions (embedded)
    ingredients: [ingredientSchema],
    instructions: [instructionStepSchema],

    // Timing
    prepTimeMinutes: { type: Number, default: 0 },
    cookTimeMinutes: { type: Number, default: 0 },
    totalTimeMinutes: { type: Number, default: 0 },

    // Servings
    servings: { type: Number, default: 4 },
    servingSize: { type: String, trim: true },

    // Nutrition
    macros: { type: macrosSchema, default: () => ({}) },

    // Classification
    cuisine: { type: String, trim: true },
    course: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    // Tags (references to Tag collection)
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],

    // Folder placement
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      index: true,
    },

    // Source tracking
    sourceUrl: { type: String, trim: true },
    sourceType: {
      type: String,
      enum: ['manual', 'url_import', 'shared_copy'],
      default: 'manual',
    },
    sharedFromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    originalRecipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
    },

    // Kitchen equipment needed (for scheduling)
    equipment: [{ type: String, trim: true }],

    // Personal notes
    notes: { type: String, trim: true, maxlength: 5000 },

    // Pairing suggestions
    pairsWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],

    // Favorite flag
    isFavorite: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
recipeSchema.index({ userId: 1, title: 1 });
recipeSchema.index({ userId: 1, folderId: 1 });
recipeSchema.index({ userId: 1, tags: 1 });
recipeSchema.index({ userId: 1, isFavorite: 1 });

// Text index for full-text search
recipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text',
  cuisine: 'text',
  course: 'text',
  notes: 'text',
});

export interface IRecipe extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  imageUrl: string;
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    notes?: string;
    group?: string;
  }>;
  instructions: Array<{
    stepNumber: number;
    text: string;
    timerMinutes?: number;
    group?: string;
  }>;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  servingSize?: string;
  macros: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sugar: number;
    sodium: number;
    isPerServing: boolean;
  };
  cuisine?: string;
  course?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: mongoose.Types.ObjectId[];
  folderId?: mongoose.Types.ObjectId;
  sourceUrl?: string;
  sourceType: 'manual' | 'url_import' | 'shared_copy';
  sharedFromUserId?: mongoose.Types.ObjectId;
  originalRecipeId?: mongoose.Types.ObjectId;
  equipment: string[];
  notes?: string;
  pairsWith: mongoose.Types.ObjectId[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default mongoose.model<IRecipe>('Recipe', recipeSchema);
