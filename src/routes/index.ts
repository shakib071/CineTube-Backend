import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { mediaRoutes } from "../modules/media/media.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { reviewRoutes } from "../modules/review/review.route";
import { commentRoutes } from "../modules/comments/comments.route";


const router = Router();

router.use("/auth",authRoutes);
router.use("/user",userRoutes)
router.use("/media",mediaRoutes)
router.use("/admin",adminRoutes)
router.use("/reviews", reviewRoutes);
router.use("/comments", commentRoutes);


export const indexRoutes = router;