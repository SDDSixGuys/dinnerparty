import { Router } from "express";
import rateLimit from "express-rate-limit";
import { UserRepository } from "../repositories/UserRepository";
import { AuthService } from "../services/AuthService";
import { AuthController } from "../controllers/AuthController";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Too many attempts, please try again later" },
  legacyHeaders: false,
});

const authController = new AuthController(new AuthService(new UserRepository()));

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/logout", authController.logout);

export default router;
