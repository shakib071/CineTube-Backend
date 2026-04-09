import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ISubscribeNewsletterPayload } from "./newsletter.validation";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const subscribe = async (payload: ISubscribeNewsletterPayload) => {
  const existing = await prisma.newsletter.findUnique({
    where: { email: payload.email },
  });

  if (existing) {
    throw new AppError(status.CONFLICT, "This email is already subscribed");
  }

  const subscriber = await prisma.newsletter.create({
    data: { email: payload.email },
  });

  return subscriber;
};


const getAll = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.newsletter, queryParams, {
    searchableFields: ["email"],
  })
    .search()
    .sort()
    .paginate()
    .execute();

  return result;
};


export const newsletterService = { subscribe , getAll };
