import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../services/RecipeService';

export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { q, folderId, tagId, isFavorite } = req.query as Record<string, string>;

      const recipes = await this.recipeService.list({
        userId,
        q,
        folderId,
        tagId,
        isFavorite: typeof isFavorite === 'string' ? isFavorite === 'true' : undefined,
      });

      res.json({ recipes });
    } catch (err) {
      next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipe = await this.recipeService.get(req.params.id, req.user!.userId);
      res.json({ recipe });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { userId: _ignoredUserId, ...body } = req.body ?? {};

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
      const { userId: _ignoredUserId, ...updates } = req.body ?? {};

      const recipe = await this.recipeService.update(req.params.id, userId, updates);
      res.json({ recipe });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.recipeService.delete(req.params.id, req.user!.userId);
      res.json({ message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  };
}
