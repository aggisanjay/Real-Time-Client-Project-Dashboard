import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { Role } from '@prisma/client';

export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    let whereClause: any = {};

    if (user.role === Role.ADMIN) {
      whereClause = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      whereClause = { managerId: user.userId };
    } else if (user.role === Role.DEVELOPER) {
      // Developers only see projects they are actively assigned tasks in
      whereClause = {
        tasks: {
          some: {
            assignedToId: user.userId,
          },
        },
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
        tasks: {
          where:
            user.role === Role.DEVELOPER
              ? { assignedToId: user.userId }
              : undefined,
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found.' } });
      return;
    }

    // Role-based security checks
    if (user.role === Role.PROJECT_MANAGER && project.managerId !== user.userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to view this project.',
        },
      });
      return;
    }

    if (user.role === Role.DEVELOPER) {
      const hasAssignedTask = await prisma.task.findFirst({
        where: { projectId: id, assignedToId: user.userId },
      });
      if (!hasAssignedTask) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have assigned tasks in this project.',
          },
        });
        return;
      }
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { name, clientId, managerId } = req.body;

    let assignedManagerId: string;
    if (user.role === Role.ADMIN) {
      assignedManagerId = managerId || user.userId;
    } else if (user.role === Role.PROJECT_MANAGER) {
      assignedManagerId = user.userId;
    } else {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Developers cannot create projects.',
        },
      });
      return;
    }

    const project = await prisma.project.create({
      data: {
        name,
        clientId,
        managerId: assignedManagerId,
      },
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { name, clientId, managerId } = req.body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found.' } });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && existing.managerId !== user.userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update projects that you manage.',
        },
      });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(clientId && { clientId }),
        ...(user.role === Role.ADMIN && managerId && { managerId }),
      },
      include: {
        client: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found.' } });
      return;
    }

    if (user.role !== Role.ADMIN) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only Administrators can delete projects.',
        },
      });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
