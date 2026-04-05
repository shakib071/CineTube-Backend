import { Router } from "express";
import { reviewController } from "./review.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import {
  createReviewZodSchema,
  approveRejectZodSchema,
  createCommentZodSchema,
} from "./review.validation";

const router = Router();

// ── Reviews ───────────────────────────────────────────────────────────────────

// POST /api/v1/reviews
router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(createReviewZodSchema),
  reviewController.createReview
);

// GET /api/v1/reviews?status=PENDING&page=1&limit=10
router.get("/", checkAuth(Role.ADMIN), reviewController.getAllReviews);

// PATCH /api/v1/reviews/:id  body: { status: "APPROVED" | "REJECTED" }
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(approveRejectZodSchema),
  reviewController.approveRejectReview
);

// DELETE /api/v1/reviews/:id
router.delete("/:id", checkAuth(Role.ADMIN), reviewController.deleteReview);

// ── Likes ─────────────────────────────────────────────────────────────────────

// POST /api/v1/reviews/:id/like
router.post("/:id/like", checkAuth(Role.USER, Role.ADMIN), reviewController.toggleLike);

// ── Comments ──────────────────────────────────────────────────────────────────

// POST /api/v1/reviews/:id/comment   body: { content, parentId? }
router.post(
  "/:id/comment",
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(createCommentZodSchema),
  reviewController.addComment
);



export const reviewRoutes = router;