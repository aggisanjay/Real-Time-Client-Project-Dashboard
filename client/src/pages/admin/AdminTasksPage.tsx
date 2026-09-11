import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../services/api.js';
import { Task, Project, User } from '../../types/index.js';
import { KanbanBoard } from '../../components/shared/KanbanBoard.js';
import { FilterBar } from '../../components/shared/FilterBar.js';
import { TaskDetailModal } from '../../components/shared/TaskDetailModal.js';
import { Plus, CheckSquare, Sparkles } from 'lucide-react';

export const AdminTasksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('');

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const query = searchParams.toString();
      const endpoint = query ? `/api/tasks?${query}` : '/api/tasks';
      const data = await apiFetch<{ tasks: Task[] }>(endpoint);
      if (data) setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchParams]);

  useEffect(() => {
    // Fetch projects and developers for creation dialog
    apiFetch<{ projects: Project[] }>('/api/projects').then((res) => {
      if (res) {
        setProjects(res.projects || []);
        if (res.projects?.length > 0) setNewProjectId(res.projects[0].id);
      }
    });

    apiFetch<{ users: User[] }>('/api/users?role=DEVELOPER').then((res) => {
      if (res) {
        setDevelopers(res.users || []);
        if (res.users?.length > 0) setNewAssigneeId(res.users[0].id);
      }
    });
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ task: Task }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          projectId: newProjectId,
          assignedToId: newAssigneeId,
          priority: newPriority,
          dueDate: newDueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (res && res.task) {
        setTasks((prev) => [res.task, ...prev]);
        setIsCreateOpen(false);
        setNewTitle('');
        setNewDescription('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create task.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Master Task Board
            </h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {tasks.length} Tasks
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Full cross-project Kanban orchestration with live socket updates.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Create New Task
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex h-80 items-center justify-center rounded-2xl border border-border/80 bg-card/40">
          <p className="text-xs text-muted-foreground animate-pulse">Loading task board...</p>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskClick={(t) => setSelectedTask(t)}
          onTasksChange={(updated) => setTasks(updated)}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={(updated) => {
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          setSelectedTask(updated);
        }}
      />

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-base font-bold text-foreground mb-4">Create New Task</h2>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Integrate Stripe Webhooks"
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Technical specifications or acceptance criteria..."
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Project</label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Assignee</label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    {developers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
