import { deleteFileFromCloudinary, uploadFileToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IUpdateProfilePayload } from "./user.interface";
import status from "http-status";



const editProfile = async (
  user: IRequestUser,
  payload: IUpdateProfilePayload
) => {
  const { name, imageUrl } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { id: user.userId },
  });

  if (!existingUser) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // delete old image if new one uploaded
  if (imageUrl && existingUser.image) {
    await deleteFileFromCloudinary(existingUser.image);
  }

  const updateData: { name?: string; image?: string } = {};
  if (name) updateData.name = name;
  if (imageUrl) updateData.image = imageUrl; // ← save URL to DB

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
    },
  });

  return updatedUser;
};


export const userService = {
    editProfile,
}