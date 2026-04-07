'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarIcon, ThumbsUpIcon, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import EmailSubscribeForm from '@/components/common/EmailSubscribeForm';
import { LayoutProps } from './types';

export default function LayoutModern({
  posts, categories, settings, totalPosts, currentPage, postsPerPage,
  activeCategory, searchTerm,
  onPageChange, onCategoryChange, onSearchSubmit, onSearchChange,
}: LayoutProps) {
  const hp = settings?.homepage;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4">{settings?.siteName || 'Our Blog'}</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {hp?.heroTitle || 'Insights & Inspiration'}
            </h1>
            {hp?.heroSubtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{hp.heroSubtitle}</p>
            )}
            <form onSubmit={onSearchSubmit} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {['All', ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {(hp?.showFeaturedPost !== false) && featuredPost && (
          <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="relative rounded-2xl overflow-hidden aspect-[21/7]">
                <Image src={featuredPost.image} alt={featuredPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <Badge className="mb-2 bg-primary/90">{featuredPost.category}</Badge>
                  <h2 className="text-2xl md:text-4xl font-bold mb-2 max-w-2xl">{featuredPost.title}</h2>
                  <p className="text-sm text-white/70 flex items-center gap-3">
                    <span>{format(new Date(featuredPost.createdAt), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{(featuredPost as any).views ?? 0}</span>
                    <span className="flex items-center gap-1"><ThumbsUpIcon className="h-3.5 w-3.5" />{featuredPost.numberOfLikes}</span>
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Post grid */}
          <div className="flex-1">
            {posts.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No posts found.</p>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {gridPosts.map((post, i) => (
                  <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/blog/${post.slug}`} className="group block h-full">
                      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="relative aspect-video overflow-hidden">
                          <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute top-3 left-3">
                            <Badge className="text-xs bg-primary/90">{post.category}</Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                            <span className="flex items-center gap-1"><ThumbsUpIcon className="h-3 w-3" />{post.numberOfLikes}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <span className="text-xs font-semibold text-primary">Read More →</span>
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-10">
              <Button variant="outline" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
              <Button variant="outline" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage >= totalPages}>Next</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 space-y-6 shrink-0">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-muted-foreground">Top Picks</h3>
              <div className="space-y-4">
                {posts.slice(0, 4).map((post) => (
                  <Link key={post._id} href={`/blog/${post.slug}`} className="flex gap-3 group">
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                      <Image src={post.image} alt={post.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(post.createdAt), 'MMM d')}</p>
                    </div>
                  </Link>
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
