import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { unreadOnly } = req.query;

    const where: any = { userId: user.userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        relatedTask: {
          select: { id: true, title: true, projectId: true },
        },
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const count = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found.' } });
      return;
    }

    if (notification.userId !== user.userId) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied.' } });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    res.json({ notification: updated, unreadCount });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;

    await prisma.notification.updateMany({
      where: { userId: user.userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read.', unreadCount: 0 });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found.' } });
      return;
    }

    if (notification.userId !== user.userId) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied.' } });
      return;
    }

    await prisma.notification.delete({
      where: { id },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    res.json({ message: 'Notification removed successfully.', unreadCount });
  } catch (error) {
    next(error);
  }
}
