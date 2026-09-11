import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../services/api.js';
import { Task } from '../../types/index.js';
import { KanbanBoard } from '../../components/shared/KanbanBoard.js';
import { FilterBar } from '../../components/shared/FilterBar.js';
import { TaskDetailModal } from '../../components/shared/TaskDetailModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { Terminal, CheckSquare } from 'lucide-react';

export const DevTasksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const query = searchParams.toString();
      const endpoint = query ? `/api/tasks?${query}` : '/api/tasks';
      const data = await apiFetch<{ tasks: Task[] }>(endpoint);
      if (data) setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch developer tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              My Assigned Tasks
            </h1>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
              {tasks.length} Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Drag cards across columns to update task progress. Moving to "In Review" alerts your PM.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex h-80 items-center justify-center rounded-2xl border border-border bg-card">
          <p className="text-xs text-muted-foreground animate-pulse">Loading your tasks...</p>
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
    </div>
  );
};
