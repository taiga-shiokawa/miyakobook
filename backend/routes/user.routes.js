import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getSuggestedConnections, getPublicProfile, updateProfile, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/:username", protectRoute, getPublicProfile);

router.put("/profile", protectRoute, updateProfile);

// ユーザーを全て削除
router.delete("/delete", deleteUser);
export default router;