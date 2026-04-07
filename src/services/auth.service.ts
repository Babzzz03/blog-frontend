import { apiClient } from '@/lib/api-client';
import { User } from '@/types';

export const authService = {
  signup: (data: { username: string; email: string; password: string }) =>
    apiClient.post<{ message: string }>('/auth/signup', data),

  signin: (data: { email: string; password: string }) =>
    apiClient.post<User>('/auth/signin', data),

  google: (data: { email: string; name: string; googlePhotoUrl: string }) =>
    apiClient.post<User>('/auth/google', data),

  signout: () => apiClient.post<{ message: string }>('/users/signout', {}),
};
