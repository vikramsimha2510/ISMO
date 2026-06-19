import { apiClient } from './client';
import { PaginatedResponse, Project } from '../types';

export const projectsApi = {
  getAll: async (params?: any) => {
    const res = await apiClient.get<PaginatedResponse<Project>>('/projects', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (data: Partial<Project>) => {
    const res = await apiClient.post<Project>('/projects', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Project>) => {
    const res = await apiClient.put<Project>(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ message: string }>(`/projects/${id}`);
    return res.data;
  },
};
