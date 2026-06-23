import { z } from "zod";

export const createFolderSchema = z
  .object({
    name: z
      .string()
      .min(1, "Folder name is required")
      .max(100, "Folder name must be 100 characters or fewer"),
    color: z.string().optional(),
    parentId: z.string().optional(),
  })
  .passthrough();

export const updateFolderSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    color: z.string().optional(),
  })
  .passthrough();

export const moveFolderSchema = z.object({
  newParentId: z.string().nullable().optional(),
});
