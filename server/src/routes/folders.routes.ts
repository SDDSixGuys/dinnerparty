import { Router } from "express";
import { FolderRepository } from "../repositories/FolderRepository";
import { FolderService } from "../services/FolderService";
import { FolderController } from "../controllers/FolderController";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { createFolderSchema, updateFolderSchema, moveFolderSchema } from "../schemas/folder.schema";

const router = Router();
router.use(requireAuth);

const folderController = new FolderController(new FolderService(new FolderRepository()));

router.get("/", folderController.list);
router.post("/", validate(createFolderSchema), folderController.create);
router.get("/:id", folderController.get);
router.get("/:id/children", folderController.getChildren);
router.patch("/:id", validate(updateFolderSchema), folderController.update);
router.patch("/:id/move", validate(moveFolderSchema), folderController.move);
router.delete("/:id", folderController.delete);

export default router;
