import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getSearchResults, getSearchUsers } from '../controllers/search.controller.js';

const router = express.Router();

// 投稿検索
router.get("/", protectRoute, getSearchResults);

// ユーザー検索
router.get("/search-users", protectRoute, getSearchUsers);

export default router