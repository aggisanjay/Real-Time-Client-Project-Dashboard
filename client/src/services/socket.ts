import { io, Socket } from 'socket.io-client';
import { getAccessToken, setAccessToken } from './api.js';
import { ActivityFeedItem, Notification, OnlineUser } from '../types/index.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const MAX_AUTH_FAILURES = 3;

interface ExtendedSocket extends Socket {
  __activityListenersAttached?: boolean;
  __notificationListenersAttached?: boolean;
  __presenceListenersAttached?: boolean;
  __authListenersAttached?: boolean;
}

class SocketService {
  private socket: ExtendedSocket | null = null;
  private isInitializing: boolean = false;
  private authFailedCount: number = 0;
  private readyCallbacks: Array<(sock: Socket) => void> = [];

  // Subscription callbacks
  private activityListeners: Set<(activity: ActivityFeedItem) => void> = new Set();
  private notificationListeners: Set<(notification: Notification) => void> = new Set();
  private presenceListeners: Set<(data: { onlineCount: number; users: OnlineUser[] }) => void> = new Set();
  private statusChangeListeners: Set<(data: ActivityFeedItem) => void> = new Set();

  /**
   * Initializes or returns the singleton socket connection
   */
  public initSocket(): ExtendedSocket | null {
    const token = getAccessToken();
    if (!token) {
      return null;
    }

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.isInitializing) {
      return this.socket;
    }

    this.isInitializing = true;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const sock = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }) as ExtendedSocket;

    this.socket = sock;

    sock.on('connect', () => {
      console.log('⚡ [Socket] Connected successfully with ID:', sock.id);
      this.authFailedCount = 0;
      this.isInitializing = false;

      // Drain the ready queue
      while (this.readyCallbacks.length > 0) {
        const cb = this.readyCallbacks.shift();
        if (cb) {
          try {
            cb(sock);
          } catch (e) {
            console.error('[Socket] Ready callback error:', e);
          }
        }
      }
    });

    sock.on('connect_error', async (error) => {
      console.warn('⚠️ [Socket] Connection error:', error.message);
      this.isInitializing = false;

      if (error.message.includes('Authentication') || error.message.includes('token')) {
        this.authFailedCount++;
        if (this.authFailedCount >= MAX_AUTH_FAILURES) {
          console.error('🚨 [Socket] Max auth failures exceeded. Disconnecting.');
          sock.disconnect();
          window.dispatchEvent(new CustomEvent('auth:required'));
          return;
        }

        // Attempt refreshing token and re-authenticating socket
        try {
          const res = await fetch(`${SOCKET_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            setAccessToken(data.accessToken);
            sock.auth = { token: data.accessToken };
            sock.connect();
          }
        } catch (e) {
          console.error('[Socket] Auth refresh attempt failed:', e);
        }
      }
    });

    sock.on('disconnect', (reason) => {
      console.log('🔌 [Socket] Disconnected:', reason);
      this.isInitializing = false;
    });

    // Attach feature-scoped listeners idempotently
    this.attachAuthListeners(sock);
    this.attachActivityFeedListeners(sock);
    this.attachNotificationListeners(sock);
    this.attachPresenceListeners(sock);

    return sock;
  }

  /**
   * Ready queue: runs callback immediately if connected, else queues it
   */
  public onSocketReady(cb: (sock: Socket) => void): void {
    if (this.socket && this.socket.connected) {
      cb(this.socket);
    } else {
      this.readyCallbacks.push(cb);
    }
  }

  /**
   * Feature-scoped: Auth & Permission Refresh listeners
   */
  private attachAuthListeners(sock: ExtendedSocket): void {
    if (sock.__authListenersAttached) return;
    sock.__authListenersAttached = true;

    // Server-dispatched force permission refresh when roles/permissions change
    sock.on('force_permission_refresh', async (payload) => {
      console.log('🔄 [Socket] Force permission refresh triggered:', payload);
      try {
        const res = await fetch(`${SOCKET_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          sock.auth = { token: data.accessToken };
          window.dispatchEvent(new CustomEvent('role:updated', { detail: data.user }));
        }
      } catch (err) {
        console.error('Failed to handle force_permission_refresh:', err);
      }
    });
  }

  /**
   * Feature-scoped: Activity Feed listeners
   */
  private attachActivityFeedListeners(sock: ExtendedSocket): void {
    if (sock.__activityListenersAttached) return;
    sock.__activityListenersAttached = true;

    sock.on('activity:new', (activity: ActivityFeedItem) => {
      this.activityListeners.forEach((cb) => cb(activity));
    });

    sock.on('task:status_changed', (activity: ActivityFeedItem) => {
      this.statusChangeListeners.forEach((cb) => cb(activity));
    });
  }

  /**
   * Feature-scoped: Notification listeners
   */
  private attachNotificationListeners(sock: ExtendedSocket): void {
    if (sock.__notificationListenersAttached) return;
    sock.__notificationListenersAttached = true;

    sock.on('notification:new', (notification: Notification) => {
      this.notificationListeners.forEach((cb) => cb(notification));
    });
  }

  /**
   * Feature-scoped: Presence listeners
   */
  private attachPresenceListeners(sock: ExtendedSocket): void {
    if (sock.__presenceListenersAttached) return;
    sock.__presenceListenersAttached = true;

    sock.on('presence:update', (data: { onlineCount: number; users: OnlineUser[] }) => {
      this.presenceListeners.forEach((cb) => cb(data));
    });
  }

  // --- Public Subscriber Registration Methods ---

  public subscribeToActivity(cb: (activity: ActivityFeedItem) => void): () => void {
    this.activityListeners.add(cb);
    return () => this.activityListeners.delete(cb);
  }

  public subscribeToStatusChange(cb: (data: ActivityFeedItem) => void): () => void {
    this.statusChangeListeners.add(cb);
    return () => this.statusChangeListeners.delete(cb);
  }

  public subscribeToNotifications(cb: (notification: Notification) => void): () => void {
    this.notificationListeners.add(cb);
    return () => this.notificationListeners.delete(cb);
  }

  public subscribeToPresence(cb: (data: { onlineCount: number; users: OnlineUser[] }) => void): () => void {
    this.presenceListeners.add(cb);
    return () => this.presenceListeners.delete(cb);
  }

  public joinProjectRoom(projectId: string): void {
    this.onSocketReady((sock) => {
      sock.emit('join:project', projectId);
    });
  }

  public leaveProjectRoom(projectId: string): void {
    this.onSocketReady((sock) => {
      sock.emit('leave:project', projectId);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isInitializing = false;
    this.readyCallbacks = [];
  }
}

export const socketService = new SocketService();
