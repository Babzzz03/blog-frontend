import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';

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
  const siteName = settings?.siteName || 'My Blogs';
  const description = settings?.seo?.defaultMetaDescription || settings?.siteDescription || 'A modern blog platform';
  const ogImage = settings?.seo?.defaultOgImage || settings?.logo || '';
  const siteUrl = settings?.seo?.siteUrl || '';
  const googleVerification = settings?.seo?.googleVerification || '';
  const bingVerification = settings?.seo?.bingVerification || '';

  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description,
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    verification: {
      ...(googleVerification && { google: googleVerification }),
      ...(bingVerification && { other: { 'msvalidate.01': bingVerification } }),
    },
    openGraph: {
      type: 'website',
      title: siteName,
      description,
      siteName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: siteName }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function HomePage() {
  return (
    <div>
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
