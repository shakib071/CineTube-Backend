import { z } from "zod";

export const blockUnblockUserZodSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED", "SUSPENDED", "DELETED"]),
});

export type IBlockUnblockUserPayload = z.infer<typeof blockUnblockUserZodSchema>;
