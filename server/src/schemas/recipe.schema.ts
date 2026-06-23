import { z } from "zod";

export const createRecipeSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or fewer"),
    description: z.string().max(2000, "Description must be 2000 characters or fewer").optional(),
    servings: z.number().min(0).optional(),
    prepTimeMinutes: z.number().min(0).optional(),
    cookTimeMinutes: z.number().min(0).optional(),
    totalTimeMinutes: z.number().min(0).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    cuisine: z.string().max(100).optional(),
    course: z.string().max(100).optional(),
    folderIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough();

export const updateRecipeSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer")
      .optional(),
    description: z.string().max(2000).optional(),
    servings: z.number().min(0).optional(),
    prepTimeMinutes: z.number().min(0).optional(),
    cookTimeMinutes: z.number().min(0).optional(),
    totalTimeMinutes: z.number().min(0).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    cuisine: z.string().max(100).optional(),
    course: z.string().max(100).optional(),
    folderIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough();

export const importRecipeSchema = z.object({
  url: z.string().url("Must be a valid URL"),
});
