import { apiClient } from '@/lib/api-client';
import { Post, PaginatedPosts } from '@/types';

type GetPostsParams = {
  startIndex?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  category?: string;
  searchTerm?: string;
  userId?: string;
  postId?: string;
  adminView?: boolean;
  status?: string;
};

export const postService = {
  getPosts: (params: GetPostsParams = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiClient.get<PaginatedPosts>(`/posts${query ? `?${query}` : ''}`);
  },

  getPostBySlug: (slug: string) => apiClient.get<Post>(`/posts/${slug}`),

  createPost: (data: Partial<Post>) => apiClient.post<Post>('/posts', data),

  updatePost: (postId: string, userId: string, data: Partial<Post>) =>
    apiClient.put<Post>(`/posts/${postId}/${userId}`, data),

  deletePost: (postId: string, userId: string) =>
    apiClient.delete<{ message: string }>(`/posts/${postId}/${userId}`),

  likePost: (postId: string) =>
    apiClient.put<Post>(`/posts/like/${postId}`, {}),
};
