import { Router } from 'express';
import { RecipeRepository } from '../repositories/RecipeRepository';
import { RecipeService } from '../services/RecipeService';
import { RecipeController } from '../controllers/RecipeController';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

const recipeController = new RecipeController(
  new RecipeService(new RecipeRepository())
);

router.get('/', recipeController.list);
router.post('/import', recipeController.importFromUrl);
router.post('/', recipeController.create);
router.get('/:id', recipeController.get);
router.patch('/:id', recipeController.update);
router.delete('/:id', recipeController.delete);

export default router;
