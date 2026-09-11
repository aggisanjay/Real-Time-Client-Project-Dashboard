import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { Role } from '@prisma/client';

export async function globalSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!q) {
      res.json({ tasks: [], projects: [], users: [] });
      return;
    }

    // Role-based task scoping
    const taskWhere: any = {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    };

    if (user.role === Role.DEVELOPER) {
      taskWhere.assignedToId = user.userId;
    } else if (user.role === Role.PROJECT_MANAGER) {
      taskWhere.project = { managerId: user.userId };
    }

    // Role-based project scoping
    const projectWhere: any = {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
      ],
    };

    if (user.role === Role.DEVELOPER) {
      projectWhere.tasks = { some: { assignedToId: user.userId } };
    } else if (user.role === Role.PROJECT_MANAGER) {
      projectWhere.managerId = user.userId;
    }

    const [tasks, projects, users] = await Promise.all([
      prisma.task.findMany({
        where: taskWhere,
        take: 6,
        include: {
          project: { select: { id: true, name: true, managerId: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          activityLogs: {
            orderBy: { timestamp: 'desc' },
            take: 3,
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.project.findMany({
        where: projectWhere,
        take: 4,
        include: {
          client: { select: { id: true, name: true } },
          manager: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER
        ? prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            },
            take: 4,
            select: { id: true, name: true, email: true, role: true },
          })
        : Promise.resolve([]),
    ]);

    res.json({ tasks, projects, users });
  } catch (error) {
    next(error);
  }
}
