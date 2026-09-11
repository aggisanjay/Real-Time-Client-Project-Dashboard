import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { NotificationBell } from './NotificationBell.js';
import { ActiveUsersIndicator } from './ActiveUsersIndicator.js';
import { Button } from '../ui/button.js';
import { Avatar, AvatarFallback } from '../ui/avatar.js';
import { Badge } from '../ui/badge.js';
import { Separator } from '../ui/separator.js';
import { getAvatarColor } from '../../lib/avatar.js';
import { Logo } from './Logo.js';
import {
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Search,
} from 'lucide-react';

interface TopNavProps {
  onSearchChange?: (term: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onSearchChange }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const getRoleVariant = (role?: string): "purple" | "info" | "success" => {
    switch (role) {
      case 'ADMIN':
        return 'purple';
      case 'PROJECT_MANAGER':
        return 'info';
      default:
        return 'success';
    }
  };

  const avatarBg = getAvatarColor(user?.name || 'User');

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Logo className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-foreground sm:text-base">AgencyFlow</span>
              <span className="hidden rounded-full bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider md:inline-flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> Real-time
              </span>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block">Client Project Intelligence</p>
          </div>
        </div>

        {/* Center: Global Search Input with muted icons */}
        <div className="hidden max-w-md flex-1 px-8 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, tasks, or assignees..."
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Active Users Indicator */}
          <ActiveUsersIndicator />

          {/* Notification Bell */}
          <NotificationBell />

          {/* Dark / Light Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-1.5 py-1 h-auto hover:bg-secondary rounded-full"
            >
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback
                  style={{ backgroundColor: avatarBg }}
                  className="text-xs font-bold text-white"
                >
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-semibold text-foreground md:inline pr-1">
                {user?.name?.split(' ')[0]}
              </span>
            </Button>

            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="p-2 space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback
                        style={{ backgroundColor: avatarBg }}
                        className="text-xs font-bold text-white"
                      >
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant={getRoleVariant(user?.role)}>
                      {user?.role === 'PROJECT_MANAGER' ? 'Project Manager' : user?.role}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-1" />

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full justify-start gap-2 text-xs"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
