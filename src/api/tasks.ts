import { apiClient } from './client';
import { PaginatedResponse, Task } from '../types';

export const tasksApi = {
  getAll: async (params?: any) => {
    const res = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<Task>(`/tasks/${id}`);
    return res.data;
  },
  create: async (data: Partial<Task>) => {
    const res = await apiClient.post<Task>('/tasks', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Task>) => {
    const res = await apiClient.put<Task>(`/tasks/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
    return res.data;
  },
};
