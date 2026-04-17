import { Recipe, IRecipe } from '../models';

export interface RecipeFilters {
  userId: string;
  q?: string;
  folderId?: string;
  tagId?: string;
  isFavorite?: boolean;
  difficulty?: string[];
  cuisine?: string[];
  course?: string[];
  maxTotalTime?: number;
}

export class RecipeRepository {
  async findByFilters(filters: RecipeFilters): Promise<IRecipe[]> {
    const query: Record<string, any> = { userId: filters.userId };

    if (filters.folderId) query.folderIds = filters.folderId;
    if (filters.tagId) query.tags = filters.tagId;
    if (typeof filters.isFavorite === 'boolean') query.isFavorite = filters.isFavorite;
    if (filters.q?.trim()) {
      const searchTerm = filters.q.trim();
      const fuzzyRegex = searchTerm.split('').join('.*');
      
      query.$or = [
        { title: { $regex: fuzzyRegex, $options: 'i' } },
        { "ingredients.name": { $regex: fuzzyRegex, $options: 'i' } },
        { description: { $regex: fuzzyRegex, $options: 'i' } },
        { cuisine: { $regex: fuzzyRegex, $options: 'i' } },
        { course: { $regex: fuzzyRegex, $options: 'i' } }
      ];
    }
    
    if (filters.difficulty && filters.difficulty.length > 0) {
      query.difficulty = { $in: filters.difficulty };
    }
    if (filters.cuisine && filters.cuisine.length > 0) {
      // Case-insensitive match or exact match depending on how it's stored. Assume exact for now.
      query.cuisine = { $in: filters.cuisine };
    }
    if (filters.course && filters.course.length > 0) {
      query.course = { $in: filters.course };
    }
    if (filters.maxTotalTime !== undefined) {
      query.totalTimeMinutes = { $lte: filters.maxTotalTime };
    }

// Used AI to write this algorithm. Human reviewed and tested
// "Fuzzy" regex search

    let recipes = await Recipe.find(query).sort({ updatedAt: -1 }).limit(200);

    if (filters.q?.trim()) {
      const term = filters.q.trim().toLowerCase();
      
      const fuzzyMatchScore = (text: string, search: string) => {
        if (!text) return 0;
        const lowerText = text.toLowerCase();
        if (lowerText.includes(search)) return 1;
        
        let searchIdx = 0;
        for (let i = 0; i < lowerText.length; i++) {
          if (lowerText[i] === search[searchIdx]) {
            searchIdx++;
          }
          if (searchIdx === search.length) return 0.5;
        }
        return 0;
      };

      recipes = recipes.sort((a, b) => {
        const getScore = (r: IRecipe) => {
          let score = 0;
          score += fuzzyMatchScore(r.title, term) * 10;
          
          if (r.ingredients.some(i => fuzzyMatchScore(i.name, term) > 0)) {
            score += 5;
          }
          
          score += fuzzyMatchScore(r.cuisine || '', term) * 2;
          score += fuzzyMatchScore(r.course || '', term) * 2;
          score += fuzzyMatchScore(r.description || '', term) * 1;
          
          return score;
        };
        return getScore(b) - getScore(a);
      });
    }

    return recipes;
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
