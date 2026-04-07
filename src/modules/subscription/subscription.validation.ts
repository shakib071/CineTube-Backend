import z from "zod";

export const createStripeSubscriptionZodSchema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"]),
});



export type ICreateStripeSubscriptionPayload = z.infer<typeof createStripeSubscriptionZodSchema>;

