import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogPostView from '@/components/blog/BlogPostView';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getPost(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/posts/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);

  const siteName = settings?.siteName || 'My Blog';
  const siteUrl = settings?.seo?.siteUrl || '';
  const template = settings?.seo?.metaTitleTemplate || '%post_title% | %site_name%';
  const defaultOgImage = settings?.seo?.defaultOgImage || settings?.logo || '';
  const googleVerification = settings?.seo?.googleVerification || '';
  const bingVerification = settings?.seo?.bingVerification || '';

  if (!post) {
    return { title: `Post Not Found | ${siteName}` };
  }

  const seo = post.seo || {};
  const postUrl = `${siteUrl}/blog/${slug}`;

  const metaTitle = seo.metaTitle || template
    .replace('%post_title%', post.title)
    .replace('%site_name%', siteName);

  const metaDescription = seo.metaDescription ||
    settings?.seo?.defaultMetaDescription ||
    post.excerpt ||
    `Read "${post.title}" on ${siteName}`;

  const ogImage = seo.ogImage || post.image || defaultOgImage;
  const canonicalUrl = seo.canonicalUrl || postUrl;
  const robotsContent = seo.robots || 'index,follow';
  const [robotsIndex, robotsFollow] = robotsContent.split(',');

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: seo.keywords || undefined,
    authors: post.author ? [{ name: post.author.name }] : undefined,
    robots: {
      index: !robotsIndex?.includes('noindex'),
      follow: !robotsFollow?.includes('nofollow'),
      googleBot: {
        index: !robotsIndex?.includes('noindex'),
        follow: !robotsFollow?.includes('nofollow'),
      },
    },
    alternates: { canonical: canonicalUrl },
    verification: {
      ...(googleVerification && { google: googleVerification }),
      ...(bingVerification && { other: { 'msvalidate.01': bingVerification } }),
    },
    openGraph: {
      type: 'article',
      title: seo.ogTitle || metaTitle,
      description: seo.ogDescription || metaDescription,
      url: postUrl,
      siteName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }] : undefined,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      tags: seo.keywords ? seo.keywords.split(',').map((k: string) => k.trim()) : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || metaTitle,
      description: seo.twitterDescription || seo.ogDescription || metaDescription,
      images: seo.twitterImage || seo.ogImage || ogImage ? [seo.twitterImage || seo.ogImage || ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);

  const siteUrl = settings?.seo?.siteUrl || (typeof window === 'undefined' ? '' : window.location.origin);
  const siteName = settings?.siteName || 'My Blog';

  // JSON-LD structured data
  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt || '',
    image: post.seo?.ogImage || post.image || '',
    url: `${siteUrl}/blog/${slug}`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: post.author ? {
      '@type': 'Person',
      name: post.author.name,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: settings?.logo ? { '@type': 'ImageObject', url: settings.logo } : undefined,
    },
    keywords: post.seo?.keywords || '',
    articleSection: post.category,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${slug}`,
    },
  } : null;

  return (
    <div>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Header />
      <BlogPostView slug={slug} />
      <Footer />
    </div>
  );
}
