import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types/index.js';
import { TaskCard } from './TaskCard.js';
import { apiFetch } from '../../services/api.js';
import { socketService } from '../../services/socket.js';
import { Clock, CheckCircle2, Eye, ListTodo } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTasksChange?: (tasks: Task[]) => void;
  isDragDisabled?: boolean;
}

const COLUMNS: Array<{ status: TaskStatus; label: string; icon: React.ReactNode; color: string }> = [
  {
    status: 'TODO',
    label: 'To Do',
    icon: <ListTodo className="h-4 w-4 text-muted-foreground" />,
    color: 'border-t-muted-foreground',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    icon: <Clock className="h-4 w-4 text-primary" />,
    color: 'border-t-primary',
  },
  {
    status: 'IN_REVIEW',
    label: 'In Review',
    icon: <Eye className="h-4 w-4 text-warning" />,
    color: 'border-t-warning',
  },
  {
    status: 'DONE',
    label: 'Done',
    icon: <CheckCircle2 className="h-4 w-4 text-success" />,
    color: 'border-t-success',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks: initialTasks,
  onTaskClick,
  onTasksChange,
  isDragDisabled = false,
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Listen to live status changes pushed via Socket.io
  useEffect(() => {
    const unsubscribe = socketService.subscribeToStatusChange((activity) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === activity.taskId ? { ...t, status: activity.toStatus } : t))
      );
    });

    return () => unsubscribe();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Identify target status
    let targetStatus: TaskStatus | null = null;

    if (COLUMNS.some((col) => col.status === overId)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) return;

    const currentTask = tasks.find((t) => t.id === activeId);
    if (!currentTask || currentTask.status === targetStatus) return;

    const previousStatus = currentTask.status;

    // Optimistic UI update
    const updatedTasks = tasks.map((t) =>
      t.id === activeId ? { ...t, status: targetStatus! } : t
    );
    setTasks(updatedTasks);
    if (onTasksChange) onTasksChange(updatedTasks);

    // Call status update API
    try {
      await apiFetch(`/api/tasks/${activeId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: targetStatus }),
      });
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      // Revert optimistic update on failure
      const reverted = tasks.map((t) =>
        t.id === activeId ? { ...t, status: previousStatus } : t
      );
      setTasks(reverted);
      if (onTasksChange) onTasksChange(reverted);
      alert(err.message || 'Failed to move task. You may lack permission.');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              id={col.status}
              className={`flex flex-col rounded-2xl border border-border bg-card p-3.5 border-t-4 ${col.color}`}
            >
              {/* Column Header */}
              <div className="mb-3.5 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {col.label}
                  </h3>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <SortableContext
                id={col.status}
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="flex flex-1 flex-col gap-3 min-h-[400px] rounded-xl p-1"
                  id={col.status}
                >
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground/60">
                      Drop tasks here
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={onTaskClick}
                        isDragDisabled={isDragDisabled}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragDisabled /> : null}
      </DragOverlay>
    </DndContext>
  );
};
