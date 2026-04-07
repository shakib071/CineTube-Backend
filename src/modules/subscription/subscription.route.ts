import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { subscriptionController } from "./subscription.controller";
import {
  createStripeSubscriptionZodSchema,
} from "./subscription.validation";

const router = Router();

// ── Stripe ────────────────────────────────────────────────────────────────────
// POST /api/v1/subscription/stripe  → create Stripe checkout session
router.post(
  "/stripe",
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(createStripeSubscriptionZodSchema),
  subscriptionController.createStripeSession
);

// ── Stripe webhook (raw body — registered in app.ts BEFORE json middleware) ──
// POST /api/v1/subscription/webhook
router.post("/webhook", subscriptionController.stripeWebhook);




// ── My subscription ───────────────────────────────────────────────────────────
// GET /api/v1/subscription/me
router.get("/me", checkAuth(Role.USER, Role.ADMIN), subscriptionController.getMySubscription);

export const subscriptionRoutes = router;
