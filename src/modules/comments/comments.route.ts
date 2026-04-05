import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { commentsController } from "./comments.controller";


const router = Router();

router.delete(
  "/:id",
  checkAuth(Role.USER, Role.ADMIN),
  commentsController.deleteComment
);


export const commentRoutes = router;