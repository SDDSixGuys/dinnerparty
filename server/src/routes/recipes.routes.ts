import { Router, Request, Response } from 'express';
import { Recipe } from '../models';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);


router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { q, folderId, tagId, isFavorite } = req.query as Record<string, string>;

    const filter: Record<string, any> = { userId };

    if (folderId) filter.folderId = folderId;
    if (tagId) filter.tags = tagId;
    if (typeof isFavorite === 'string') filter.isFavorite = isFavorite === 'true';

    if (q?.trim()) {
      filter.$text = { $search: q.trim() };
    }

    const recipes = await Recipe.find(filter)
      .sort(q?.trim() ? { score: { $meta: 'textScore' } } : { updatedAt: -1 })
      .limit(200);

    res.json({ recipes });
  } catch (error) {
    console.error('List recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const { userId: _ignoredUserId, ...body } = req.body ?? {};

    const recipe = new Recipe({ ...body, userId });
    await recipe.save();

    res.status(201).json({ recipe });
  } catch (error: any) {
    console.error('Create recipe error:', error);
    res.status(400).json({ error: error?.message ?? 'Invalid recipe payload' });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const recipe = await Recipe.findOne({ _id: req.params.id, userId });

    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    res.json({ recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(400).json({ error: 'Invalid recipe id' });
  }
});

// PATCH /api/recipes/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { userId: _ignoredUserId, ...updates } = req.body ?? {};

    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    res.json({ recipe });
  } catch (error: any) {
    console.error('Update recipe error:', error);
    res.status(400).json({ error: error?.message ?? 'Invalid update payload' });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId });

    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(400).json({ error: 'Invalid recipe id' });
  }
});

export default router;

