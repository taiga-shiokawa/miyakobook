import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getNews, getNewsById, postNews, incrementViews, deletePost, updateNews } from '../controllers/news.controller.js';

const router = express.Router();

// ニュース一覧の取得（保護なし - 誰でも閲覧可能）
router.get("/", getNews);

// 特定のニュースの取得（保護なし - 誰でも閲覧可能）
router.get("/:newsId", getNewsById);

// ニュースの投稿（保護あり - 管理者のみ）
router.post("/create", protectRoute, postNews);

// view数更新
router.post("/:newsId/increment-views", incrementViews);

router.delete("/:newsId", protectRoute, deletePost);

router.put("/edit/:newsId", protectRoute, updateNews); 

export default router;