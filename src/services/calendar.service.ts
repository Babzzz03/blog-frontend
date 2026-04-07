import { apiClient } from '@/lib/api-client';

export type CalendarStatus = 'idea' | 'planned' | 'in-progress' | 'scheduled' | 'published';

export interface CalendarItem {
  _id: string;
  title: string;
  description: string;
  scheduledDate: string;
  status: CalendarStatus;
  category: string;
  linkedPostId: string | null;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CalendarItemInput = Omit<CalendarItem, '_id' | 'createdAt' | 'updatedAt'>;

export interface AiSuggestion {
  title: string;
  description: string;
  category: string;
  suggestedDay: number;
}

export interface AiSettings {
  count: number;
  tone: string;
  audience: string;
  customTopics: string;
  selectedCategories: string[];
}

export const calendarService = {
  getItems: (year: number, month: number) =>
    apiClient.get<CalendarItem[]>(`/calendar?year=${year}&month=${month}`),

  createItem: (data: Partial<CalendarItemInput>) =>
    apiClient.post<CalendarItem>('/calendar', data),

  updateItem: (id: string, data: Partial<CalendarItemInput>) =>
    apiClient.put<CalendarItem>(`/calendar/${id}`, data),

  deleteItem: (id: string) =>
    apiClient.delete<{ message: string }>(`/calendar/${id}`),

  suggestItems: (
    year: number,
    month: number,
    existingItems: CalendarItem[],
    settings: AiSettings
  ) =>
    apiClient.post<{ suggestions: AiSuggestion[]; availableCategories: string[] }>(
      '/calendar/ai/suggest',
      { year, month, existingItems, ...settings }
    ),
};
