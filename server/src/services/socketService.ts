import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken, TokenUserPayload } from './tokenService.js';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { Role, TaskStatus } from '@prisma/client';

export interface ActivityPayload {
  id: string;
  userName: string;
  userEmail: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  timestamp: string;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  relatedTaskId: string | null;
  createdAt: string;
}

export interface OnlineUserInfo {
  userId: string;
  name: string;
  email: string;
  role: Role;
  connectedSockets: number;
  lastActive: string;
}

class SocketService {
  private io: SocketIOServer | null = null;
  // In-memory presence map: userId -> count of open sockets
  private activeSocketsMap = new Map<string, number>();
  // Cached user profiles for active users
  private activeUsersMap = new Map<string, OnlineUserInfo>();

  public initialize(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ENV.CORS_ORIGIN,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    // Authentication middleware for socket connections
    this.io.use(async (socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token is required for WebSocket'));
        }

        const payload = verifyAccessToken(token);
        if (!payload) {
          return next(new Error('Invalid or expired token for WebSocket'));
        }

        (socket as any).user = payload;
        next();
      } catch (err) {
        next(new Error('WebSocket authentication failed'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as TokenUserPayload;
      if (!user) {
        socket.disconnect(true);
        return;
      }

      const { userId, role, name, email } = user;

      // 1. Join user-specific room
      socket.join(`user:${userId}`);

      // 2. Join role-specific room if admin
      if (role === Role.ADMIN) {
        socket.join('role:admin');
      }

      // 3. Track Presence
      const currentCount = this.activeSocketsMap.get(userId) || 0;
      this.activeSocketsMap.set(userId, currentCount + 1);

      this.activeUsersMap.set(userId, {
        userId,
        name,
        email,
        role,
        connectedSockets: currentCount + 1,
        lastActive: new Date().toISOString(),
      });

      // Broadcast presence update
      this.broadcastPresence();

      // Client joins a project room (e.g. when opening a project detail or kanban)
      socket.on('join:project', (projectId: string) => {
        if (projectId) {
          socket.join(`project:${projectId}`);
        }
      });

      socket.on('leave:project', (projectId: string) => {
        if (projectId) {
          socket.leave(`project:${projectId}`);
        }
      });

      // On disconnect
      socket.on('disconnect', () => {
        const remaining = (this.activeSocketsMap.get(userId) || 1) - 1;
        if (remaining <= 0) {
          this.activeSocketsMap.delete(userId);
          this.activeUsersMap.delete(userId);
        } else {
          this.activeSocketsMap.set(userId, remaining);
          const existing = this.activeUsersMap.get(userId);
          if (existing) {
            existing.connectedSockets = remaining;
          }
        }
        this.broadcastPresence();
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized.');
    }
    return this.io;
  }

  // Broadcast presence details
  public broadcastPresence(): void {
    if (!this.io) return;

    const onlineUsers = Array.from(this.activeUsersMap.values());
    const onlineCount = this.activeSocketsMap.size;

    this.io.emit('presence:update', {
      onlineCount,
      users: onlineUsers,
    });
  }

  // Emit task status change to relevant rooms
  public emitTaskStatusChange(
    activity: ActivityPayload,
    projectId: string,
    managerId: string,
    assigneeId: string
  ): void {
    if (!this.io) return;

    // 1. Broadcast to the project room (for anyone viewing this project's board)
    this.io.to(`project:${projectId}`).emit('task:status_changed', activity);

    // 2. Broadcast to Admin room (global feed)
    this.io.to('role:admin').emit('activity:new', activity);

    // 3. Broadcast to PM user room
    this.io.to(`user:${managerId}`).emit('activity:new', activity);

    // 4. Broadcast to Assignee user room (if distinct from PM)
    if (assigneeId !== managerId) {
      this.io.to(`user:${assigneeId}`).emit('activity:new', activity);
    }
  }

  // Emit new notification directly to a specific user
  public emitNotification(userId: string, notification: NotificationPayload): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('notification:new', notification);
  }

  // Force a user to refresh their JWT immediately (e.g. role change)
  public emitForcePermissionRefresh(userId: string): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('force_permission_refresh', {
      message: 'Your permissions or account role have been updated. Refreshing credentials.',
    });
  }

  public getOnlineUsers(): OnlineUserInfo[] {
    return Array.from(this.activeUsersMap.values());
  }

  public getOnlineCount(): number {
    return this.activeSocketsMap.size;
  }
}

export const socketService = new SocketService();
