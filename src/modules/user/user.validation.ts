import { z } from "zod";

export const updateProfileZodSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .trim()
    .optional(),
});

export type IUpdateProfilePayload = z.infer<typeof updateProfileZodSchema>;