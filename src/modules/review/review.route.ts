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

// ── PUBLIC — fetch published reviews for a media (used by detail page) ────────
// GET /api/v1/reviews/public?mediaId=xxx&page=1&limit=5
router.get("/public", reviewController.getPublicReviews);

// ── Admin — all reviews with filters ─────────────────────────────────────────
// GET /api/v1/reviews?status=PENDING&page=1&limit=10
router.get("/", checkAuth(Role.ADMIN), reviewController.getAllReviews);

// ── User — create review ──────────────────────────────────────────────────────
// POST /api/v1/reviews
router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(createReviewZodSchema),
  reviewController.createReview
);

// ── Admin — approve/reject ────────────────────────────────────────────────────
// PATCH /api/v1/reviews/:id
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(approveRejectZodSchema),
  reviewController.approveRejectReview
);

// ── Admin — delete review ─────────────────────────────────────────────────────
// DELETE /api/v1/reviews/:id
router.delete("/:id", checkAuth(Role.ADMIN), reviewController.deleteReview);

// ── Auth — toggle like ────────────────────────────────────────────────────────
// POST /api/v1/reviews/:id/like
router.post("/:id/like", checkAuth(Role.USER, Role.ADMIN), reviewController.toggleLike);

// ── Auth — add comment ────────────────────────────────────────────────────────
// POST /api/v1/reviews/:id/comment
router.post(
  "/:id/comment",
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(createCommentZodSchema),
  reviewController.addComment
);

export const reviewRoutes = router;
