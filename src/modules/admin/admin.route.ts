

import { Router } from "express";
import { adminUserController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { blockUnblockUserZodSchema } from "./admin.validation";


const router = Router();

// GET /api/v1/admin/users?page=1&limit=10&searchTerm=john&status=ACTIVE
router.get("/users", checkAuth(Role.ADMIN), adminUserController.getAllUsers);

// PATCH /api/v1/admin/users/:id  body: { status: "BLOCKED" | "ACTIVE" | "SUSPENDED" | "DELETED" }
router.patch("/users/:id", checkAuth(Role.ADMIN), validateRequest(blockUnblockUserZodSchema), adminUserController.blockUnblockUser);

// DELETE /api/v1/admin/users/:id
router.delete("/users/:id", checkAuth(Role.ADMIN), adminUserController.softDeleteUser);



export const adminRoutes = router;