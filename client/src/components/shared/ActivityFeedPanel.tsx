import React, { useEffect, useState } from 'react';
import { ActivityFeedItem, TaskStatus } from '../../types/index.js';
import { apiFetch } from '../../services/api.js';
import { socketService } from '../../services/socket.js';
import { Activity, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarColor } from '../../lib/avatar.js';
import { getStatusStyle } from '../../lib/statusColors.js';

export const ActivityFeedPanel: React.FC<{ maxHeight?: string }> = ({
  maxHeight = 'max-h-[500px]',
}) => {
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Missed-event catch-up via role-scoped DB query
  const fetchFeedCatchup = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<{ feed: ActivityFeedItem[] }>('/api/activity/feed?limit=20');
      if (data && data.feed) {
        setFeed(data.feed);
      }
    } catch (err) {
      console.error('Failed to fetch activity feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedCatchup();

    // Subscribe to live broadcast updates from WebSocket
    const unsubscribe = socketService.subscribeToActivity((newActivity) => {
      setFeed((prev) => [newActivity, ...prev.slice(0, 49)]); // Keep latest 50
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground">Live Activity Feed</h3>
            <p className="text-[11px] text-muted-foreground">Real-time team project transitions</p>
          </div>
        </div>

        <button
          onClick={fetchFeedCatchup}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="Refresh feed"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className={`mt-3 space-y-3 overflow-y-auto pr-1 ${maxHeight}`}>
        {isLoading && feed.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin text-primary" /> Loading live feed...
          </div>
        ) : feed.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            No activity logs recorded yet.
          </div>
        ) : (
          feed.map((item) => {
            const avatarBg = getAvatarColor(item.userName);
            const fromStyle = getStatusStyle(item.fromStatus as TaskStatus);
            const toStyle = getStatusStyle(item.toStatus as TaskStatus);

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40 hover:bg-secondary/40"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: avatarBg }}
                >
                  {item.userName.charAt(0)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-foreground">{item.userName}</span>
                    <span className="text-muted-foreground">moved</span>
                    <span className="font-medium text-foreground underline decoration-primary/30 underline-offset-2">
                      {item.taskTitle}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-muted-foreground truncate max-w-[130px]">
                      {item.projectName}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className={`rounded border px-1.5 py-0.5 font-semibold ${fromStyle.badgeClass}`}>
                      {item.fromStatus}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className={`rounded border px-1.5 py-0.5 font-semibold ${toStyle.badgeClass}`}>
                      {item.toStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 pt-0.5 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
