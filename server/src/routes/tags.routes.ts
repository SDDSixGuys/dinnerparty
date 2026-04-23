import { Router } from 'express';
import { TagRepository } from '../repositories/TagRepository';
import { TagService } from '../services/TagService';
import { TagController } from '../controllers/TagController';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

const tagController = new TagController(
  new TagService(new TagRepository())
);

router.get('/', tagController.list);
router.post('/', tagController.create);
router.get('/:id', tagController.get);
router.patch('/:id', tagController.update);
router.delete('/:id', tagController.delete);

export default router;
