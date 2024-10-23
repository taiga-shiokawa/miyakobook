import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getSearchResults } from '../controllers/search.controller.js';

const router = express.Router();

router.get("/", protectRoute, getSearchResults);

export default router