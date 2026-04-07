import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { mediaRoutes } from "../modules/media/media.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { reviewRoutes } from "../modules/review/review.route";
import { commentRoutes } from "../modules/comments/comments.route";
import { watchlistRoutes } from "../modules/watchlist/watchlist.route";
import { subscriptionRoutes } from "../modules/subscription/subscription.route";
import { purchaseRoutes } from "../modules/purchase/purchase.route";


const router = Router();

router.use("/auth",authRoutes);
router.use("/user",userRoutes)
router.use("/media",mediaRoutes)
router.use("/admin",adminRoutes)
router.use("/reviews", reviewRoutes);
router.use("/comments", commentRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/purchase",     purchaseRoutes);


export const indexRoutes = router;