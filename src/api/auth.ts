import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  login: async (data: any) => {
    const res = await apiClient.post<{ user: User; token: string }>('/auth/login', data);
    return res.data;
  },
  register: async (data: any) => {
    const res = await apiClient.post<{ user: User; token: string }>('/auth/register', data);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post<{ message: string }>('/auth/logout');
    return res.data;
  },
  forgotPassword: async (data: { email: string }) => {
    const res = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return res.data;
  },
  resetPassword: async (data: { password: string }, token?: string) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const res = await apiClient.post<{ message: string }>('/auth/reset-password', data, config);
    return res.data;
  },
};
