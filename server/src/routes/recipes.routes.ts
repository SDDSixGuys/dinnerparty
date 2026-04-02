import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Recipe } from '../models';
import { requireAuth } from '../middleware/auth.middleware';
import { env } from '../config/env';

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { q, folderId, tagId, isFavorite } = req.query as Record<string, string>;

    const filter: Record<string, any> = { userId };

    if (folderId) filter.folderId = folderId;
    if (tagId) filter.tags = tagId;
    if (typeof isFavorite === "string") filter.isFavorite = isFavorite === "true";

    if (q?.trim()) {
      filter.$text = { $search: q.trim() };
    }

    const recipes = await Recipe.find(filter)
      .sort(q?.trim() ? { score: { $meta: "textScore" } } : { updatedAt: -1 })
      .limit(200);

    res.json({ recipes });
  } catch (error) {
    console.error("List recipes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const { userId: _ignoredUserId, ...body } = req.body ?? {};

    const recipe = new Recipe({ ...body, userId });
    await recipe.save();

    res.status(201).json({ recipe });
  } catch (error: any) {
    console.error("Create recipe error:", error);
    res.status(400).json({ error: error?.message ?? "Invalid recipe payload" });
  }
});

router.post('/import', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { url } = req.body as { url?: string };

    if (!url || !/^https?:\/\/.+/.test(url)) {
      res.status(400).json({ error: 'A valid http/https URL is required' });
      return;
    }

    // Fetch the recipe page
    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DinnerParty/1.0)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!pageRes.ok) {
      res.status(400).json({ error: `Could not fetch the page (HTTP ${pageRes.status})` });
      return;
    }

    const html = await pageRes.text();

    // Convert HTML to plain text to drastically reduce token count
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

    // Use Gemini to extract structured recipe data
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

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

    // Gemini sometimes wraps output in ```json ... ``` fences
    const jsonText = result.response.text()
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
      throw new Error('Could not extract a recipe from this page');
    }

    const recipe = new Recipe({
      ...parsed,
      userId,
      sourceUrl: url,
      sourceType: 'url_import',
    });
    await recipe.save();

    res.status(201).json({ recipe });
  } catch (error: any) {
    console.error('Import recipe error:', error);
    res.status(400).json({ error: error?.message ?? 'Could not import recipe' });
  }
});

// GET /api/recipes/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const recipe = await Recipe.findOne({ _id: req.params.id, userId });

    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.json({ recipe });
  } catch (error) {
    console.error("Get recipe error:", error);
    res.status(400).json({ error: "Invalid recipe id" });
  }
});

// PATCH /api/recipes/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { userId: _ignoredUserId, ...updates } = req.body ?? {};

    const recipe = await Recipe.findOneAndUpdate({ _id: req.params.id, userId }, updates, {
      new: true,
      runValidators: true,
    });

    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.json({ recipe });
  } catch (error: any) {
    console.error("Update recipe error:", error);
    res.status(400).json({ error: error?.message ?? "Invalid update payload" });
  }
});

// DELETE /api/recipes/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId });

    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(400).json({ error: "Invalid recipe id" });
  }
});

export default router;
