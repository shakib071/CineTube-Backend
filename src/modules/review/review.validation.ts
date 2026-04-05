import { z } from "zod";

export const createReviewZodSchema = z.object({
  mediaId: z.string().min(1, "Media ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(10, "Rating must be at most 10"),
  review_content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review must be less than 2000 characters"),
  hasSpoiler: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const approveRejectZodSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
});

export const createCommentZodSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters"),
  parentId: z.string().optional(),
});

export type ICreateReviewPayload = z.infer<typeof createReviewZodSchema>;
export type IApproveRejectPayload = z.infer<typeof approveRejectZodSchema>;
export type ICreateCommentPayload = z.infer<typeof createCommentZodSchema>;
