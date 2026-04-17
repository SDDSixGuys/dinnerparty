import { HttpClient, httpClient } from './http';

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
  folderId?: string;
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

export class RecipeApiClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  list(params?: { 
    q?: string; 
    folderId?: string; 
    tagId?: string; 
    isFavorite?: boolean;
    difficulty?: string[];
    cuisine?: string[];
    course?: string[];
    maxTotalTime?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.folderId) qs.set('folderId', params.folderId);
    if (params?.tagId) qs.set('tagId', params.tagId);
    if (typeof params?.isFavorite === 'boolean') qs.set('isFavorite', String(params.isFavorite));
    
    if (params?.difficulty?.length) qs.set('difficulty', params.difficulty.join(','));
    if (params?.cuisine?.length) qs.set('cuisine', params.cuisine.join(','));
    if (params?.course?.length) qs.set('course', params.course.join(','));
    if (params?.maxTotalTime !== undefined) qs.set('maxTotalTime', String(params.maxTotalTime));

    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.http.json<{ recipes: RecipeListItem[] }>(`/api/recipes${suffix}`);
  }

  get(id: string) {
    return this.http.json<{ recipe: RecipeDetail }>(`/api/recipes/${id}`);
  }

  create(payload: any) {
    return this.http.json<{ recipe: RecipeDetail }>(`/api/recipes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  import(payload: any) {
    return this.http.json<{ recipe: RecipeDetail }>(`/api/recipes/import`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  update(id: string, data: any) {
    return this.http.json<{ recipe: RecipeDetail }>(`/api/recipes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(id: string) {
    return this.http.json<{ message: string }>(`/api/recipes/${id}`, {
      method: 'DELETE',
    });
  }
}

export const recipeApiClient = new RecipeApiClient(httpClient);

// Named exports — same API surface as before, now delegating to the class instance
export const listRecipes = (params?: {
  q?: string;
  folderId?: string;
  tagId?: string;
  isFavorite?: boolean;
  difficulty?: string[];
  cuisine?: string[];
  course?: string[];
  maxTotalTime?: number;
}) => recipeApiClient.list(params);

export const getRecipe = (id: string) => recipeApiClient.get(id);

export const createRecipe = (payload: any) => recipeApiClient.create(payload);

export const importRecipe = (payload: any) => recipeApiClient.import(payload);

export const updateRecipe = (id: string, data: any) => recipeApiClient.update(id, data);

export const deleteRecipe = (id: string) => recipeApiClient.delete(id);
