import { apiClient } from '@/lib/api-client';
import { User, PaginatedUsers } from '@/types';

type GetUsersParams = { startIndex?: number; limit?: number; sort?: 'asc' | 'desc' };

export const userService = {
  getUsers: (params: GetUsersParams = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString();
    return apiClient.get<PaginatedUsers>(`/users${q ? `?${q}` : ''}`);
  },

  getUser: (userId: string) => apiClient.get<User>(`/users/${userId}`),

  adminUpdateUser: (userId: string, data: Partial<User & { isAdmin: boolean }>) =>
    apiClient.patch<User>(`/users/${userId}/admin`, data),

  deleteUser: (userId: string) =>
    apiClient.delete<{ message: string }>(`/users/${userId}`),
};
