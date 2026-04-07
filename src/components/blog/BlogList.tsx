'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarIcon, MessageSquareIcon, ThumbsUpIcon, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContentTranslation } from '@/hooks/use-content-translation';
import { postService } from '@/services/post.service';
import { categoryService } from '@/services/category.service';
import { Post, Category } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function BlogListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden flex flex-col">
          <Skeleton className="aspect-video w-full" />
          <div className="p-6 flex-1 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-3 w-12" />
              <div className="flex items-center gap-2 ml-auto">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

type SortOption = 'latest' | 'popular';

const POSTS_PER_PAGE = 9;

export default function BlogList() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const sortOptions = [
    { value: 'latest' as SortOption, label: t('blog.latest') },
    { value: 'popular' as SortOption, label: t('blog.popular') },
  ];

  const loadPosts = async (pg = 1, reset = false) => {
    setIsLoading(true);
    try {
      const data = await postService.getPosts({
        startIndex: (pg - 1) * POSTS_PER_PAGE,
        limit: POSTS_PER_PAGE,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        searchTerm: searchQuery || undefined,
        order: sortBy === 'latest' ? 'desc' : 'asc',
      });
      setPosts(reset ? data.posts : (prev) => [...prev, ...data.posts]);
      setTotalPosts(data.totalPosts);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadPosts(1, true);
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, [selectedCategory, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPosts(1, true);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next, false);
  };

  const hasMore = posts.length < totalPosts;

  // Translate post titles to the selected language (batched, cached)
  const { translated: translatedTitles } = useContentTranslation(
    posts.map((p) => p.title),
    posts.map((p) => `${p._id}_title`),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{t('blog.title')}</h1>
            <p className="text-muted-foreground mb-8">{t('blog.subtitle')}</p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input type="search" placeholder={t('blog.search_placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Button type="submit">{t('nav.search')}</Button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <ScrollArea className="w-full max-w-[700px]">
              <div className="flex space-x-6">
                {['All', ...categories.map((c) => c.name)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm whitespace-nowrap px-1 py-2 border-b-2 transition-colors ${
                      selectedCategory === cat ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="flex items-center gap-4 ml-4 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px]">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    {sortOptions.find((o) => o.value === sortBy)?.label}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((opt) => (
                    <DropdownMenuItem key={opt.value} onClick={() => setSortBy(opt.value)}>{opt.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-sm text-muted-foreground hidden md:block">{totalPosts} {t('blog.articles')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading && posts.length === 0 ? (
          <BlogListSkeleton />
        ) : posts.length === 0 ? (
          <p className="text-center py-16 text-muted-foreground">{t('blog.no_posts')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index % 9) * 0.05 }}>
                <Card className="h-full flex flex-col">
                  <CardHeader className="p-0">
                    <div className="relative aspect-video">
                      <Image src={post.image} alt={post.title} fill className="object-cover rounded-t-lg" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-6">
                    <CardTitle className="mb-2 text-base">{translatedTitles[index] ?? post.title}</CardTitle>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" /> {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </span>
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <div className="flex items-center mt-4 gap-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <ThumbsUpIcon className="h-4 w-4" /> {post.numberOfLikes}
                      </span>
                      {post.author && (
                        <span className="text-sm text-muted-foreground flex items-center gap-2 ml-auto">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.image} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          {post.author.name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/blog/${post.slug}`}>{t('blog.read_more')}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? t('common.loading') : t('blog.load_more')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
