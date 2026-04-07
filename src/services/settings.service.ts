import { apiClient } from '@/lib/api-client';

export interface CTA {
  _id: string;
  type: 'banner' | 'inline' | 'popup';
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
}

export interface HomepageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaUrl: string;
  showFeaturedPost: boolean;
  showNewsletter: boolean;
}

export interface GlobalSeoSettings {
  siteUrl: string;
  metaTitleTemplate: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  robotsConfig: string;
  googleVerification: string;
  bingVerification: string;
}

export interface SiteSettings {
  _id: string;
  siteName: string;
  siteDescription: string;
  logo: string;
  autoEmailNewPosts: boolean;
  socialLinks: { twitter: string; instagram: string; facebook: string; linkedin: string; github: string };
  ctas: CTA[];
  themeColor?: string;
  homepageLayout?: string;
  homepage: HomepageSettings;
  seo: GlobalSeoSettings;
}

export const settingsService = {
  getSettings: () => apiClient.get<SiteSettings>('/settings'),

  updateSettings: (data: Partial<SiteSettings>) =>
    apiClient.put<SiteSettings>('/settings', data),

  createCta: (data: Partial<CTA>) =>
    apiClient.post<SiteSettings>('/settings/ctas', data),

  updateCta: (ctaId: string, data: Partial<CTA>) =>
    apiClient.put<SiteSettings>(`/settings/ctas/${ctaId}`, data),

  deleteCta: (ctaId: string) =>
    apiClient.delete<SiteSettings>(`/settings/ctas/${ctaId}`),
};
