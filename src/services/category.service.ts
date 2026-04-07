import { apiClient } from '@/lib/api-client';
import { Category } from '@/types';

export const categoryService = {
  getCategories: () => apiClient.get<Category[]>('/categories'),

  getCategory: (params: { id?: string; name?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    return apiClient.get<Category>(`/categories/single?${query}`);
  },

  createCategory: (data: { name: string; description?: string; image?: string }) =>
    apiClient.post<Category>('/categories', data),

  updateCategory: (categoryId: string, data: Partial<Category>) =>
    apiClient.put<Category>(`/categories/${categoryId}`, data),

  deleteCategory: (categoryId: string) =>
    apiClient.delete<{ message: string }>(`/categories/${categoryId}`),
};
