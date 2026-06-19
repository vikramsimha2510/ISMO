import { apiClient } from './client';

import type { AIInsight, ActivityLog, UpcomingDeadline, ChartDataPoint } from '../types';

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
  productivityScore: number;
  teamMembersCount: number;
  insights: AIInsight[];
  recentActivities: ActivityLog[];
  upcomingDeadlines: UpcomingDeadline[];
  progressTrend: ChartDataPoint[];
}

export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
};
