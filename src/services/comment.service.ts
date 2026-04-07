import { apiClient } from '@/lib/api-client';
import { Comment, PaginatedComments } from '@/types';

export const commentService = {
  getPostComments: (postId: string) =>
    apiClient.get<Comment[]>(`/comments/post/${postId}`),

  getAllComments: (params: { startIndex?: number; limit?: number; sort?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiClient.get<PaginatedComments>(`/comments${query ? `?${query}` : ''}`);
  },

  createComment: (data: { content: string; postId: string; userId: string; parentId?: string }) =>
    apiClient.post<Comment>('/comments', data),

  likeComment: (commentId: string) =>
    apiClient.put<Comment>(`/comments/like/${commentId}`, {}),

  editComment: (commentId: string, content: string) =>
    apiClient.put<Comment>(`/comments/${commentId}`, { content }),

  deleteComment: (commentId: string) =>
    apiClient.delete<{ message: string }>(`/comments/${commentId}`),
};
