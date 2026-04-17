import { Request, Response, NextFunction } from 'express';
import { FolderService } from '../services/FolderService';

export class FolderController {
  constructor(private folderService: FolderService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const parentId = req.query.parentId as string | undefined;

      const folders = await this.folderService.list({
        userId,
        parentId,
      });

      res.json({ folders });
    } catch (err) {
      next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const folder = await this.folderService.get(req.params.id as string, req.user!.userId);
      res.json({ folder });
    } catch (err) {
      next(err);
    }
  };

  getChildren = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const children = await this.folderService.getChildren(req.params.id as string, req.user!.userId);
      res.json({ folders: children });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const body = { ...(req.body ?? {}) };
      delete body.userId;

      const folder = await this.folderService.create(body, userId);
      res.status(201).json({ folder });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updates = { ...(req.body ?? {}) };
      delete updates.userId;

      const folder = await this.folderService.update(req.params.id as string, userId, updates);
      res.json({ folder });
    } catch (err) {
      next(err);
    }
  };

  move = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { newParentId } = req.body as { newParentId: string | null };

      const folder = await this.folderService.move(req.params.id as string, userId, newParentId);
      res.json({ folder });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.folderService.delete(req.params.id as string, req.user!.userId);
      res.json({ message: 'Deleted' });
    } catch (err) {
      next(err);
    }
  };
}
