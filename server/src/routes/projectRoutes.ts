import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../utils/validations.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post(
  '/',
  roleGuard([Role.ADMIN, Role.PROJECT_MANAGER]),
  validate(createProjectSchema),
  createProject
);
router.put(
  '/:id',
  roleGuard([Role.ADMIN, Role.PROJECT_MANAGER]),
  validate(updateProjectSchema),
  updateProject
);
router.delete('/:id', roleGuard([Role.ADMIN]), deleteProject);

export default router;
