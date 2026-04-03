import { Recipe, IRecipe } from '../models';

export interface RecipeFilters {
  userId: string;
  q?: string;
  folderId?: string;
  tagId?: string;
  isFavorite?: boolean;
}

export class RecipeRepository {
  async findByFilters(filters: RecipeFilters): Promise<IRecipe[]> {
    const query: Record<string, any> = { userId: filters.userId };

    if (filters.folderId) query.folderId = filters.folderId;
    if (filters.tagId) query.tags = filters.tagId;
    if (typeof filters.isFavorite === 'boolean') query.isFavorite = filters.isFavorite;
    if (filters.q?.trim()) query.$text = { $search: filters.q.trim() };

    return Recipe.find(query)
      .sort(filters.q?.trim() ? { score: { $meta: 'textScore' } } : { updatedAt: -1 })
      .limit(200);
  }

  async findOne(id: string, userId: string): Promise<IRecipe | null> {
    return Recipe.findOne({ _id: id, userId });
  }

  async create(data: Record<string, any>, userId: string): Promise<IRecipe> {
    const recipe = new Recipe({ ...data, userId });
    return recipe.save();
  }

  async update(
    id: string,
    userId: string,
    updates: Record<string, any>
  ): Promise<IRecipe | null> {
    return Recipe.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );
  }

  async delete(id: string, userId: string): Promise<IRecipe | null> {
    return Recipe.findOneAndDelete({ _id: id, userId });
  }
}
