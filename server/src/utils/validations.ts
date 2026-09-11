import { z } from 'zod';
import { Role, TaskStatus, TaskPriority } from '@prisma/client';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role).optional().default(Role.DEVELOPER),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createClientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  contactInfo: z.string().min(3, 'Contact info is required'),
});

export const updateClientSchema = createClientSchema.partial();

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  clientId: z.string().uuid('Invalid client ID'),
  managerId: z.string().uuid('Invalid manager ID').optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  clientId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
});

export const createTaskSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().nullable(),
  assignedToId: z.string().uuid('Invalid assignee ID'),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  assignedToId: z.string().uuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});
