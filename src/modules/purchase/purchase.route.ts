import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { purchaseController } from "./purchase.controller";
import { createPurchaseZodSchema } from "./purchase.validation";

const router = Router();

// GET  /api/v1/purchase              → purchase history (auth required)
router.get(
  "/",
  checkAuth(Role.USER, Role.ADMIN),
  purchaseController.getPurchaseHistory
);

// GET  /api/v1/purchase/access/:mediaId → does the user have active access?
router.get(
  "/access/:mediaId",
  checkAuth(Role.USER, Role.ADMIN),
  purchaseController.checkAccess
);

// POST /api/v1/purchase/:mediaId     → buy or rent
router.post(
  "/:mediaId",
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(createPurchaseZodSchema),
  purchaseController.createPurchase
);



export const purchaseRoutes = router;
