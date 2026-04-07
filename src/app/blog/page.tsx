import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogList from '@/components/blog/BlogList';

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
  const description = `Explore all posts on ${siteName}. ${settings?.seo?.defaultMetaDescription || settings?.siteDescription || ''}`.trim();
  const ogImage = settings?.seo?.defaultOgImage || settings?.logo || '';

  return {
    title: `Blog | ${siteName}`,
    description,
    openGraph: {
      type: 'website',
      title: `Blog | ${siteName}`,
      description,
      siteName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: siteName }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Blog | ${siteName}`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function BlogPage() {
  return (
    <div>
      <Header />
      <BlogList />
      <Footer />
    </div>
  );
}
