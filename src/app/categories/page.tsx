import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoriesView from '@/components/blog/CategoriesView';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings?.siteName || 'My Blog';
  const description = `Browse all categories on ${siteName}.`;
  const ogImage = settings?.seo?.defaultOgImage || settings?.logo || '';

  return {
    title: `Categories | ${siteName}`,
    description,
    openGraph: {
      type: 'website',
      title: `Categories | ${siteName}`,
      description,
      siteName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: siteName }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `Categories | ${siteName}`,
      description,
    },
  };
}

export default function CategoriesPage() {
  return (
    <div>
      <Header />
      <CategoriesView />
      <Footer />
    </div>
  );
}
