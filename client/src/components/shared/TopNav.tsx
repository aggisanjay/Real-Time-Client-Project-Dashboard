import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { NotificationBell } from './NotificationBell.js';
import { ActiveUsersIndicator } from './ActiveUsersIndicator.js';
import { Button } from '../ui/button.js';
import { Avatar, AvatarFallback } from '../ui/avatar.js';
import { Badge } from '../ui/badge.js';
import { Separator } from '../ui/separator.js';
import { getAvatarColor } from '../../lib/avatar.js';
import { getStatusStyle } from '../../lib/statusColors.js';
import { Logo } from './Logo.js';
import { apiFetch } from '../../services/api.js';
import { Task, Project, User } from '../../types/index.js';
import { TaskDetailModal } from './TaskDetailModal.js';
import {
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Search,
  X,
  FolderKanban,
  CheckSquare,
  Users as UsersIcon,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface TopNavProps {
  onSearchChange?: (term: string) => void;
}

interface SearchResults {
  tasks: Task[];
  projects: Project[];
  users: Array<{ id: string; name: string; email: string; role: string }>;
}

export const TopNav: React.FC<TopNavProps> = ({ onSearchChange }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Global hotkey: Cmd+K or Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API search
  useEffect(() => {
    if (!searchValue.trim() || searchValue.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch<SearchResults>(`/api/search?q=${encodeURIComponent(searchValue.trim())}`);
        if (res) {
          setSearchResults(res);
        }
      } catch (err) {
        console.error('Search API error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleInputChange = (val: string) => {
    setSearchValue(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
    if (val.trim().length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    setSearchResults(null);
    setIsDropdownOpen(false);
    if (onSearchChange) {
      onSearchChange('');
    }
    searchInputRef.current?.focus();
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDropdownOpen(false);
  };

  const handleSelectProject = (project: Project) => {
    setIsDropdownOpen(false);
    if (user?.role === 'ADMIN') {
      navigate('/admin/projects');
    } else if (user?.role === 'PROJECT_MANAGER') {
      navigate('/pm');
    }
  };

  const handleSelectUser = (u: { id: string }) => {
    setIsDropdownOpen(false);
    if (user?.role === 'ADMIN') {
      navigate('/admin/users');
    }
  };

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
  const hasResults = searchResults && (
    searchResults.tasks.length > 0 ||
    searchResults.projects.length > 0 ||
    searchResults.users.length > 0
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/80 transition-colors">
        <div className="flex h-16 items-center justify-between px-3 sm:px-6 gap-2">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <Logo className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-foreground text-sm sm:text-base">AgencyFlow</span>
                <span className="hidden rounded-full bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider md:inline-flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> Real-time
                </span>
              </div>
              <p className="hidden text-[11px] text-muted-foreground sm:block">Client Project Intelligence</p>
            </div>
          </div>

          {/* Center: Sleek, Modern Global Search Bar */}
          <div ref={containerRef} className="relative flex-1 max-w-xs sm:max-w-md md:max-w-lg mx-2 sm:mx-4">
            <div className="group relative flex items-center w-full rounded-full border border-border/80 bg-secondary/40 hover:bg-secondary/70 focus-within:bg-card focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-center pl-3.5 pr-1.5 text-muted-foreground group-focus-within:text-primary transition-colors">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onFocus={() => {
                  if (searchValue.trim().length > 0) setIsDropdownOpen(true);
                }}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search projects, tasks, assignees..."
                className="w-full bg-transparent py-2 pr-12 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />

              {/* Right tools inside search input: Clear 'X' and Shortcut hint */}
              <div className="absolute right-2 flex items-center gap-1.5">
                {searchValue && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/70 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs select-none">
                  {isMac ? '⌘' : 'Ctrl'} K
                </kbd>
              </div>
            </div>

            {/* Instant Floating Command Palette Results Dropdown */}
            {isDropdownOpen && searchValue.trim().length >= 2 && (
              <div className="absolute left-0 top-full mt-2 w-full rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto">
                {isSearching && !searchResults && (
                  <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Searching workspace...
                  </div>
                )}

                {!isSearching && !hasResults && (
                  <div className="text-center py-7 px-4">
                    <p className="text-xs font-semibold text-foreground">No matches found</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      No tasks, projects, or team members matching &ldquo;{searchValue}&rdquo;
                    </p>
                  </div>
                )}

                {hasResults && (
                  <div className="space-y-3 p-1">
                    {/* Tasks Section */}
                    {searchResults.tasks.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <CheckSquare className="h-3.5 w-3.5 text-primary" /> Tasks ({searchResults.tasks.length})
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {searchResults.tasks.map((task) => {
                            const statusStyle = getStatusStyle(task.status);
                            return (
                              <button
                                key={task.id}
                                onClick={() => handleSelectTask(task)}
                                className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-secondary/70 transition-colors group"
                              >
                                <div className="truncate flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                      {task.title}
                                    </span>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle.badgeClass}`}>
                                      {statusStyle.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                    {task.project && <span>{task.project.name}</span>}
                                    {task.assignedTo && <span>• {task.assignedTo.name}</span>}
                                  </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                                  View &rarr;
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {searchResults.projects.length > 0 && (
                      <div>
                        {searchResults.tasks.length > 0 && <Separator className="my-2" />}
                        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <FolderKanban className="h-3.5 w-3.5 text-blue-500" /> Projects ({searchResults.projects.length})
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {searchResults.projects.map((proj) => (
                            <button
                              key={proj.id}
                              onClick={() => handleSelectProject(proj)}
                              className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-secondary/70 transition-colors group"
                            >
                              <div className="truncate flex-1">
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate block">
                                  {proj.name}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                  {proj.client && <span>Client: {proj.client.name}</span>}
                                  {proj.manager && <span>• Lead: {proj.manager.name}</span>}
                                </div>
                              </div>
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users Section */}
                    {searchResults.users.length > 0 && (
                      <div>
                        {(searchResults.tasks.length > 0 || searchResults.projects.length > 0) && (
                          <Separator className="my-2" />
                        )}
                        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <UsersIcon className="h-3.5 w-3.5 text-emerald-500" /> Team ({searchResults.users.length})
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {searchResults.users.map((u) => {
                            const uBg = getAvatarColor(u.name);
                            return (
                              <button
                                key={u.id}
                                onClick={() => handleSelectUser(u)}
                                className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-secondary/70 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <Avatar className="h-6 w-6 border border-border">
                                    <AvatarFallback
                                      style={{ backgroundColor: uBg }}
                                      className="text-[10px] font-bold text-white"
                                    >
                                      {u.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="truncate">
                                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                                      {u.name}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground block truncate">
                                      {u.email}
                                    </span>
                                  </div>
                                </div>
                                <Badge variant={getRoleVariant(u.role)}>
                                  {u.role.replace('_', ' ')}
                                </Badge>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer hint */}
                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between px-2 text-[10px] text-muted-foreground">
                  <span>Press <kbd className="rounded bg-muted px-1 py-0.5 text-[9px]">ESC</kbd> to close</span>
                  <span>Results filtered in real time</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions & User Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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

      {/* Task Detail Modal for tasks opened directly from search */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={(updated) => {
            setSelectedTask(updated);
          }}
        />
      )}
    </>
  );
};
