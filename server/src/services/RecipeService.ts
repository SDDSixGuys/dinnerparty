import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecipeRepository, RecipeFilters } from '../repositories/RecipeRepository';
import { env } from '../config/env';
import { ValidationError, NotFoundError } from '../errors/AppError';

export class RecipeService {
  private genAI: GoogleGenerativeAI;

  constructor(private recipeRepository: RecipeRepository) {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  async list(filters: RecipeFilters) {
    return this.recipeRepository.findByFilters(filters);
  }

  async get(id: string, userId: string) {
    const recipe = await this.recipeRepository.findOne(id, userId);
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }
    return recipe;
  }

  async create(data: Record<string, any>, userId: string) {
    return this.recipeRepository.create(data, userId);
  }

  async update(id: string, userId: string, updates: Record<string, any>) {
    const recipe = await this.recipeRepository.update(id, userId, updates);
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }
    return recipe;
  }

  async delete(id: string, userId: string) {
    const recipe = await this.recipeRepository.delete(id, userId);
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }
    return recipe;
  }

  async importFromUrl(url: string, userId: string) {
    if (!url || !/^https?:\/\/.+/.test(url)) {
      throw new ValidationError('A valid http/https URL is required');
    }

    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DinnerParty/1.0)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!pageRes.ok) {
      throw new ValidationError(`Could not fetch the page (HTTP ${pageRes.status})`);
    }

    const html = await pageRes.text();

    const plainText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 20000);

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const result = await model.generateContent(
      `Extract the recipe from this webpage HTML and return ONLY a valid JSON object with no extra text or markdown.

Fill "timerMinutes" to instruction steps if you see any time indications.  If a range of times are given (eg. "cook for 20-30 minutes"), use whichever value you deem appropriate.

If total time is not given but prep and cook times are available, calculate total time as their sum.

If a page doesn't contain a recipe, return an empty JSON object: {}. Do not return any text other than the JSON. Do not include any markdown formatting. Respond only with the JSON.

If a page contains multiple recipes, extract the most prominent one (e.g. the one with the biggest image or listed first in the HTML).

Use this exact shape (omit fields you cannot determine):
{
  "title": "string (required)",
  "description": "string",
  "imageUrl": "full URL to the main recipe image",
  "ingredients": [{ "name": "string", "quantity": number, "unit": "string", "notes": "string" }],
  "instructions": [{ "stepNumber": number, "stepName": "string", "text": "string", "timerMinutes": number }],
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "totalTimeMinutes": number,
  "servings": number,
  "cuisine": "string",
  "course": "string",
  "difficulty": "easy" | "medium" | "hard",
  "notes": "string"
}

PAGE TEXT:
${plainText}`
    );

    const jsonText = result.response
      .text()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('AI returned unparseable recipe data');
    }

    if (!parsed.title) {
      throw new ValidationError('Could not extract a recipe from this page');
    }

    return this.recipeRepository.create(
      { ...parsed, sourceUrl: url, sourceType: 'url_import' },
      userId
    );
  }
}
