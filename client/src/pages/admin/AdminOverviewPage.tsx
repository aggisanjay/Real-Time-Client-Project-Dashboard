import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api.js';
import { socketService } from '../../services/socket.js';
import { Project, Task, OnlineUser } from '../../types/index.js';
import { ActivityFeedPanel } from '../../components/shared/ActivityFeedPanel.js';
import {
  FolderKanban,
  AlertTriangle,
  Users,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOverviewPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [projData, taskData, presenceData] = await Promise.all([
          apiFetch<{ projects: Project[] }>('/api/projects'),
          apiFetch<{ tasks: Task[] }>('/api/tasks'),
          apiFetch<{ onlineCount: number; users: OnlineUser[] }>('/api/users/presence').catch(() => null),
        ]);

        if (projData) setProjects(projData.projects || []);
        if (taskData) setTasks(taskData.tasks || []);
        if (presenceData) setOnlineCount(presenceData.onlineCount || 1);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Subscribe to presence updates
    const unsubscribePresence = socketService.subscribeToPresence((data) => {
      setOnlineCount(data.onlineCount);
    });

    // Subscribe to task updates
    const unsubscribeStatus = socketService.subscribeToStatusChange((activity) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === activity.taskId ? { ...t, status: activity.toStatus } : t))
      );
    });

    return () => {
      unsubscribePresence();
      unsubscribeStatus();
    };
  }, []);

  const totalProjects = projects.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Executive Operations Overview
          </h1>
          <p className="text-xs text-muted-foreground">
            Cross-client metrics, live status transitions, and real-time team presence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/tasks"
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Open Master Board <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid - Exact Talent Portal Dark Mode Tokens */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Projects
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-foreground">{totalProjects}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">Across 3 Enterprise Clients</p>
          </div>
        </div>

        {/* In Progress / Active */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Workflow
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/15 text-warning">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-foreground">{inProgressTasks + inReviewTasks}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {inProgressTasks} In Progress • {inReviewTasks} In Review
            </p>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overdue Flags
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-destructive">{overdueTasks}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">Auto-flagged by background scheduler</p>
          </div>
        </div>

        {/* Live Online Users */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Team Online
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-foreground">{onlineCount}</h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
              </span>
              active now
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Connected via Socket.io</p>
        </div>
      </div>

      {/* Main Grid: Projects Status & Live Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Projects Summary */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Active Projects Summary</h2>
              <p className="text-[11px] text-muted-foreground">Progress and task status distribution</p>
            </div>
            <Link
              to="/admin/projects"
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View All Projects
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No projects found.</p>
            ) : (
              projects.map((p) => {
                const projectTasks = tasks.filter((t) => t.projectId === p.id);
                const doneCount = projectTasks.filter((t) => t.status === 'DONE').length;
                const percent = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:bg-secondary/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                          {p.client?.name || 'Client'}
                        </span>
                        <h4 className="text-xs font-bold text-foreground">{p.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Managed by: <span className="font-medium text-foreground">{p.manager?.name}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground">{percent}%</span>
                        <p className="text-[10px] text-muted-foreground">
                          {doneCount}/{projectTasks.length} Done
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeedPanel maxHeight="max-h-[460px]" />
        </div>
      </div>
    </div>
  );
};
