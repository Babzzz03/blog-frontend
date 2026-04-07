'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Eye, Heart, TrendingUp, Layers } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PostStat { title: string; slug: string; views: number; numberOfLikes: number; category: string }
interface CategoryStat { _id: string; count: number; totalViews: number; totalLikes: number }
interface StatsData {
  topViewed: PostStat[];
  topLiked: PostStat[];
  byCategory: CategoryStat[];
  counts: { scheduled: number; drafts: number; published: number };
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get<StatsData>('/posts/stats/admin')
      .then(setStats)
      .catch(() => toast({ title: 'Failed to load analytics', variant: 'destructive' }))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-center py-20 text-muted-foreground">Loading analytics...</p>;
  if (!stats) return null;

  const categoryChartData = {
    labels: stats.byCategory.map((c) => c._id || 'uncategorized'),
    datasets: [
      {
        label: 'Posts',
        data: stats.byCategory.map((c) => c.count),
        backgroundColor: 'rgba(249,115,22,0.7)',
        borderRadius: 4,
      },
      {
        label: 'Total Views',
        data: stats.byCategory.map((c) => c.totalViews),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderRadius: 4,
      },
    ],
  };

  const scorePost = (p: PostStat) => {
    const viewScore = Math.min(p.views / 100, 5);
    const likeScore = Math.min(p.numberOfLikes / 10, 5);
    return Math.round((viewScore + likeScore) * 10) / 10;
  };

  const getInsight = (p: PostStat) => {
    const score = scorePost(p);
    if (score >= 8) return { label: 'High performer', color: 'default' as const };
    if (score >= 4) return { label: 'Good engagement', color: 'secondary' as const };
    if (p.views > 50 && p.numberOfLikes === 0) return { label: 'Add a CTA', color: 'outline' as const };
    return { label: 'Low engagement', color: 'outline' as const };
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Analytics</h1>

      {/* Status counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Published</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.counts.published}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Drafts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.counts.drafts}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Scheduled</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.counts.scheduled}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Categories</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.byCategory.length}</div></CardContent></Card>
      </div>

      {/* Category chart */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" />Posts & Views by Category</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <Bar data={categoryChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top viewed */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Top Viewed Posts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topViewed.map((p, i) => (
                <div key={p.slug} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-muted-foreground text-sm w-4 shrink-0">{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <Badge variant="outline" className="text-xs mt-0.5">{p.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{p.views.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
              {stats.topViewed.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Top liked */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" />Top Liked Posts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topLiked.map((p, i) => (
                <div key={p.slug} className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-muted-foreground text-sm w-4 shrink-0">{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <Badge variant="outline" className="text-xs mt-0.5">{p.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{p.numberOfLikes}</p>
                    <p className="text-xs text-muted-foreground">likes</p>
                  </div>
                </div>
              ))}
              {stats.topLiked.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Content Scoring */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Content Performance Scoring</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...stats.topViewed, ...stats.topLiked]
              .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
              .sort((a, b) => scorePost(b) - scorePost(a))
              .map((p) => {
                const insight = getInsight(p);
                const score = scorePost(p);
                return (
                  <div key={p.slug} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{p.views} views</span>
                        <span>{p.numberOfLikes} likes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={insight.color}>{insight.label}</Badge>
                      <span className="text-sm font-bold text-primary">{score}/10</span>
                    </div>
                  </div>
                );
              })}
            {stats.topViewed.length === 0 && <p className="text-sm text-muted-foreground">Publish posts to see performance data.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
