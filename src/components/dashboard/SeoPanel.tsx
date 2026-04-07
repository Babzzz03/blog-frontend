'use client';

import { useState } from 'react';
import {
  Search, Sparkles, ChevronDown, ChevronUp, CheckCircle2,
  AlertTriangle, XCircle, ExternalLink, RefreshCw, Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { aiService } from '@/services/ai.service';
import { useToast } from '@/hooks/use-toast';

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  keywords: string;
  focusKeyword: string;
  slug: string;
}

interface Props {
  seo: SeoData;
  onChange: (seo: SeoData) => void;
  postTitle: string;
  postContent: string;
  postExcerpt: string;
  postSlug?: string;
  siteName?: string;
}

interface SeoAnalysis {
  score: number;
  grade: string;
  suggestions: string[];
  generatedMetaTitle: string;
  generatedMetaDescription: string;
  suggestedKeywords: string[];
  headingAnalysis: string;
  readabilityScore: string;
  positives: string[];
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  const bg = score >= 80 ? 'bg-green-50' : score >= 60 ? 'bg-yellow-50' : 'bg-red-50';
  return (
    <div className={cn('flex items-center justify-center h-20 w-20 rounded-full border-4 shrink-0', bg, score >= 80 ? 'border-green-400' : score >= 60 ? 'border-yellow-400' : 'border-red-400')}>
      <div className="text-center">
        <div className={cn('text-2xl font-bold leading-none', color)}>{score}</div>
        <div className={cn('text-[10px] font-semibold', color)}>/ 100</div>
      </div>
    </div>
  );
}

function CharCount({ value, max, warn }: { value: string; max: number; warn: number }) {
  const len = value.length;
  const color = len > max ? 'text-red-500' : len >= warn ? 'text-yellow-500' : 'text-muted-foreground';
  return <span className={cn('text-xs tabular-nums', color)}>{len}/{max}</span>;
}

const ROBOTS_OPTIONS = [
  { value: 'index,follow', label: 'Index, Follow (default)' },
  { value: 'index,nofollow', label: 'Index, No Follow' },
  { value: 'noindex,follow', label: 'No Index, Follow' },
  { value: 'noindex,nofollow', label: 'No Index, No Follow' },
];

