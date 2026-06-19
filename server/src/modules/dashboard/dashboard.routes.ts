import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// Dashboard requires authentication
router.use(authMiddleware);

router.get('/stats', dashboardController.getStats);

export default router;
