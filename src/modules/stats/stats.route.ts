import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { statsController } from "./stats.controller";

const router = Router();

router.get("/user",checkAuth(Role.USER),statsController.getUserStats);
router.get("/admin", checkAuth(Role.ADMIN), statsController.getStats);


export const statsRoutes = router;