import express from 'express';
import { login, logout, signup, getCurrentUser, forgotPassword } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", forgotPassword);

router.get("/me", protectRoute, getCurrentUser);

// パスワードを忘れた場合

export default router;