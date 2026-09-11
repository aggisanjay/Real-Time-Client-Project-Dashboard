import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { Role } from '@prisma/client';

export async function getActivityFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);

    let whereClause: any = {};

    if (user.role === Role.ADMIN) {
      whereClause = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      // Scoped to projects managed by this PM
      whereClause = {
        task: {
          project: {
            managerId: user.userId,
          },
        },
      };
    } else if (user.role === Role.DEVELOPER) {
      // Scoped strictly to tasks assigned to this developer
      whereClause = {
        task: {
          assignedToId: user.userId,
        },
      };
    }

    const logs = await prisma.taskActivityLog.findMany({
      where: whereClause,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const feed = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user.name,
      userEmail: log.user.email,
      userRole: log.user.role,
      taskId: log.taskId,
      taskTitle: log.task?.title || 'Unknown Task',
      projectId: log.task?.projectId || '',
      projectName: log.task?.project?.name || 'Unknown Project',
      fromStatus: log.fromStatus,
      toStatus: log.toStatus,
      timestamp: log.timestamp.toISOString(),
    }));

    res.json({ feed });
  } catch (error) {
    next(error);
  }
}