export default function SeoPanel({ seo, onChange, postTitle, postContent, postExcerpt, postSlug, siteName }: Props) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<SeoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const set = (key: keyof SeoData, value: string) => onChange({ ...seo, [key]: value });

  const handleAnalyze = async () => {
    if (!postTitle && !postContent) {
      toast({ title: 'Add content first', description: 'Write a title and some content before analyzing.', variant: 'destructive' });
      return;
    }
    setIsAnalyzing(true);
    setShowAnalysis(true);
    try {
      const result = await aiService.analyzeSeo({
        title: postTitle,
        content: postContent,
        excerpt: postExcerpt,
        focusKeyword: seo.focusKeyword,
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        keywords: seo.keywords,
      });
      setAnalysis(result);
    } catch {
      toast({ title: 'Analysis failed', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateMeta = async () => {
    if (!postTitle) {
      toast({ title: 'Add a title first', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await aiService.generateSeoMeta({
        title: postTitle,
        content: postContent,
        excerpt: postExcerpt,
        focusKeyword: seo.focusKeyword,
        siteName,
      });
      onChange({
        ...seo,
        metaTitle: result.metaTitle,
        metaDescription: result.metaDescription,
        ogTitle: result.ogTitle,
        ogDescription: result.ogDescription,
        twitterTitle: result.twitterTitle,
        twitterDescription: result.twitterDescription,
        keywords: result.keywords,
        slug: result.slug,
      });
      toast({ title: 'SEO meta generated', description: 'Review and adjust the generated fields below.' });
    } catch {
      toast({ title: 'Generation failed', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyFromAnalysis = () => {
    if (!analysis) return;
    onChange({
      ...seo,
      metaTitle: analysis.generatedMetaTitle || seo.metaTitle,
      metaDescription: analysis.generatedMetaDescription || seo.metaDescription,
      keywords: analysis.suggestedKeywords.join(', ') || seo.keywords,
    });
    toast({ title: 'Applied suggestions', description: 'Meta title, description, and keywords updated.' });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="h-4 w-4" /> SEO Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* AI action bar */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={handleAnalyze} disabled={isAnalyzing} className="gap-1.5">
            <Sparkles className={cn('h-3.5 w-3.5', isAnalyzing && 'animate-spin')} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze SEO'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleGenerateMeta} disabled={isGenerating} className="gap-1.5">
            <RefreshCw className={cn('h-3.5 w-3.5', isGenerating && 'animate-spin')} />
            {isGenerating ? 'Generating...' : 'AI Generate All'}
          </Button>
        </div>

        {/* SEO Analysis results */}
        {showAnalysis && (
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <button
              className="flex items-center justify-between w-full text-sm font-semibold"
              onClick={() => setShowAnalysis((v) => !v)}
            >
              <span className="flex items-center gap-2"><Search className="h-4 w-4" /> SEO Analysis</span>
              {showAnalysis ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {isAnalyzing ? (
              <div className="space-y-2 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-3 rounded bg-muted-foreground/20 w-full" />
                ))}
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {/* Score + grade */}
                <div className="flex items-center gap-4">
                  <ScoreRing score={analysis.score} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">Grade: {analysis.grade}</span>
                      <Badge variant={analysis.score >= 80 ? 'default' : analysis.score >= 60 ? 'secondary' : 'destructive'}>
                        {analysis.score >= 80 ? 'Good' : analysis.score >= 60 ? 'Needs Work' : 'Poor'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Readability: {analysis.readabilityScore}</p>
                    <p className="text-xs text-muted-foreground">{analysis.headingAnalysis}</p>
                  </div>
                </div>

                {/* Positives */}
                {analysis.positives?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> What's working
                    </p>
                    {analysis.positives.map((p, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-green-500" /> {p}
                      </p>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Improvements
                    </p>
                    {analysis.suggestions.map((s, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <XCircle className="h-3 w-3 mt-0.5 shrink-0 text-yellow-500" /> {s}
                      </p>
                    ))}
                  </div>
                )}

                {/* Suggested keywords */}
                {analysis.suggestedKeywords?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> Suggested Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.suggestedKeywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => set('keywords', seo.keywords ? `${seo.keywords}, ${kw}` : kw)}
                          className="text-xs px-2 py-0.5 rounded-full border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          + {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button size="sm" variant="outline" onClick={applyFromAnalysis} className="w-full gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Apply Generated Meta to Fields
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* Tabs: Basic / Open Graph / Twitter / Advanced */}
        <Tabs defaultValue="basic">
          <TabsList className="w-full grid grid-cols-4 h-8">
            <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
            <TabsTrigger value="og" className="text-xs">Open Graph</TabsTrigger>
            <TabsTrigger value="twitter" className="text-xs">Twitter</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
          </TabsList>

          {/* ── Basic Tab ── */}
          <TabsContent value="basic" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Focus Keyword</Label>
              </div>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. best productivity tips"
                value={seo.focusKeyword}
                onChange={(e) => set('focusKeyword', e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">The primary keyword this post targets.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">URL Slug</Label>
              </div>
              <Input
                className="h-8 text-xs font-mono"
                placeholder="my-post-url-slug"
                value={seo.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Meta Title</Label>
                <CharCount value={seo.metaTitle} max={60} warn={50} />
              </div>
              <Input
                className="h-8 text-xs"
                placeholder={`${postTitle || 'Post Title'} | ${siteName || 'My Blog'}`}
                value={seo.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Meta Description</Label>
                <CharCount value={seo.metaDescription} max={160} warn={130} />
              </div>
              <Textarea
                className="text-xs resize-none"
                rows={3}
                placeholder="Describe this post in 120–160 characters for search engines…"
                value={seo.metaDescription}
                onChange={(e) => set('metaDescription', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Keywords</Label>
              <Input
                className="h-8 text-xs"
                placeholder="keyword1, keyword2, keyword3"
                value={seo.keywords}
                onChange={(e) => set('keywords', e.target.value)}
              />
            </div>

            {/* SERP preview */}
            {(seo.metaTitle || postTitle) && (
              <div className="rounded-lg border bg-white p-3 space-y-0.5">
                <p className="text-[10px] text-green-700 font-mono truncate">
                  {(typeof window !== 'undefined' ? window.location.origin : 'https://yourblog.com')}/blog/{seo.slug || postSlug || 'post-slug'}
                </p>
                <p className="text-[13px] text-blue-700 font-medium truncate leading-snug hover:underline cursor-pointer">
                  {seo.metaTitle || `${postTitle} | ${siteName || 'My Blog'}`}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                  {seo.metaDescription || postExcerpt || 'No meta description set. Add one above for better click-through rates.'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── Open Graph Tab ── */}
          <TabsContent value="og" className="space-y-3 mt-3">
            <p className="text-xs text-muted-foreground">Controls how this post appears when shared on Facebook, LinkedIn, and other platforms.</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">OG Title</Label>
                <CharCount value={seo.ogTitle} max={95} warn={70} />
              </div>
              <Input
                className="h-8 text-xs"
                placeholder={seo.metaTitle || postTitle || 'Open Graph title…'}
                value={seo.ogTitle}
                onChange={(e) => set('ogTitle', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">OG Description</Label>
                <CharCount value={seo.ogDescription} max={200} warn={160} />
              </div>
              <Textarea
                className="text-xs resize-none"
                rows={3}
                placeholder={seo.metaDescription || 'Open Graph description…'}
                value={seo.ogDescription}
                onChange={(e) => set('ogDescription', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">OG Image URL</Label>
              <Input
                className="h-8 text-xs"
                placeholder="https://yourblog.com/og-image.jpg (1200×630 recommended)"
                value={seo.ogImage}
                onChange={(e) => set('ogImage', e.target.value)}
              />
              {seo.ogImage && (
                <img src={seo.ogImage} alt="OG preview" className="w-full rounded-lg border object-cover aspect-[1200/630]"
                  onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
          </TabsContent>

          {/* ── Twitter Tab ── */}
          <TabsContent value="twitter" className="space-y-3 mt-3">
            <p className="text-xs text-muted-foreground">Controls how this post appears when shared on X / Twitter. Falls back to Open Graph if empty.</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Twitter Title</Label>
                <CharCount value={seo.twitterTitle} max={70} warn={55} />
              </div>
              <Input
                className="h-8 text-xs"
                placeholder={seo.ogTitle || seo.metaTitle || postTitle || 'Twitter card title…'}
                value={seo.twitterTitle}
                onChange={(e) => set('twitterTitle', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Twitter Description</Label>
                <CharCount value={seo.twitterDescription} max={200} warn={160} />
              </div>
              <Textarea
                className="text-xs resize-none"
                rows={3}
                placeholder={seo.ogDescription || seo.metaDescription || 'Twitter card description…'}
                value={seo.twitterDescription}
                onChange={(e) => set('twitterDescription', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Twitter Image URL</Label>
              <Input
                className="h-8 text-xs"
                placeholder="https://yourblog.com/twitter-image.jpg (2:1 ratio)"
                value={seo.twitterImage}
                onChange={(e) => set('twitterImage', e.target.value)}
              />
              {seo.twitterImage && (
                <img src={seo.twitterImage} alt="Twitter preview" className="w-full rounded-lg border object-cover aspect-[2/1]"
                  onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
          </TabsContent>

          {/* ── Advanced Tab ── */}
          <TabsContent value="advanced" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Robots Meta</Label>
              <Select value={seo.robots} onValueChange={(v) => set('robots', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROBOTS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Controls whether search engines index this page and follow its links.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Canonical URL</Label>
              <Input
                className="h-8 text-xs font-mono"
                placeholder="https://yourblog.com/blog/my-post"
                value={seo.canonicalUrl}
                onChange={(e) => set('canonicalUrl', e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Use to prevent duplicate content issues. Leave blank to auto-generate.</p>
            </div>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Open Google Search Console
            </a>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
