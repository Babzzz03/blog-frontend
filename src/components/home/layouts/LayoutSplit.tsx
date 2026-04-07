'use client';

// Layout: "Essos" style — big featured post left, latest posts list right, then 3-col grid below

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import EmailSubscribeForm from '@/components/common/EmailSubscribeForm';
import { LayoutProps } from './types';

function readTime(post: any) {
  const words = (post.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function LayoutSplit({
  posts, categories, settings, totalPosts, currentPage, postsPerPage,
  activeCategory, searchTerm,
  onPageChange, onCategoryChange, onSearchSubmit, onSearchChange,
}: LayoutProps) {
  const hp = settings?.homepage;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const featured = posts[0];
  const latestList = posts.slice(1, 5);
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {hp?.heroTitle || settings?.siteName || 'Our Blog'}
            </h1>
            {hp?.heroSubtitle && (
              <p className="text-muted-foreground text-base max-w-lg">{hp.heroSubtitle}</p>
            )}
          </motion.div>

          {/* Featured + Latest split */}
          {(hp?.showFeaturedPost !== false) && featured && (
            <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
              {/* Big featured */}
              <Link href={`/blog/${featured.slug}`} className="group relative block rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
                <Image src={featured.image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <Badge className="mb-2 bg-primary/90 text-xs">{featured.category}</Badge>
                  <h2 className="text-xl md:text-2xl font-bold leading-tight mb-2">{featured.title}</h2>
                  {(featured as any).excerpt && (
                    <p className="text-sm text-white/80 line-clamp-2 mb-2">{(featured as any).excerpt}</p>
                  )}
                  <p className="text-xs text-white/60">{format(new Date(featured.createdAt), 'MMM d, yyyy')} · {readTime(featured)}</p>
                </div>
              </Link>

              {/* Latest list */}
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Latest Posts</h3>
                <div className="space-y-4">
                  {latestList.map((post) => (
                    <Link key={post._id} href={`/blog/${post.slug}`} className="group flex gap-3">
                      <div className="relative h-16 w-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground mb-0.5">{post.category} · {readTime(post)}</p>
                        <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-1">{format(new Date(post.createdAt), 'MMM d')} · {post.author?.name || 'Author'}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section label + category filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Explore</p>
            <h2 className="text-xl font-bold">All Posts</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {['All', ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 3-col grid */}
          <div className="flex-1">
            {posts.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No posts found.</p>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {gridPosts.map((post, i) => (
                  <motion.article key={post._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-muted">
                        <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        <Badge className="absolute top-3 left-3 text-[10px] bg-primary/90">{post.category}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-1">{format(new Date(post.createdAt), 'MMM d, yyyy')} · {readTime(post)}</p>
                      <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">{post.title}</h3>
                      {(post as any).excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{(post as any).excerpt}</p>
                      )}
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}

            <div className="flex justify-center items-center gap-3 mt-10">
              <Button variant="outline" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="text-sm text-muted-foreground">{currentPage} / {totalPages || 1}</span>
              <Button variant="outline" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage >= totalPages}>Next</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-60 shrink-0 space-y-6">
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="text-sm" />
              <Button type="submit" size="icon" variant="outline"><Search className="h-4 w-4" /></Button>
            </form>
            {(hp?.showNewsletter !== false) && <EmailSubscribeForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
