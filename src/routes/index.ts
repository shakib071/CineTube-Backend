import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { mediaRoutes } from "../modules/media/media.route";
import { adminRoutes } from "../modules/admin/admin.route";


const router = Router();

router.use("/auth",authRoutes);
router.use("/user",userRoutes)
router.use("/media",mediaRoutes)
router.use("/admin",adminRoutes)


export const indexRoutes = router;