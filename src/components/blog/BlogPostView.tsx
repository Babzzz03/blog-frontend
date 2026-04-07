'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, ThumbsUp, MessageSquare, Clock, Eye, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useContentTranslation } from '@/hooks/use-content-translation';
import { postService } from '@/services/post.service';
import { categoryService } from '@/services/category.service';
import { Post, Category } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import CommentSection from './CommentSection';
import TipButton from './TipButton';
import PremiumGate from './PremiumGate';
import EmailSubscribeForm from '@/components/common/EmailSubscribeForm';
import PostContent from './PostContent';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function extractTOC(html: string) {
  if (typeof window === 'undefined') return [];
  const div = document.createElement('div');
  div.innerHTML = html;
  return Array.from(div.querySelectorAll('h2, h3')).map((h) => ({
    id: h.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
    text: h.textContent || '',
    level: h.tagName === 'H2' ? 2 : 3,
  }));
}

function readingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

interface Props { slug: string; }

export default function BlogPostView({ slug }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [liked, setLiked] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  const { translated: [translatedTitle, translatedExcerpt, translatedContent], isTranslating } = useContentTranslation(
    post ? [post.title, post.excerpt ?? '', post.content] : [],
    post ? [`${post._id}_title`, `${post._id}_excerpt`, `${post._id}_content`] : [],
  );

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    postService.getPostBySlug(slug).then((data) => {
      setPost(data);
      setToc(extractTOC(data.content));
      if (user) setLiked(data.likes.includes(user._id));
      if (data.category) {
        postService.getPosts({ category: data.category, limit: 4 } as any)
          .then((res) => setRelatedPosts((res.posts || []).filter((p: Post) => p.slug !== data.slug).slice(0, 3)))
          .catch(() => {});
      }
    });
    categoryService.getCategories().then(setAllCategories).catch(() => {});
  }, [slug]);

  // Assign heading IDs
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.querySelectorAll('h2, h3').forEach((h) => {
        (h as HTMLElement).id = h.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      });
    }
  }, [post?.content]);

  // Active TOC tracking
  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  const handleLike = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to like posts.', variant: 'destructive' });
      return;
    }
    if (!post) return;
    try {
      const updated = await postService.likePost(post._id);
      setPost(updated);
      setLiked(updated.likes.includes(user._id));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // ── Skeleton ────────────────────────────────────────────────────────────
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-4xl py-10">
          <Skeleton className="h-4 w-24 mb-8" />
          <Skeleton className="h-5 w-32 mb-4 mx-auto" />
          <Skeleton className="h-12 w-3/4 mb-3 mx-auto" />
          <Skeleton className="h-12 w-1/2 mb-6 mx-auto" />
          <Skeleton className="h-4 w-2/3 mb-2 mx-auto" />
          <Skeleton className="h-4 w-1/2 mb-8 mx-auto" />
          <Skeleton className="h-6 w-40 mb-8 mx-auto" />
          <Skeleton className="w-full aspect-[16/9] mb-10 rounded-xl" />
          <div className="flex gap-10">
            <div className="hidden lg:block w-52 shrink-0 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
            </div>
            <div className="flex-1 space-y-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className={`h-4 ${i % 6 === 5 ? 'w-2/3' : 'w-full'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const minutes = readingTime(post.content);
  const displayTitle = translatedTitle ?? post.title;
  const displayExcerpt = translatedExcerpt || post.excerpt;
  const displayContent = translatedContent ?? post.content;

  return (
    <article className="min-h-screen bg-background">

      {/* ── Back button ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-4xl pt-6 pb-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5 h-8 text-muted-foreground hover:text-foreground">
          <Link href="/blog"><ArrowLeft className="h-3.5 w-3.5" /> {t('blog.back_to_blog')}</Link>
        </Button>
      </div>

      {/* ── Article header (centered, newspaper style) ──────────────────── */}
      <motion.header
        className="container mx-auto px-4  max-w-5xl text-center pt-4 pb-4 mb-4 border-b"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Category badge */}
        <Badge className="mb-2 sm:mb-4 text-[10px] sm:text-xs uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          {post.category}
        </Badge>

        {/* Title */}
        <h1
          className="text-2xl md:text-5xl font-extrabold leading-tight mb-4"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {displayTitle}
        </h1>

        {/* Excerpt */}
        {displayExcerpt && (
          <p className="text-sm sm:text-lg italic text-muted-foreground leading-relaxed mb-6 max-w-2xl mx-auto">
            {displayExcerpt}
          </p>
        )}

  {/* ── Contained article image ──────────────────────────────────────── */}
      <motion.div
        className="container mx-auto px-4 max-w-3xl my-8"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
          <Image src={post.image} alt={post.title} fill className="object-cover" priority />
        </div>
      </motion.div>


        {/* Meta row */}
        <div className="flex w-full flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          {post.author && (
            <span className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {post.author.name[0].toUpperCase()}
              </div>
              <span className="font-medium text-foreground">{post.author.name}</span>
            </span>
          )}
          <span className="text-border">·</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {minutes} {t('common.min_read')}</span>
          {post?.views !== undefined && (
            <>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post?.views.toLocaleString()} views</span>
            </>
          )}
        </div>
      </motion.header>

    

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-6xl pb-16">
        <div className="flex gap-10 items-start">

          {/* ── Left sidebar: TOC + Categories ───────────────────────── */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-24 self-start">

            {/* TOC */}
            {toc.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {t('blog.table_of_contents')}
                </p>
                <nav>
                  <ul className="space-y-1 border-l border-border pl-3">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={cn(
                            'block text-xs py-1 transition-colors leading-snug',
                            item.level === 3 && 'pl-3',
                            activeId === item.id
                              ? 'text-primary font-semibold border-l-2 border-primary -ml-[1px] pl-2'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* All Categories */}
            {allCategories.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Categories
                </p>
                <ul className="space-y-0.5">
                  {allCategories.map((cat) => (
                    <li key={cat._id}>
                      <Link
                        href={`/blog?category=${encodeURIComponent(cat.name)}`}
                        className={cn(
                          'flex items-center gap-2 text-xs py-1.5 px-2 rounded-md transition-colors',
                          post.category === cat.name
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        <Tag className="h-3 w-3 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* ── Article body ──────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

              {/* Mobile TOC (collapsible) */}
              {toc.length > 0 && (
                <div className="lg:hidden mb-6 rounded-xl border bg-muted/30 overflow-hidden">
                  <button
                    onClick={() => setTocOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      {t('blog.table_of_contents')}
                    </span>
                    <ChevronDown className={cn('h-4 w-4 transition-transform text-muted-foreground', tocOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {tocOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-3 space-y-1 border-t overflow-hidden"
                      >
                        {toc.map((item) => (
                          <li key={item.id}>
                            <a
                              href={`#${item.id}`}
                              onClick={() => setTocOpen(false)}
                              className={cn(
                                'block text-xs py-1 transition-colors',
                                item.level === 3 && 'pl-4',
                                'text-muted-foreground hover:text-primary'
                              )}
                            >
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile categories */}
              <div className="flex flex-wrap items-center gap-2 mb-6 lg:hidden">
                {allCategories.slice(0, 6).map((cat) => (
                  <Link key={cat._id} href={`/blog?category=${encodeURIComponent(cat.name)}`}>
                    <Badge
                      variant={post.category === cat.name ? 'default' : 'secondary'}
                      className="text-[11px] cursor-pointer"
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Article prose with drop cap */}
              <div
                ref={contentRef}
                className={cn(
                  'prose prose-sm md:prose-base lg:prose-lg max-w-none',
                  // Heading styles
                  'prose-headings:font-bold prose-headings:tracking-tight',
                  'prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2',
                  'prose-h3:text-xl prose-h3:mt-6',
                  // Link styles
                  'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                  // Image styles
                  'prose-img:rounded-xl prose-img:shadow-md',
                  // Blockquote
                  'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground',
                )}
              >
                {isTranslating ? (
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`h-4 rounded bg-primary/10 ${i % 5 === 4 ? 'w-2/3' : 'w-full'}`} />
                    ))}
                  </div>
                ) : post.isPremium ? (
                  <PremiumGate
                    postId={post._id}
                    fullContent={displayContent}
                    price={post.price ?? 0}
                    priceUSD={post.priceUSD}
                  />
                ) : (
                  <PostContent html={displayContent} />
                )}
              </div>

              {/* ── Tip Button ──────────────────────────────────────── */}
              {!post.isPremium && (
                <div className="mt-10 mb-2 flex justify-center">
                  <TipButton postId={post._id} postTitle={post.title} />
                </div>
              )}

              {/* ── Like + comments row ─────────────────────────────── */}
              <div className="mt-10 pt-6 border-t flex items-center gap-3 flex-wrap">
                <Button
                  onClick={handleLike}
                  variant={liked ? 'default' : 'outline'}
                  className="gap-2 rounded-full px-5"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.numberOfLikes} {post.numberOfLikes === 1 ? t('blog.like') : t('blog.likes')}
                </Button>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" /> {t('blog.comments')}
                </span>
                {post.author && (
                  <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {post.author.name[0].toUpperCase()}
                    </div>
                    Written by <span className="font-medium text-foreground">{post.author.name}</span>
                  </div>
                )}
              </div>

              {/* ── Subscribe ───────────────────────────────────────── */}
              <EmailSubscribeForm className="mt-8" />

              {/* ── Related Posts ───────────────────────────────────── */}
              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold">Related Posts</h2>
                    <Link
                      href={`/blog?category=${encodeURIComponent(post.category)}`}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      More in {post.category} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-5">
                    {relatedPosts.map((rp) => (
                      <Link
                        key={rp._id}
                        href={`/blog/${rp.slug}`}
                        className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={rp.image}
                            alt={rp.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <Badge variant="secondary" className="text-[10px] mb-1.5">{rp.category}</Badge>
                          <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {rp.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(rp.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Comments ────────────────────────────────────────── */}
              <CommentSection postId={post._id} />
            </motion.div>
          </div>
        </div>
      </div>
    </article>
  );
}
