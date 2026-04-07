import { apiClient } from '@/lib/api-client';

export interface Subscriber {
  _id: string;
  email: string;
  name: string;
  source: string;
  active: boolean;
  createdAt: string;
}

export interface SubscriberList {
  subscribers: Subscriber[];
  total: number;
  totalActive: number;
  lastMonth: number;
}

export const subscriberService = {
  subscribe: (email: string, name?: string, source?: string) =>
    apiClient.post<{ message: string }>('/subscribers/subscribe', { email, name, source }),

  getSubscribers: (params: { startIndex?: number; limit?: number; active?: boolean } = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString();
    return apiClient.get<SubscriberList>(`/subscribers${q ? `?${q}` : ''}`);
  },

  deleteSubscriber: (id: string) =>
    apiClient.delete<{ message: string }>(`/subscribers/${id}`),

  sendNewsletter: (subject: string, html: string) =>
    apiClient.post<{ message: string; sent: number }>('/subscribers/newsletter', { subject, html }),
};
