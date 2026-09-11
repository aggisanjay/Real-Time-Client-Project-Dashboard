import { Router } from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { authenticate } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { validate } from '../middleware/validate.js';
import { createClientSchema, updateClientSchema } from '../utils/validations.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', roleGuard([Role.ADMIN]), validate(createClientSchema), createClient);
router.put('/:id', roleGuard([Role.ADMIN]), validate(updateClientSchema), updateClient);
router.delete('/:id', roleGuard([Role.ADMIN]), deleteClient);

export default router;
