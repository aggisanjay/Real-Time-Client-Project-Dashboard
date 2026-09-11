import { Router } from 'express';
import { getActivityFeed } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Role-scoped live feed and catch-up query
router.get('/feed', getActivityFeed);

export default router;
