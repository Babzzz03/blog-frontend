import { apiClient } from '@/lib/api-client';

export const paymentService = {
  initializePaystack: (data: {
    type: 'tip' | 'purchase';
    postId: string;
    amount: number;
    currency?: string;
    payerName?: string;
    payerEmail: string;
  }) =>
    apiClient.post<{ reference: string; accessCode: string; authorizationUrl: string }>(
      '/payments/paystack/initialize',
      data
    ),

  verifyPaystack: (reference: string, type: 'tip' | 'purchase') =>
    apiClient.post<{ success: boolean }>('/payments/paystack/verify', { reference, type }),

  createStripeIntent: (data: {
    type: 'tip' | 'purchase';
    postId: string;
    amount: number;
    currency?: string;
    payerEmail: string;
  }) =>
    apiClient.post<{ clientSecret: string; paymentIntentId: string }>('/payments/stripe/intent', data),

  verifyStripe: (paymentIntentId: string, type: 'tip' | 'purchase') =>
    apiClient.post<{ success: boolean }>('/payments/stripe/verify', { paymentIntentId, type }),

  checkPurchase: (postId: string, email?: string) =>
    apiClient.get<{ purchased: boolean }>(
      `/payments/purchase/check/${postId}${email ? `?email=${encodeURIComponent(email)}` : ''}`
    ),

  getAnalytics: () => apiClient.get<any>('/payments/analytics'),
};
