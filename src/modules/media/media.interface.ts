import { MediaType, Platform, PricingType } from "../../../generated/prisma/enums";

export interface ICreateMediaPayload {
  title: string;
  synopsis?: string;
  genre?: string[];
  releaseYear?: number;
  releaseMonth?: number;
  director?: string;
  cast?: string[];
  platform?: Platform;
  videoUrl?: string;
  trailerUrl?: string;
  type: MediaType;
  pricingType?: PricingType;
  price?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
}
