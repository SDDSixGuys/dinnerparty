import { Request, Response, NextFunction } from "express";
import { RecipeService } from "../services/RecipeService";

export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { q, folderId, tagId, isFavorite, difficulty, cuisine, course, maxTotalTime } = req.query as Record<string, string>;

      const parseArray = (val?: string) => val ? val.split(',').map(s => s.trim()).filter(Boolean) : undefined;

      const recipes = await this.recipeService.list({
        userId,
        q,
        folderId,
        tagId,
        isFavorite: typeof isFavorite === "string" ? isFavorite === "true" : undefined,
        difficulty: parseArray(difficulty),
        cuisine: parseArray(cuisine),
        course: parseArray(course),
        maxTotalTime: maxTotalTime ? parseInt(maxTotalTime, 10) : undefined,
      });

      res.json({ recipes });
    } catch (err) {
      next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipe = await this.recipeService.get(req.params.id as string, req.user!.userId);
      res.json({ recipe });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const body = { ...(req.body ?? {}) };
      delete body.userId;

      const recipe = await this.recipeService.create(body, userId);
      res.status(201).json({ recipe });
    } catch (err) {
      next(err);
    }
  };

  importFromUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { url } = req.body as { url?: string };
      const recipe = await this.recipeService.importFromUrl(url!, req.user!.userId);
      res.status(201).json({ recipe });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updates = { ...(req.body ?? {}) };
      delete updates.userId;

      const recipe = await this.recipeService.update(req.params.id as string, userId, updates);
      res.json({ recipe });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.recipeService.delete(req.params.id as string, req.user!.userId);
      res.json({ message: "Deleted" });
    } catch (err) {
      next(err);
    }
  };
}
