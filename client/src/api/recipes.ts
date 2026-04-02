import { apiJson } from "./http";

export interface RecipeListItem {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  updatedAt: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface RecipeDetail extends RecipeListItem {
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    notes?: string;
    group?: string;
  }>;
  instructions: Array<{
    stepNumber: number;
    stepName?: string;
    text: string;
    timerMinutes?: number;
    imageUrl?: string;
    group?: string;
  }>;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  difficulty?: "easy" | "medium" | "hard";
  cuisine?: string;
  course?: string;
  notes?: string;
}

export async function listRecipes(params?: {
  q?: string;
  folderId?: string;
  tagId?: string;
  isFavorite?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.folderId) qs.set("folderId", params.folderId);
  if (params?.tagId) qs.set("tagId", params.tagId);
  if (typeof params?.isFavorite === "boolean") qs.set("isFavorite", String(params.isFavorite));

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiJson<{ recipes: RecipeListItem[] }>(`/api/recipes${suffix}`);
}

export async function getRecipe(id: string) {
  return apiJson<{ recipe: RecipeDetail }>(`/api/recipes/${id}`);
}

export async function createRecipe(payload: any) {
  return apiJson<{ recipe: RecipeDetail }>(`/api/recipes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function importRecipe(payload: any) {
  return apiJson<{ recipe: RecipeDetail }>(`/api/recipes/import`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const updateRecipe = (id: string, data: any) =>
  fetch(`/api/recipes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());

export const deleteRecipe = (id: string) =>
  fetch(`/api/recipes/${id}`, { method: "DELETE" }).then((res) => res.json());
