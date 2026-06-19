import { apiClient } from './client';
import type { MembersResponse } from '../types';

export const membersApi = {
  getMembers: async (projectId: string) => {
    const res = await apiClient.get<MembersResponse>(`/projects/${projectId}/members`);
    return res.data;
  },

  joinProject: async (inviteCode: string) => {
    const res = await apiClient.post<{ project: { id: string; name: string; description?: string; status: string } }>(
      '/projects/join',
      { inviteCode },
    );
    return res.data;
  },

  removeMember: async (projectId: string, userId: string) => {
    const res = await apiClient.delete<{ message: string }>(`/projects/${projectId}/members/${userId}`);
    return res.data;
  },

  regenerateInvite: async (projectId: string) => {
    const res = await apiClient.post<{ inviteCode: string; inviteEnabled: boolean }>(
      `/projects/${projectId}/invite/regenerate`,
    );
    return res.data;
  },

  toggleInvite: async (projectId: string) => {
    const res = await apiClient.patch<{ inviteCode: string; inviteEnabled: boolean }>(
      `/projects/${projectId}/invite/toggle`,
    );
    return res.data;
  },
};
