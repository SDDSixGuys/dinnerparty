import { Router } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

const authController = new AuthController(
  new AuthService(new UserRepository())
);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.me);
router.post('/logout', authController.logout);

export default router;
