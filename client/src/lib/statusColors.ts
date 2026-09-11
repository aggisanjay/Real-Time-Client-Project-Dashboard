import { TaskStatus } from '../types/index.js';

export interface StatusStyle {
  label: string;
  badgeClass: string;
  textClass: string;
  bgTintClass: string;
}

export const STATUS_MAP: Record<TaskStatus, StatusStyle> = {
  TODO: {
    label: 'To Do',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    textClass: 'text-muted-foreground',
    bgTintClass: 'bg-muted/80',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badgeClass: 'bg-primary/20 text-primary border-primary/30',
    textClass: 'text-primary',
    bgTintClass: 'bg-primary/20',
  },
  IN_REVIEW: {
    label: 'In Review',
    badgeClass: 'bg-warning/15 text-warning border-warning/30',
    textClass: 'text-warning',
    bgTintClass: 'bg-warning/15',
  },
  DONE: {
    label: 'Done',
    badgeClass: 'bg-success/15 text-success border-success/30',
    textClass: 'text-success',
    bgTintClass: 'bg-success/15',
  },
};

export function getStatusStyle(status: TaskStatus): StatusStyle {
  return STATUS_MAP[status] || STATUS_MAP.TODO;
}
