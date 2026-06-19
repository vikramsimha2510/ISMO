export type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type ProjectHealth = 'On Track' | 'At Risk' | 'Delayed';

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  taskCount?: number;
  completionPercentage?: number;
  health?: ProjectHealth;
  teamMembers?: TeamMember[];
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assignee?: TeamMember;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'success' | 'info';
  message: string;
  action?: string;
}

export interface ActivityLog {
  id: string;
  user: TeamMember;
  action: string;
  target: string;
  timestamp: string;
}

export interface UpcomingDeadline {
  id: string;
  projectId: string;
  projectName: string;
  taskName: string;
  dueDate: string;
  daysRemaining: number;
}

export interface ChartDataPoint {
  name: string;
  completed: number;
  expected: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
