import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getFeedPosts, createPost, deletePost, getPostById, createComment, likePost, getMyPosts } from '../controllers/post.controller.js';

const router = express.Router();

// 全ての投稿取得
router.get("/", protectRoute, getFeedPosts);

// 投稿
router.post("/create", protectRoute, createPost);

// 自分の投稿
router.get("/my-posts", protectRoute, getMyPosts);

// 投稿削除
router.delete("/delete/:id", protectRoute, deletePost);

// 特定の投稿を取得
router.get("/:id", protectRoute, getPostById);

// コメントの投稿
router.post("/:id/comment", protectRoute, createComment);

// いいね機能
router.post("/:id/like", protectRoute, likePost);

export default router;