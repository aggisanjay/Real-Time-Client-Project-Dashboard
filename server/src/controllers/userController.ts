import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { socketService } from '../services/socketService.js';
import { Role } from '@prisma/client';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { role } = req.query;

    const where: any = {};
    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    // PMs only need to see Developers (or other team members) for assignment
    if (user.role === Role.PROJECT_MANAGER && !role) {
      where.role = Role.DEVELOPER;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            assignedTasks: true,
            managedProjects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Mirror the reference's force_permission_refresh socket event:
    // When an Admin changes a user's role, emit socket event to that user forcing immediate token refresh
    socketService.emitForcePermissionRefresh(id);

    res.json({
      user: updatedUser,
      message: `User role successfully updated to ${role}. Session refresh signaled.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOnlineUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const onlineUsers = socketService.getOnlineUsers();
    const onlineCount = socketService.getOnlineCount();

    res.json({
      onlineCount,
      users: onlineUsers,
    });
  } catch (error) {
    next(error);
  }
}
