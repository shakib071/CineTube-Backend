import z from "zod";

export const subscribeNewsletterZodSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ISubscribeNewsletterPayload = z.infer<typeof subscribeNewsletterZodSchema>;
