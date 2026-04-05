import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

const deleteComment = async (user: IRequestUser, commentId: string) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(status.NOT_FOUND, "Comment not found");

  // only owner or admin can delete
  if (comment.userId !== user.userId && user.role !== "ADMIN") {
    throw new AppError(status.FORBIDDEN, "You are not allowed to delete this comment");
  }

  // deleting parent also deletes all replies (set up cascade in prisma or delete manually)
  await prisma.comment.deleteMany({ where: { parentId: commentId } });
  await prisma.comment.delete({ where: { id: commentId } });

  return { message: "Comment deleted successfully" };
};

export const commentsService = {
  deleteComment,
};