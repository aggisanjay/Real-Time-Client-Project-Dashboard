import { Router } from 'express';
import { login, refresh, logout, getMe } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../utils/validations.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
