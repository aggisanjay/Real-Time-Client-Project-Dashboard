import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types/index.js';
import { X, Calendar, User, Clock, AlertCircle, History, Check } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { apiFetch } from '../../services/api.js';
import { getAvatarColor } from '../../lib/avatar.js';
import { getStatusStyle } from '../../lib/statusColors.js';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onTaskUpdated,
}) => {
  if (!task) return null;

  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      const res = await apiFetch<{ task: Task }>(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setCurrentStatus(newStatus);
      if (onTaskUpdated && res.task) {
        onTaskUpdated(res.task);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const assigneeBg = getAvatarColor(task.assignedTo?.name || 'User');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {task.project?.name || 'Project'}
            </span>
            <h2 className="text-lg font-bold text-foreground leading-snug">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-4">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground block mb-1">Status</span>
              <select
                value={currentStatus}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className={`rounded border px-2 py-1 text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary ${
                  getStatusStyle(currentStatus).badgeClass
                }`}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] font-medium text-muted-foreground block mb-1">Priority</span>
              <span className="inline-block rounded border border-border/80 bg-card px-2 py-1 text-xs font-bold uppercase text-foreground">
                {task.priority}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-muted-foreground block mb-1">Due Date</span>
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium pt-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'None'}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-muted-foreground block mb-1">Assignee</span>
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium pt-1 truncate">
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: assigneeBg }}
                >
                  {task.assignedTo?.name?.charAt(0) || 'U'}
                </div>
                <span className="truncate">{task.assignedTo?.name || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Description
            </h4>
            <p className="rounded-xl border border-border/60 bg-card/50 p-4 text-xs text-foreground leading-relaxed">
              {task.description || 'No detailed description provided for this task.'}
            </p>
          </div>

          {/* Activity Log / History */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <History className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Activity History
              </h4>
            </div>

            <div className="space-y-2 rounded-xl border border-border/60 bg-card/30 p-3 max-h-48 overflow-y-auto">
              {(!task.activityLogs || task.activityLogs.length === 0) ? (
                <p className="py-2 text-center text-xs text-muted-foreground">No recorded activity yet</p>
              ) : (
                task.activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between border-b border-border/30 pb-2 text-xs last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-semibold text-foreground">{log.user?.name || 'User'}</span>
                      <span className="text-muted-foreground">changed status</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                        {log.fromStatus}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {log.toStatus}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end border-t border-border pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
