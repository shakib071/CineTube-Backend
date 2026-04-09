import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { subscribeNewsletterZodSchema } from "./newsletter.validation";
import { newsletterController } from "./newsletter.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// POST /api/v1/newsletter
router.post(
  "/",
  validateRequest(subscribeNewsletterZodSchema),
  newsletterController.subscribe
);

// GET /api/v1/newsletter  (admin only)
router.get("/", checkAuth(Role.ADMIN), newsletterController.getAll);

export const newsletterRoutes = router;
