import { apiClient } from '@/lib/api-client';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GeneratePostOptions {
  topic: string;
  keywords?: string;
  tone?: 'informative' | 'casual' | 'professional' | 'persuasive' | 'storytelling';
  length?: 'short' | 'medium' | 'long';
}

export interface GeneratedPost {
  title: string;
  excerpt: string;
  content: string;
}

export const aiService = {
  chat: (message: string, history: ChatMessage[]): Promise<{ reply: string }> =>
    apiClient.post('/ai/chat', { message, history }),

  adminChat: (message: string, history: ChatMessage[]): Promise<{ reply: string }> =>
    apiClient.post('/ai/admin-chat', { message, history }),

  generatePost: (options: GeneratePostOptions): Promise<GeneratedPost> =>
    apiClient.post('/ai/generate-post', options),

  refinePost: (content: string, instruction: string, targetWordCount?: number): Promise<{ content: string }> =>
    apiClient.post('/ai/refine-post', { content, instruction, targetWordCount }),

  suggestTitles: (topic?: string, content?: string): Promise<{ titles: string[] }> =>
    apiClient.post('/ai/suggest-titles', { topic, content }),

  summarize: (content: string): Promise<{ excerpt: string }> =>
    apiClient.post('/ai/summarize', { content }),

  translate: (texts: string[], targetLang: string): Promise<{ translations: string[] }> =>
    apiClient.post('/ai/translate', { texts, targetLang }),

  translationStatus: (): Promise<{ available: boolean }> =>
    apiClient.get('/ai/translation-status'),

  analyzeSeo: (data: {
    title?: string; content?: string; excerpt?: string;
    focusKeyword?: string; metaTitle?: string; metaDescription?: string; keywords?: string;
  }): Promise<{
    score: number; grade: string; suggestions: string[]; generatedMetaTitle: string;
    generatedMetaDescription: string; suggestedKeywords: string[];
    headingAnalysis: string; readabilityScore: string; positives: string[];
  }> => apiClient.post('/ai/seo/analyze', data),

  generateSeoMeta: (data: {
    title: string; content?: string; excerpt?: string; focusKeyword?: string; siteName?: string;
  }): Promise<{
    metaTitle: string; metaDescription: string; ogTitle: string; ogDescription: string;
    twitterTitle: string; twitterDescription: string; keywords: string; slug: string;
  }> => apiClient.post('/ai/seo/generate-meta', data),

  getUsage: (): Promise<{
    date: string;
    requestCount: number;
    totalTokens: number;
    dailyLimit: number;
    resetAt: string;
  }> => apiClient.get('/ai/usage'),
};
