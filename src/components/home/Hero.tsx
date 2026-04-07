'use client';

import { useState, useEffect } from 'react';
import { postService } from '@/services/post.service';
import { categoryService } from '@/services/category.service';
import { Post, Category } from '@/types';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useContentTranslation } from '@/hooks/use-content-translation';
import { Skeleton } from '@/components/ui/skeleton';

function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <Skeleton className="h-5 w-24 mx-auto rounded-full" />
          <Skeleton className="h-12 w-2/3 mx-auto" />
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
          <div className="flex gap-2 max-w-md mx-auto pt-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-full" />
          ))}
        </div>

        {/* Featured post banner */}
        <Skeleton className="w-full aspect-[21/7] rounded-2xl mb-10" />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Post grid */}
          <div className="flex-1">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex gap-3 pt-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 shrink-0 space-y-4">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import LayoutModern  from './layouts/LayoutModern';
import LayoutMinimal from './layouts/LayoutMinimal';
import LayoutMagazine from './layouts/LayoutMagazine';
import LayoutSplit   from './layouts/LayoutSplit';
import LayoutCards   from './layouts/LayoutCards';

const LAYOUTS: Record<string, React.ComponentType<any>> = {
  modern:   LayoutModern,
  minimal:  LayoutMinimal,
  magazine: LayoutMagazine,
  split:    LayoutSplit,
  cards:    LayoutCards,
};

export default function Hero() {
  const { settings } = useSiteSettings();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const postsPerPage = 6;

  const loadPosts = async (page = 1, category = 'All', search = '') => {
    try {
      const data = await postService.getPosts({
        startIndex: (page - 1) * postsPerPage,
        limit: postsPerPage,
        category: category !== 'All' ? category : undefined,
        searchTerm: search || undefined,
      });
      setPosts(data.posts);
      setTotalPosts(data.totalPosts);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1, activeCategory, searchTerm);
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts(1, activeCategory, searchTerm);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    loadPosts(1, cat, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPosts(page, activeCategory, searchTerm);
  };

  // Translate post titles for whichever language is active
  const { translated: translatedTitles } = useContentTranslation(
    posts.map((p) => p.title),
    posts.map((p) => `${p._id}_title`),
  );

  const displayPosts = posts.map((p, i) => ({
    ...p,
    title: translatedTitles[i] ?? p.title,
  }));

  if (isLoading || !settings) return <HeroSkeleton />;

  const layoutKey = settings?.homepageLayout || 'modern';
  const LayoutComponent = LAYOUTS[layoutKey] ?? LayoutModern;

  const props = {
    posts: displayPosts,
    categories,
    settings,
    totalPosts,
    currentPage,
    postsPerPage,
    activeCategory,
    searchTerm,
    onPageChange: handlePageChange,
    onCategoryChange: handleCategoryChange,
    onSearchSubmit: handleSearch,
    onSearchChange: setSearchTerm,
  };

  return <LayoutComponent {...props} />;
}
