import { Request, Response, NextFunction } from 'express';
import { TagService } from '../services/TagService';

export class TagController {
  constructor(private tagService: TagService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tags = await this.tagService.list(req.user!.userId);
      res.json({ tags });
    } catch (err) {
      next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tag = await this.tagService.get(req.params.id as string, req.user!.userId);
      res.json({ tag });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const body = { ...(req.body ?? {}) };
      delete body.userId;

      const tag = await this.tagService.create(body, userId);
      res.status(201).json({ tag });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updates = { ...(req.body ?? {}) };
      delete updates.userId;

      const tag = await this.tagService.update(req.params.id as string, userId, updates);
      res.json({ tag });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.tagService.delete(req.params.id as string, req.user!.userId);
      res.json({ message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  };
}
