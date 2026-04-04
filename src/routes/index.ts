import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { mediaRoutes } from "../modules/media/media.route";


const router = Router();

router.use("/auth",authRoutes);
router.use("/user",userRoutes)
router.use("/media",mediaRoutes)


export const indexRoutes = router;