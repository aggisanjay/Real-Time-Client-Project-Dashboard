import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../utils/validations.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTaskById);

// Create task restricted to Admin and PM
router.post(
  '/',
  roleGuard([Role.ADMIN, Role.PROJECT_MANAGER]),
  validate(createTaskSchema),
  createTask
);

// General update endpoint
router.put('/:id', validate(updateTaskSchema), updateTask);

// Status-specific update endpoint (usable by Developers for their assigned tasks)
router.patch('/:id/status', validate(updateTaskStatusSchema), updateTaskStatus);

// Delete task restricted to Admin and PM
router.delete(
  '/:id',
  roleGuard([Role.ADMIN, Role.PROJECT_MANAGER]),
  deleteTask
);

export default router;
