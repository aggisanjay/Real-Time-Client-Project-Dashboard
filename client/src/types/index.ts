export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  _count?: {
    assignedTasks: number;
    managedProjects: number;
  };
}

export interface Client {
  id: string;
  name: string;
  contactInfo: string;
  createdAt?: string;
  _count?: {
    projects: number;
  };
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  managerId: string;
  createdAt?: string;
  client?: Client;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

export interface TaskActivityLog {
  id: string;
  taskId: string;
  userId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  assignedToId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  createdAt?: string;
  updatedAt?: string;
  project?: {
    id: string;
    name: string;
    managerId: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  activityLogs?: TaskActivityLog[];
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: Role;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedTaskId: string | null;
  relatedTask?: {
    id: string;
    title: string;
    projectId: string;
  };
}

export interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
  connectedSockets: number;
  lastActive: string;
}
