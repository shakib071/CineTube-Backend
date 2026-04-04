import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";
import { mediaController } from "./media.controller";

const router = Router();

// public routes
router.get("/", mediaController.getAllMedia);
router.get("/:id", mediaController.getMediaById);

// admin only routes
router.post(
  "/",
  checkAuth(Role.ADMIN),
  multerUpload.single("thumbnail"),
  mediaController.createMedia
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  multerUpload.single("thumbnail"),
  mediaController.updateMedia
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  mediaController.deleteMedia
);

export const mediaRoutes = router;

