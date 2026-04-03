import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { updateProfileZodSchema } from "./user.validation";


const router = Router();

router.patch("/edit-profile",checkAuth(Role.ADMIN,Role.USER),multerUpload.single("image"),validateRequest(updateProfileZodSchema),userController.editProfile);

export const userRoutes = router;