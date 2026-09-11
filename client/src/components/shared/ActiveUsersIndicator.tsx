import React, { useEffect, useState, useRef } from 'react';
import { Users, Circle } from 'lucide-react';
import { OnlineUser } from '../../types/index.js';
import { socketService } from '../../services/socket.js';
import { apiFetch } from '../../services/api.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { Avatar, AvatarFallback } from '../ui/avatar.js';
import { getAvatarColor } from '../../lib/avatar.js';

export const ActiveUsersIndicator: React.FC = () => {
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ onlineCount: number; users: OnlineUser[] }>('/api/users/presence')
      .then((data) => {
        if (data) {
          setOnlineCount(data.onlineCount || 1);
          setUsers(data.users || []);
        }
      })
      .catch(() => {});

    const unsubscribe = socketService.subscribeToPresence((data) => {
      setOnlineCount(data.onlineCount);
      setUsers(data.users);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleVariant = (role: string): "purple" | "info" | "success" => {
    switch (role) {
      case 'ADMIN':
        return 'purple';
      case 'PROJECT_MANAGER':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 h-8 border-border bg-card hover:bg-secondary"
        title="View online team members"
      >
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="font-bold text-foreground text-xs">{onlineCount}</span>
        <span className="hidden text-foreground sm:inline text-xs font-medium">online now</span>
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Team Members ({onlineCount})
            </h4>
            <span className="flex items-center gap-1.5 text-[11px] text-success font-semibold">
              <Circle className="h-2 w-2 fill-success text-success" /> Live
            </span>
          </div>

          <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
            {users.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No presence data available</p>
            ) : (
              users.map((u) => {
                const bg = getAvatarColor(u.name);
                return (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Avatar className="h-7 w-7 border border-border">
                        <AvatarFallback
                          style={{ backgroundColor: bg }}
                          className="text-[10px] font-bold text-white"
                        >
                          {u.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <p className="truncate text-xs font-medium text-foreground">{u.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant={getRoleVariant(u.role)} className="shrink-0 text-[9px]">
                      {u.role === 'PROJECT_MANAGER' ? 'PM' : u.role}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
