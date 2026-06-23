import { Router } from "express";
import { RecipeRepository } from "../repositories/RecipeRepository";
import { RecipeService } from "../services/RecipeService";
import { RecipeController } from "../controllers/RecipeController";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import {
  createRecipeSchema,
  updateRecipeSchema,
  importRecipeSchema,
} from "../schemas/recipe.schema";

const router = Router();
router.use(requireAuth);

const recipeController = new RecipeController(new RecipeService(new RecipeRepository()));

router.get("/", recipeController.list);
router.post("/import", validate(importRecipeSchema), recipeController.importFromUrl);
router.post("/", validate(createRecipeSchema), recipeController.create);
router.get("/:id", recipeController.get);
router.patch("/:id", validate(updateRecipeSchema), recipeController.update);
router.delete("/:id", recipeController.delete);

export default router;
