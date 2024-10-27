import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getSuggestedConnections, getPublicProfile, updateProfile, deleteUser, countUsers } from '../controllers/user.controller.js';

const router = express.Router();

// ユーザー数カウント
router.get("/user-count", countUsers);
router.get("/suggestions", protectRoute, getSuggestedConnections);
router.put("/profile", protectRoute, updateProfile);
// ユーザーを全て削除
router.delete("/delete", deleteUser);

router.get("/:username", protectRoute, getPublicProfile);


export default router;