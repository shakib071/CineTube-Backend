import z from "zod";

export const createPurchaseZodSchema = z.object({
  type: z.enum(["BUY", "RENT"]),
  paymentGateway: z.enum(["STRIPE", "SSLCOMMERZ"]),
});

export type ICreatePurchasePayload = z.infer<typeof createPurchaseZodSchema>;
