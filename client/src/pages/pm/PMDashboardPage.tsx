import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api.js';
import { Project, Task } from '../../types/index.js';
import { ActivityFeedPanel } from '../../components/shared/ActivityFeedPanel.js';
import { FolderKanban, Clock, AlertCircle, ArrowUpRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isThisWeek } from 'date-fns';

export const PMDashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPMData = async () => {
      try {
        setIsLoading(true);
        const [projRes, taskRes] = await Promise.all([
          apiFetch<{ projects: Project[] }>('/api/projects'),
          apiFetch<{ tasks: Task[] }>('/api/tasks'),
        ]);

        if (projRes) setProjects(projRes.projects || []);
        if (taskRes) setTasks(taskRes.tasks || []);
      } catch (err) {
        console.error('Failed to load PM dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPMData();
  }, []);

  const totalManagedProjects = projects.length;
  const urgentTasks = tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;

  const upcomingDueThisWeek = tasks.filter(
    (t) => t.status !== 'DONE' && isThisWeek(new Date(t.dueDate))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Project Manager Hub
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor client project deliverables, review completed items, and track team pace.
          </p>
        </div>

        <Link
          to="/pm/board"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors self-start sm:self-auto"
        >
          Open Team Kanban <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Metrics Row - Exact Reference Match */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Projects
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-foreground">{totalManagedProjects}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">Client engagements managed by you</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Awaiting Review
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/15 text-warning">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-warning">{inReviewTasks}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">Requires PM sign-off</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Urgent Priority
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-destructive">{urgentTasks}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">Critical path blocking items</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overdue Tasks
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-destructive">{overdueTasks}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">Missed target deadlines</p>
          </div>
        </div>
      </div>

      {/* Main Split: Managed Projects & Live Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Managed Projects Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-3 border-b border-border pb-2">
              Assigned Projects Progress
            </h3>

            <div className="space-y-4">
              {isLoading ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No projects under your management.</p>
              ) : (
                projects.map((p) => {
                  const projTasks = tasks.filter((t) => t.projectId === p.id);
                  const doneCount = projTasks.filter((t) => t.status === 'DONE').length;
                  const pct = projTasks.length > 0 ? Math.round((doneCount / projTasks.length) * 100) : 0;

                  return (
                    <div key={p.id} className="rounded-xl border border-border/70 bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-primary uppercase">{p.client?.name}</span>
                          <h4 className="text-xs font-bold text-foreground">{p.name}</h4>
                        </div>
                        <span className="text-xs font-bold text-foreground">{pct}% Done</span>
                      </div>

                      <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Due Dates This Week */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-3 border-b border-border pb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Upcoming Deadlines This Week
            </h3>

            <div className="space-y-2.5">
              {upcomingDueThisWeek.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No upcoming task deadlines this week.</p>
              ) : (
                upcomingDueThisWeek.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground">Assignee: {t.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                      {format(new Date(t.dueDate), 'EEE, MMM dd')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Team Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeedPanel maxHeight="max-h-[550px]" />
        </div>
      </div>
    </div>
  );
};
