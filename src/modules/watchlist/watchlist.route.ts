import { Router } from "express";
import { watchlistController } from "./watchlist.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// GET  /api/v1/watchlist              → get user's full watchlist
router.get("/", checkAuth(Role.USER, Role.ADMIN), watchlistController.getWatchlist);

// GET  /api/v1/watchlist/check/:mediaId → is this media in my watchlist?
router.get("/check/:mediaId", checkAuth(Role.USER, Role.ADMIN), watchlistController.checkWatchlist);

// POST /api/v1/watchlist/:mediaId     → add to watchlist
router.post("/:mediaId", checkAuth(Role.USER, Role.ADMIN), watchlistController.addToWatchlist);

// DELETE /api/v1/watchlist/:mediaId   → remove from watchlist
router.delete("/:mediaId", checkAuth(Role.USER, Role.ADMIN), watchlistController.removeFromWatchlist);

export const watchlistRoutes = router;
