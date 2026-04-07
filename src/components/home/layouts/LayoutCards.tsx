'use client';

// Layout: "Cards" — masonry-style card grid, bold typography, dark header band

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Eye, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmailSubscribeForm from '@/components/common/EmailSubscribeForm';
import { LayoutProps } from './types';

function readTime(post: any) {
  const words = (post.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

const CARD_ACCENT = [
  'from-orange-500/20', 'from-blue-500/20', 'from-violet-500/20',
  'from-green-500/20', 'from-rose-500/20', 'from-cyan-500/20',
];

export default function LayoutCards({
  posts, categories, settings, totalPosts, currentPage, postsPerPage,
  activeCategory, searchTerm,
  onPageChange, onCategoryChange, onSearchSubmit, onSearchChange,
}: LayoutProps) {
  const hp = settings?.homepage;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Dark header band */}
      <div className="bg-foreground text-background py-14">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-60">{settings?.siteName || 'Blog'}</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl mb-4">
              {hp?.heroTitle || 'Ideas Worth Reading'}
            </h1>
            {hp?.heroSubtitle && (
              <p className="text-base opacity-70 max-w-xl mb-6">{hp.heroSubtitle}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {(hp?.heroCtaText) && (
                <Button asChild className="bg-background text-foreground hover:bg-background/90 rounded-full px-6">
                  <Link href={hp.heroCtaUrl || '/blog'}>{hp.heroCtaText}</Link>
                </Button>
              )}
              {(hp?.showNewsletter !== false) && (
                <form onSubmit={onSearchSubmit} className="flex gap-2">
                  <Input
                    placeholder="Your email"
                    className="bg-background/10 border-background/20 text-background placeholder:text-background/50 rounded-full w-48"
                  />
                  <Button type="submit" variant="outline" className="rounded-full border-background/40 text-background hover:bg-background/10">
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category strip */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-2">Filter:</span>
          {['All', ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-foreground text-background'
                  : 'bg-background border border-border hover:border-foreground/30'
              }`}
            >
              {cat}
            </button>
          ))}
          <form onSubmit={onSearchSubmit} className="flex gap-1 ml-auto shrink-0">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-7 text-xs w-32"
            />
            <Button type="submit" size="sm" variant="ghost" className="h-7 px-2">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Card grid */}
      <div className="container mx-auto px-4 py-10">
        {posts.length === 0 ? (
          <p className="text-center py-16 text-muted-foreground">No posts found.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {posts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="break-inside-avoid"
              >
                <Link href={`/blog/${post.slug}`} className="group block rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg transition-all bg-card">
                  {/* Image — variable height for masonry feel */}
                  <div className={`relative overflow-hidden bg-gradient-to-br ${CARD_ACCENT[i % CARD_ACCENT.length]} to-muted ${i % 3 === 0 ? 'aspect-[4/3]' : i % 3 === 1 ? 'aspect-video' : 'aspect-square'}`}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-[10px] py-0">{post.category}</Badge>
                      <span className="text-[11px] text-muted-foreground">{readTime(post)}</span>
                    </div>
                    <h3 className="font-bold text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    {(post as any).excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{(post as any).excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.author?.name || 'Author'} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{post.numberOfLikes}</span>
                        <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{(post as any).views ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-12">
          <Button variant="outline" className="rounded-full" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>← Previous</Button>
          <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
          <Button variant="outline" className="rounded-full" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage >= totalPages}>Next →</Button>
        </div>
      </div>
    </div>
  );
}
