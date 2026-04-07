'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import EmailSubscribeForm from '@/components/common/EmailSubscribeForm';
import { LayoutProps } from './types';

export default function LayoutMinimal({
  posts, categories, settings, totalPosts, currentPage, postsPerPage,
  activeCategory, searchTerm,
  onPageChange, onCategoryChange, onSearchSubmit, onSearchChange,
}: LayoutProps) {
  const hp = settings?.homepage;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="min-h-screen bg-background">
      {/* Top hero — split layout */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-none tracking-tight mb-3">
                {hp?.heroTitle || settings?.siteName || 'The Blog'}
              </h1>
              {(hp?.showNewsletter !== false) && (
                <form onSubmit={onSearchSubmit} className="flex gap-2 mt-4 max-w-sm">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-full"
                  />
                  <Button type="submit" className="rounded-full px-5">Subscribe</Button>
                </form>
              )}
            </div>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              {hp?.heroSubtitle || 'New features, the latest in technology, solutions, and updates.'}
            </p>
          </div>

          {/* Category underline tabs */}
          <div className="flex gap-6 border-b border-border overflow-x-auto pb-0">
            {['View all', ...categories.map((c) => c.name)].map((cat) => {
              const val = cat === 'View all' ? 'All' : cat;
              const isActive = activeCategory === val;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(val)}
                  className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Post grid */}
      <div className="container mx-auto px-4 py-10">
        {posts.length === 0 ? (
          <p className="text-center py-16 text-muted-foreground">No posts found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map((post, i) => (
              <motion.article key={post._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted">
                    <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-8 w-8 rounded-full bg-background/90 flex items-center justify-center shadow">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">{post.author?.name || 'Author'}</span>
                    <span>·</span>
                    <span>{format(new Date(post.createdAt), 'd MMM yyyy')}</span>
                  </div>
                  <h2 className="font-bold text-base leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
                  {(post as any).excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{(post as any).excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">{post.category}</span>
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">
                      Read post <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button variant="ghost" size="icon" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>←</Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${currentPage === p ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
          <Button variant="ghost" size="icon" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage >= totalPages}>→</Button>
        </div>
      </div>
    </div>
  );
}
