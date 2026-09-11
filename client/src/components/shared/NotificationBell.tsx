import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, Inbox } from 'lucide-react';
import { Notification } from '../../types/index.js';
import { apiFetch } from '../../services/api.js';
import { socketService } from '../../services/socket.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await apiFetch<{ notifications: Notification[]; unreadCount: number }>(
        '/api/notifications'
      );
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch whenever authenticated user is available
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  // Subscribe to real-time events
  useEffect(() => {
    // 1. Listen for new direct user notifications
    const unsubscribeNotif = socketService.subscribeToNotifications((newNotif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    });

    // 2. Also listen for task status changes to sync notifications live
    const unsubscribeStatus = socketService.subscribeToStatusChange(() => {
      fetchNotifications();
    });

    return () => {
      unsubscribeNotif();
      unsubscribeStatus();
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ONLY clicking the X button removes a card from the notification box
  const handleRemoveNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const notifToRemove = notifications.find((n) => n.id === id);

    // Remove this card from the box immediately
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notifToRemove && !notifToRemove.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch {
      try {
        await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      } catch (err) {
        console.error('Failed to remove notification:', err);
      }
    }
  };

  // Mark all read changes status to read without removing cards from the box
  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
      // Keep cards in the box, update their visual state to read
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative overflow-visible"
        aria-label="Notifications"
      >
        <Bell className={`h-4 w-4 transition-colors ${unreadCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-md ring-2 ring-background animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <Badge variant="default" className="text-[10px]">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-7 text-[11px] gap-1 text-primary hover:text-primary"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
          </div>

          <div className="mt-2 max-h-80 space-y-2 overflow-y-auto pr-1">
            {isLoading && notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Inbox className="h-8 w-8 stroke-1 text-muted-foreground/50 mb-2" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group relative flex items-center justify-between gap-3 rounded-lg p-2.5 transition-colors ${
                    n.isRead
                      ? 'bg-card/40 opacity-75 hover:opacity-100 hover:bg-muted/40'
                      : 'bg-primary/5 border border-primary/15 hover:bg-primary/10'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden flex-1">
                    <p className={`text-xs ${n.isRead ? 'text-foreground/80 font-medium' : 'text-foreground font-semibold'} leading-snug`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* ONLY clicking X on the card removes it from the box */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemoveNotification(n.id, e)}
                    className="h-6 w-6 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Remove"
                    aria-label="Remove notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
