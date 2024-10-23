import express from 'express';
import { companyInfoPosting, jobInfoPosting, getJobs, deleteJob } from '../controllers/job.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// 企業情報入力
router.post("/company-info", protectRoute, companyInfoPosting);

// 求人情報入力
router.post("/job-posting", protectRoute, jobInfoPosting);

// 求人情報取得
router.get("/", protectRoute, getJobs);

// 求人削除
router.delete("/delete/:id", protectRoute, deleteJob);

export default router