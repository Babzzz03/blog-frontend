'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, FileText, Send, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import TipTap from '@/components/editor/TipTap';
import ImageUpload from '@/components/common/ImageUpload';
import AiWritingPanel from '@/components/dashboard/AiWritingPanel';
import SeoPanel, { SeoData } from '@/components/dashboard/SeoPanel';
import { useToast } from '@/hooks/use-toast';
import { postService } from '@/services/post.service';
import { categoryService } from '@/services/category.service';
import { settingsService } from '@/services/settings.service';
import { useAuth } from '@/context/AuthContext';
import { Category } from '@/types';
import { GeneratedPost } from '@/services/ai.service';
import { cn } from '@/lib/utils';

const emptySeo = (): SeoData => ({
  metaTitle: '', metaDescription: '', canonicalUrl: '', robots: 'index,follow',
  ogTitle: '', ogDescription: '', ogImage: '', twitterTitle: '',
  twitterDescription: '', twitterImage: '', keywords: '', focusKeyword: '', slug: '',
});

export default function CreatePostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [aiInitialTopic, setAiInitialTopic] = useState('');
  const [siteName, setSiteName] = useState('My Blog');
  const [seo, setSeo] = useState<SeoData>(emptySeo());
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('');
  const [priceUSD, setPriceUSD] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image: '',
    content: '',
    excerpt: '',
    status: 'published' as 'published' | 'draft' | 'scheduled',
    scheduledAt: '',
  });

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
    settingsService.getSettings().then((s) => setSiteName(s.siteName)).catch(() => {});

    const title = searchParams.get('title') || '';
    const category = searchParams.get('category') || '';
    const excerpt = searchParams.get('excerpt') || '';
    const fromCalendar = searchParams.get('fromCalendar') === 'true';
    if (title || category || excerpt) {
      setFormData((prev) => ({ ...prev, title, category, excerpt }));
      setSeo((prev) => ({ ...prev, slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
    if (fromCalendar) {
      setShowAiPanel(true);
      setAiInitialTopic([title, excerpt].filter(Boolean).join(' — '));
    }
  }, []);

  // Auto-populate slug when title changes (only if slug hasn't been manually set)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title }));
    setSeo((prev) => {
      const autoSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return prev.slug && prev.slug !== autoSlug ? prev : { ...prev, slug: autoSlug };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({ title: 'Error', description: 'Title and content are required.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await postService.createPost({
        ...formData,
        slug: seo.slug || undefined,
        seo,
        isPremium,
        price: isPremium ? Number(price) : 0,
        priceUSD: isPremium ? Number(priceUSD) : 0,
        scheduledAt: formData.status === 'scheduled' && formData.scheduledAt ? formData.scheduledAt : undefined,
      } as any);
      const msgs: Record<string, string> = {
        published: 'Your post is now live.',
        draft: 'Post saved as draft.',
        scheduled: 'Post has been scheduled.',
      };
      toast({ title: 'Post Saved', description: msgs[formData.status] });
      router.push('/dashboard/posts');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiGenerated = (post: GeneratedPost) => {
    setFormData((prev) => ({ ...prev, title: post.title, content: post.content, excerpt: post.excerpt }));
    setSeo((prev) => ({ ...prev, slug: post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
  };

  if (!user?.isAdmin) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Only admins can create posts.</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-3xl font-semibold">Create New Post</h1>
        <div className="flex gap-2">
          <Button variant={showSeoPanel ? 'default' : 'outline'} size="sm" onClick={() => setShowSeoPanel((v) => !v)}>
            <Search className="h-4 w-4 mr-2" /> SEO
          </Button>
          <Button variant={showAiPanel ? 'default' : 'outline'} size="sm" onClick={() => setShowAiPanel((v) => !v)}>
            <Sparkles className="h-4 w-4 mr-2" /> AI Assistant
          </Button>
        </div>
      </div>

      <div className={cn('grid gap-6', (showAiPanel || showSeoPanel) ? 'lg:grid-cols-[1fr_340px]' : 'grid-cols-1')}>
        {/* Main form */}
        <Card>
          <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleTitleChange} placeholder="Enter post title" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (<SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>))}
                    {categories.length === 0 && (
                      <>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Development">Development</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Cover Image</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange}
                  placeholder="Short description of the post (or generate with AI)" rows={2} className="resize-none" />
              </div>

              <div className="space-y-1.5">
                <Label>Content *</Label>
                <TipTap content={formData.content} onChange={(content) => setFormData((prev) => ({ ...prev, content }))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <Label>Post Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as typeof formData.status }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published"><span className="flex items-center gap-2"><Send className="h-3.5 w-3.5" /> Publish Now</span></SelectItem>
                      <SelectItem value="draft"><span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Save as Draft</span></SelectItem>
                      <SelectItem value="scheduled"><span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Schedule</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status === 'scheduled' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="scheduledAt">Publish Date & Time</Label>
                    <Input id="scheduledAt" type="datetime-local" value={formData.scheduledAt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* Premium settings */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">Premium Article</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Charge readers to unlock full content</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPremium((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPremium ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isPremium ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {isPremium && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Price (₦ NGN)</label>
                      <input type="number" min={0} placeholder="e.g. 1500" value={price} onChange={(e) => setPrice(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Price ($ USD)</label>
                      <input type="number" min={0} step="0.01" placeholder="e.g. 1.00" value={priceUSD} onChange={(e) => setPriceUSD(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : formData.status === 'draft' ? 'Save Draft' : formData.status === 'scheduled' ? 'Schedule Post' : 'Publish Post'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right panel — SEO or AI */}
        {(showSeoPanel || showAiPanel) && (
          <div className="space-y-4">
            {showSeoPanel && (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" /> SEO Settings
                </h2>
                <SeoPanel
                  seo={seo}
                  onChange={setSeo}
                  postTitle={formData.title}
                  postContent={formData.content}
                  postExcerpt={formData.excerpt}
                  siteName={siteName}
                />
              </>
            )}
            {showAiPanel && (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Writing Tools
                </h2>
                <AiWritingPanel
                  currentContent={formData.content}
                  onGenerated={handleAiGenerated}
                  onContentRefined={(content) => setFormData((prev) => ({ ...prev, content }))}
                  onTitleSelected={(title) => setFormData((prev) => ({ ...prev, title }))}
                  onExcerptGenerated={(excerpt) => setFormData((prev) => ({ ...prev, excerpt }))}
                  initialTopic={aiInitialTopic}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
