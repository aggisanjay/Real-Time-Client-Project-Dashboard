import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { socketService } from '../services/socketService.js';
import { Role, TaskStatus, TaskPriority } from '@prisma/client';

export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { status, priority, projectId, assignedToId, isOverdue, dueDateFrom, dueDateTo } = req.query;

    const where: any = {};

    // 1. Role-based scoping at DB level
    if (user.role === Role.ADMIN) {
      if (assignedToId) where.assignedToId = String(assignedToId);
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM can only see tasks of projects they manage
      where.project = { managerId: user.userId };
      if (assignedToId) where.assignedToId = String(assignedToId);
    } else if (user.role === Role.DEVELOPER) {
      // Developer ONLY sees tasks assigned to them
      where.assignedToId = user.userId;
    }

    // 2. Query param filters
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      where.status = status as TaskStatus;
    }

    if (priority && Object.values(TaskPriority).includes(priority as TaskPriority)) {
      where.priority = priority as TaskPriority;
    }

    if (projectId) {
      where.projectId = String(projectId);
    }

    if (isOverdue !== undefined) {
      where.isOverdue = isOverdue === 'true';
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(String(dueDateFrom));
      if (dueDateTo) where.dueDate.lte = new Date(String(dueDateTo));
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, managerId: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        activityLogs: {
          orderBy: { timestamp: 'desc' },
          take: 5,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: [
        { isOverdue: 'desc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            manager: { select: { id: true, name: true, email: true } },
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        activityLogs: {
          orderBy: { timestamp: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found.' } });
      return;
    }

    // Role-based security checks
    if (user.role === Role.DEVELOPER && task.assignedToId !== user.userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. You cannot view tasks assigned to other developers.',
        },
      });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && task.project.managerId !== user.userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. You cannot view tasks from projects you do not manage.',
        },
      });
      return;
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { projectId, title, description, assignedToId, status, priority, dueDate } = req.body;

    // Developers cannot create tasks
    if (user.role === Role.DEVELOPER) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Developers do not have permission to create tasks.',
        },
      });
      return;
    }

    // Verify project ownership for PM
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found.' } });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && project.managerId !== user.userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only create tasks for projects that you manage.',
        },
      });
      return;
    }

    const taskDueDate = new Date(dueDate);
    const isOverdue = taskDueDate < new Date() && status !== TaskStatus.DONE;

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        assignedToId,
        status: status || TaskStatus.TODO,
        priority: priority || TaskPriority.MEDIUM,
        dueDate: taskDueDate,
        isOverdue,
      },
      include: {
        project: { select: { id: true, name: true, managerId: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Create initial activity log
    await prisma.taskActivityLog.create({
      data: {
        taskId: task.id,
        userId: user.userId,
        fromStatus: TaskStatus.TODO,
        toStatus: task.status,
      },
    });

    // Send creation and assignment notifications to PM, Admins, Assignee, and Creator
    const createRecipientMap = new Map<string, boolean>();
    createRecipientMap.set(user.userId, true);

    if (task.project?.managerId) {
      createRecipientMap.set(task.project.managerId, task.project.managerId === user.userId);
    }
    if (task.assignedToId) {
      createRecipientMap.set(task.assignedToId, task.assignedToId === user.userId);
    }

    try {
      const admins = await prisma.user.findMany({
        where: { role: Role.ADMIN },
        select: { id: true },
      });
      for (const admin of admins) {
        if (!createRecipientMap.has(admin.id)) {
          createRecipientMap.set(admin.id, admin.id === user.userId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admins for task creation notification:', err);
    }

    for (const [userId, isActor] of createRecipientMap.entries()) {
      let message = `${user.name} created task: "${task.title}"`;
      let type = 'TASK_CREATED';

      if (isActor) {
        message = `You created task: "${task.title}"`;
      } else if (userId === task.assignedToId) {
        message = `You were assigned to task: "${task.title}"`;
        type = 'TASK_ASSIGNED';
      }

      try {
        const notif = await prisma.notification.create({
          data: {
            userId,
            type,
            message,
            relatedTaskId: task.id,
          },
        });

        socketService.emitNotification(userId, {
          id: notif.id,
          userId: notif.userId,
          type: notif.type,
          message: notif.message,
          isRead: notif.isRead,
          relatedTaskId: notif.relatedTaskId,
          createdAt: notif.createdAt.toISOString(),
        });
      } catch (err) {
        console.error(`Failed to send creation notification to ${userId}:`, err);
      }
    }

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

async function sendTaskStatusNotifications(params: {
  actor: { userId: string; name: string };
  task: { id: string; title: string; projectId: string };
  projectManagerId: string;
  assigneeId?: string | null;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
}): Promise<void> {
  const { actor, task, projectManagerId, assigneeId, toStatus } = params;

  // Build unique recipient list: actor, PM, assignee, and all Admins
  const recipientMap = new Map<string, boolean>(); // userId -> isActor
  recipientMap.set(actor.userId, true);

  if (projectManagerId) {
    recipientMap.set(projectManagerId, projectManagerId === actor.userId);
  }
  if (assigneeId) {
    recipientMap.set(assigneeId, assigneeId === actor.userId);
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { id: true },
    });
    for (const admin of admins) {
      if (!recipientMap.has(admin.id)) {
        recipientMap.set(admin.id, admin.id === actor.userId);
      }
    }
  } catch (err) {
    console.error('Failed to fetch admin users for notification:', err);
  }

  const formatStatus = (s: TaskStatus) => {
    switch (s) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.IN_REVIEW:
        return 'In Review';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return s;
    }
  };

  const statusName = formatStatus(toStatus);
  const type = toStatus === TaskStatus.IN_REVIEW ? 'TASK_IN_REVIEW' : 'TASK_STATUS_CHANGED';

  for (const [userId, isActor] of recipientMap.entries()) {
    const message = isActor
      ? `You moved "${task.title}" to ${statusName}`
      : `${actor.name} moved "${task.title}" to ${statusName}`;

    try {
      const notif = await prisma.notification.create({
        data: {
          userId,
          type,
          message,
          relatedTaskId: task.id,
        },
      });

      socketService.emitNotification(userId, {
        id: notif.id,
        userId: notif.userId,
        type: notif.type,
        message: notif.message,
        isRead: notif.isRead,
        relatedTaskId: notif.relatedTaskId,
        createdAt: notif.createdAt.toISOString(),
      });
    } catch (err) {
      console.error(`Failed to send status notification to ${userId}:`, err);
    }
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { title, description, assignedToId, status, priority, dueDate } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    if (!existingTask) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found.' } });
      return;
    }

    // Role-based restrictions on editing task attributes
    if (user.role === Role.DEVELOPER) {
      // Developers can only update task status via updateTaskStatus or this endpoint
      if (existingTask.assignedToId !== user.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You cannot modify tasks assigned to other developers.',
          },
        });
        return;
      }

      if (title || description !== undefined || assignedToId || priority || dueDate) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Developers can only update task status.',
          },
        });
        return;
      }
    } else if (user.role === Role.PROJECT_MANAGER) {
      if (existingTask.project.managerId !== user.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update tasks within projects you manage.',
          },
        });
        return;
      }
    }

    const previousStatus = existingTask.status;
    const nextStatus = status && Object.values(TaskStatus).includes(status) ? status : previousStatus;
    const taskDueDate = dueDate ? new Date(dueDate) : existingTask.dueDate;
    const isOverdue = taskDueDate < new Date() && nextStatus !== TaskStatus.DONE;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assignedToId && { assignedToId }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: taskDueDate }),
        isOverdue,
      },
      include: {
        project: { select: { id: true, name: true, managerId: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // If status changed, write activity log and push real-time events
    if (previousStatus !== nextStatus) {
      const activityLog = await prisma.taskActivityLog.create({
        data: {
          taskId: id,
          userId: user.userId,
          fromStatus: previousStatus,
          toStatus: nextStatus,
        },
      });

      const activityPayload = {
        id: activityLog.id,
        userName: user.name,
        userEmail: user.email,
        taskId: id,
        taskTitle: updatedTask.title,
        projectId: updatedTask.projectId,
        projectName: updatedTask.project.name,
        fromStatus: previousStatus,
        toStatus: nextStatus,
        timestamp: activityLog.timestamp.toISOString(),
      };

      // Real-time broadcast
      socketService.emitTaskStatusChange(
        activityPayload,
        updatedTask.projectId,
        updatedTask.project.managerId,
        updatedTask.assignedToId
      );

      // Notify all stakeholders (actor, PM, assignee) on status change
      await sendTaskStatusNotifications({
        actor: { userId: user.userId, name: user.name },
        task: { id, title: updatedTask.title, projectId: updatedTask.projectId },
        projectManagerId: updatedTask.project.managerId,
        assigneeId: updatedTask.assignedToId,
        fromStatus: previousStatus,
        toStatus: nextStatus,
      });
    } else if (title !== undefined || description !== undefined || priority !== undefined || dueDate !== undefined) {
      // If status did not change, but task details were updated
      const recipientMap = new Map<string, boolean>();
      recipientMap.set(user.userId, true);
      if (updatedTask.project.managerId) {
        recipientMap.set(updatedTask.project.managerId, updatedTask.project.managerId === user.userId);
      }
      if (updatedTask.assignedToId) {
        recipientMap.set(updatedTask.assignedToId, updatedTask.assignedToId === user.userId);
      }

      try {
        const admins = await prisma.user.findMany({
          where: { role: Role.ADMIN },
          select: { id: true },
        });
        for (const admin of admins) {
          if (!recipientMap.has(admin.id)) {
            recipientMap.set(admin.id, admin.id === user.userId);
          }
        }
      } catch (err) {
        console.error('Failed to fetch admins for task detail notification:', err);
      }

      for (const [userId, isActor] of recipientMap.entries()) {
        const message = isActor
          ? `You updated task: "${updatedTask.title}"`
          : `${user.name} updated task: "${updatedTask.title}"`;

        try {
          const notif = await prisma.notification.create({
            data: {
              userId,
              type: 'TASK_UPDATED',
              message,
              relatedTaskId: id,
            },
          });

          socketService.emitNotification(userId, {
            id: notif.id,
            userId: notif.userId,
            type: notif.type,
            message: notif.message,
            isRead: notif.isRead,
            relatedTaskId: notif.relatedTaskId,
            createdAt: notif.createdAt.toISOString(),
          });
        } catch (err) {
          console.error(`Failed to send update notification to ${userId}:`, err);
        }
      }
    }

    // If reassigned to a new developer
    if (assignedToId && assignedToId !== existingTask.assignedToId) {
      const reassignRecipientMap = new Map<string, boolean>();
      reassignRecipientMap.set(assignedToId, assignedToId === user.userId);
      reassignRecipientMap.set(user.userId, true);

      if (updatedTask.project.managerId) {
        reassignRecipientMap.set(updatedTask.project.managerId, updatedTask.project.managerId === user.userId);
      }

      try {
        const admins = await prisma.user.findMany({
          where: { role: Role.ADMIN },
          select: { id: true },
        });
        for (const admin of admins) {
          if (!reassignRecipientMap.has(admin.id)) {
            reassignRecipientMap.set(admin.id, admin.id === user.userId);
          }
        }
      } catch (err) {
        console.error('Failed to fetch admins for task reassign notification:', err);
      }

      for (const [userId, isActor] of reassignRecipientMap.entries()) {
        let message = `${user.name} reassigned task "${updatedTask.title}"`;
        let type = 'TASK_UPDATED';

        if (userId === assignedToId && !isActor) {
          message = `You were assigned to task: "${updatedTask.title}"`;
          type = 'TASK_ASSIGNED';
        } else if (isActor) {
          message = `You reassigned task: "${updatedTask.title}"`;
        }

        try {
          const notif = await prisma.notification.create({
            data: {
              userId,
              type,
              message,
              relatedTaskId: id,
            },
          });

          socketService.emitNotification(userId, {
            id: notif.id,
            userId: notif.userId,
            type: notif.type,
            message: notif.message,
            isRead: notif.isRead,
            relatedTaskId: notif.relatedTaskId,
            createdAt: notif.createdAt.toISOString(),
          });
        } catch (err) {
          console.error(`Failed to send reassign notification to ${userId}:`, err);
        }
      }
    }

    res.json({ task: updatedTask });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user!;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!existingTask) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found.' } });
      return;
    }

    // Role-based authorization
    if (user.role === Role.DEVELOPER && existingTask.assignedToId !== user.userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update the status of tasks assigned to you.',
        },
      });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && existingTask.project.managerId !== user.userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update tasks within projects you manage.',
        },
      });
      return;
    }

    const previousStatus = existingTask.status;
    const isOverdue = existingTask.dueDate < new Date() && status !== TaskStatus.DONE;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        isOverdue,
      },
      include: {
        project: { select: { id: true, name: true, managerId: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Write activity log
    const activityLog = await prisma.taskActivityLog.create({
      data: {
        taskId: id,
        userId: user.userId,
        fromStatus: previousStatus,
        toStatus: status,
      },
    });

    const activityPayload = {
      id: activityLog.id,
      userName: user.name,
      userEmail: user.email,
      taskId: id,
      taskTitle: updatedTask.title,
      projectId: updatedTask.projectId,
      projectName: updatedTask.project.name,
      fromStatus: previousStatus,
      toStatus: status,
      timestamp: activityLog.timestamp.toISOString(),
    };

    // Real-time broadcast
    socketService.emitTaskStatusChange(
      activityPayload,
      updatedTask.projectId,
      updatedTask.project.managerId,
      updatedTask.assignedToId
    );

    // Notify all stakeholders (actor, PM, assignee) on any status change
    await sendTaskStatusNotifications({
      actor: { userId: user.userId, name: user.name },
      task: { id, title: updatedTask.title, projectId: updatedTask.projectId },
      projectManagerId: updatedTask.project.managerId,
      assigneeId: updatedTask.assignedToId,
      fromStatus: previousStatus,
      toStatus: status,
    });

    res.json({ task: updatedTask, activity: activityPayload });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existingTask) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found.' } });
      return;
    }

    if (user.role === Role.DEVELOPER) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Developers cannot delete tasks.',
        },
      });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && existingTask.project.managerId !== user.userId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete tasks from projects you manage.',
        },
      });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
