'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, ThumbsUp, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import EmailSubscribeForm from '@/components/common/EmailSubscribeForm';
import { LayoutProps } from './types';

function readTime(post: any) {
  const words = (post.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function LayoutMagazine({
  posts, categories, settings, totalPosts, currentPage, postsPerPage,
  activeCategory, searchTerm,
  onPageChange, onCategoryChange, onSearchSubmit, onSearchChange,
}: LayoutProps) {
  const hp = settings?.homepage;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const [hero, ...rest] = posts;
  const trending = rest.slice(0, 3);
  const main = rest.slice(3);

  return (
    <div className="min-h-screen bg-background">
      {/* Breaking news ticker */}
      {hero && (
        <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
          <div className="container mx-auto px-4 flex items-center gap-4">
            <span className="font-bold text-xs uppercase tracking-wider shrink-0 bg-primary-foreground/20 px-2 py-0.5 rounded">Latest</span>
            <p className="text-sm truncate">{hero.title}</p>
          </div>
        </div>
      )}

      {/* Hero grid — big left + 2x2 right */}
      {(hp?.showFeaturedPost !== false) && hero && (
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
              {/* Big hero */}
              <Link href={`/blog/${hero.slug}`} className="group relative block rounded-xl overflow-hidden aspect-[16/9] bg-muted">
                <Image src={hero.image} alt={hero.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <Badge className="mb-2 bg-primary text-primary-foreground text-xs">{hero.category}</Badge>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-2">{hero.title}</h2>
                  <p className="text-xs text-white/70 flex items-center gap-2">
                    <span>{hero.author?.name || 'Author'}</span>·
                    <span>{formatDistanceToNow(new Date(hero.createdAt), { addSuffix: true })}</span>·
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime(hero)}</span>
                  </p>
                </div>
              </Link>

              {/* 2x2 small grid */}
              <div className="grid grid-cols-2 gap-3">
                {trending.map((post) => (
                  <Link key={post._id} href={`/blog/${post.slug}`} className="group relative block rounded-lg overflow-hidden aspect-square bg-muted">
                    <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 p-3 text-white">
                      <Badge className="mb-1 text-[10px] bg-primary/80">{post.category}</Badge>
                      <p className="text-xs font-semibold line-clamp-2">{post.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-0">
            {['All', ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeCategory === cat
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-6 bg-primary rounded-full" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Featured Posts</h2>
            </div>

            {posts.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No posts found.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {(main.length > 0 ? main : posts).map((post, i) => (
                  <motion.article key={post._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/blog/${post.slug}`} className="group flex gap-4">
                      <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                          <Badge variant="outline" className="text-[10px] py-0 h-4">{post.category}</Badge>
                          <span>{readTime(post)}</span>
                        </div>
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                        {(post as any).excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{(post as any).excerpt}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{post.author?.name || 'Author'}</span>·
                          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                        </p>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>← Newer</Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} / {totalPages || 1}</span>
              <Button variant="outline" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage >= totalPages}>Older →</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-64 shrink-0 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-6 bg-primary rounded-full" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Top Categories</h3>
              </div>
              <div className="space-y-2">
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => onCategoryChange(cat.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm hover:bg-muted transition-colors ${activeCategory === cat.name ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-muted-foreground">→</span>
                  </button>
                ))}
              </div>
            </div>

            {(hp?.showNewsletter !== false) && <EmailSubscribeForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
