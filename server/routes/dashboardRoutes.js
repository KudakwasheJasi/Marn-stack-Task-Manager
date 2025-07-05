import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { protectRoute } from '../middlewares/authMiddlewave.js';

const router = express.Router();

router.get('/', protectRoute, getDashboardData);

export default router;
