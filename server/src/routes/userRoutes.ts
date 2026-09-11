import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserRole,
  getOnlineUsers,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { updateUserRoleSchema } from '../utils/validations.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// List users (Admin sees all, PM sees Developers)
router.get('/', getUsers);

// Online presence list (Admin only)
router.get('/presence', roleGuard([Role.ADMIN]), getOnlineUsers);

// Get user profile
router.get('/:id', getUserById);

// Update user role (Admin only)
router.patch(
  '/:id/role',
  roleGuard([Role.ADMIN]),
  validate(updateUserRoleSchema),
  updateUserRole
);

export default router;
