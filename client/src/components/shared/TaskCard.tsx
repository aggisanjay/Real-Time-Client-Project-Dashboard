import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority } from '../../types/index.js';
import { Card } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Avatar, AvatarFallback } from '../ui/avatar.js';
import { AlertCircle, Calendar, User as UserIcon } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { getAvatarColor } from '../../lib/avatar.js';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  isDragDisabled?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isDragDisabled = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragDisabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getPriorityVariant = (p: TaskPriority): "destructive" | "warning" | "info" | "outline" => {
    switch (p) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'outline';
    }
  };

  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No date';
  const isOverdue = task.isOverdue || (task.status !== 'DONE' && isPast(new Date(task.dueDate)));

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)}
      className="premium-card group cursor-grab active:cursor-grabbing p-3.5 space-y-2.5 rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all hover:shadow-md"
    >
      {/* Top row: Project Tag & Priority Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate max-w-[150px] rounded bg-muted/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          {task.project?.name || 'Project'}
        </span>

        <Badge variant={getPriorityVariant(task.priority)}>
          {task.priority}
        </Badge>
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {task.title}
      </h4>

      {/* Bottom row: Due date & Assignee Profile Avatar */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
        <div className="flex items-center gap-1.5">
          {isOverdue ? (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" /> Overdue
            </Badge>
          ) : (
            <span className="flex items-center gap-1 text-[10px]">
              <Calendar className="h-3 w-3 text-muted-foreground" /> {formattedDueDate}
            </span>
          )}
        </div>

        {task.assignedTo && (
          <div
            className="flex items-center gap-1.5 rounded-full bg-muted/60 pr-2 pl-0.5 py-0.5"
            title={`Assigned to ${task.assignedTo.name}`}
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback
                style={{ backgroundColor: getAvatarColor(task.assignedTo.name) }}
                className="text-[9px] font-bold text-white"
              >
                {task.assignedTo.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[80px] text-[10px] font-medium text-foreground">
              {task.assignedTo.name.split(' ')[0]}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
