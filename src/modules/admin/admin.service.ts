import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import status from "http-status";

const getAllUsers = async (queryParams: IQueryParams) => {
  const result = await new QueryBuilder(prisma.user, queryParams, {
    searchableFields: ["name", "email"],
    filterableFields: ["role", "status"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ role: "USER"})
    .execute();

  return result;
};

const blockUnblockUser = async (id: string, userStatus: string) => {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status: userStatus as "ACTIVE" | "BLOCKED" | "SUSPENDED" | "DELETED" },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  return updated;
};

const softDeleteUser = async (id: string) => {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date(), status: "DELETED" },
  });

  return { message: "User deleted successfully" };
};

export const adminUserService = {
  getAllUsers,
  blockUnblockUser,
  softDeleteUser,
};
