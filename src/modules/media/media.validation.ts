import { z } from "zod";
import { MediaType, Platform, PricingType } from "../../../generated/prisma/enums";

export const createMediaZodSchema = z.object({
  title: z
    .string("Title must be a string")
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),

  synopsis: z
    .string("Synopsis must be a string")
    .max(500, "Synopsis must be less than 500 characters")
    .trim()
    .optional(),

  genre: z
    .array(z.string("Each genre must be a string"), "Genre must be an array")
    .default([]),

  releaseYear: z
    .number("Release year must be a number")
    .int("Release year must be an integer")
    .min(1888, "Release year must be after 1888")
    .max(new Date().getFullYear() + 5, "Release year is too far in the future")
    .optional(),

  releaseMonth: z
    .number("Release month must be a number")
    .int("Release month must be an integer")
    .min(1, "Release month must be between 1 and 12")
    .max(12, "Release month must be between 1 and 12")
    .optional(),

  director: z
    .string("Director must be a string")
    .max(100, "Director name must be less than 100 characters")
    .trim()
    .optional(),

  cast: z
    .array(z.string("Each cast member must be a string"), "Cast must be an array")
    .default([]),

  platform: z
    .enum(
      [
        Platform.NETFLIX,
        Platform.DISNEY_PLUS,
        Platform.YOUTUBE,
        Platform.AMAZON_PRIME,
        Platform.HBO,
        Platform.OTHER,
      ],
      "Invalid platform"
    )
    .default(Platform.OTHER),

  videoUrl: z
    .string("Video URL must be a string")
    .url("Video URL must be a valid URL")
    .optional(),

  trailerUrl: z
    .string("Trailer URL must be a string")
    .url("Trailer URL must be a valid URL")
    .optional(),

  type: z.enum([MediaType.MOVIE, MediaType.SERIES], "Type must be MOVIE or SERIES"),

  pricingType: z
    .enum([PricingType.FREE, PricingType.PREMIUM], "Pricing type must be FREE or PREMIUM")
    .default(PricingType.FREE),

  price: z
    .number("Price must be a number")
    .nonnegative("Price cannot be negative")
    .optional(),

  isPublished: z.boolean("isPublished must be a boolean").default(false),

  isFeatured: z.boolean("isFeatured must be a boolean").default(false),
}).refine(
  (data) => {
    // if pricing type is PREMIUM, price is required
    if (data.pricingType === PricingType.PREMIUM && !data.price) {
      return false;
    }
    return true;
  },
  {
    message: "Price is required for PREMIUM content",
    path: ["price"],
  }
);

export const updateMediaZodSchema = createMediaZodSchema.partial();

export type ICreateMediaPayload = z.infer<typeof createMediaZodSchema>;
export type IUpdateMediaPayload = z.infer<typeof updateMediaZodSchema>;
