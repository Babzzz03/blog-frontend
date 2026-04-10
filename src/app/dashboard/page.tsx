'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { postService } from '@/services/post.service';
import { commentService } from '@/services/comment.service';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { Post, Comment } from '@/types';
import { Eye, Heart, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
);

interface PostStat { title: string; slug: string; views: number; numberOfLikes: number; category: string }
interface CategoryStat { _id: string; count: number; totalViews: number; totalLikes: number }
interface StatsData {
  topViewed: PostStat[];
  topLiked: PostStat[];
  byCategory: CategoryStat[];
  counts: { scheduled: number; drafts: number; published: number };
}

const PIE_COLORS = [
  '#f97316','#3b82f6','#7c3aed','#22c55e','#f43f5e',
  '#06b6d4','#f59e0b','#ec4899','#14b8a6','#52525b',
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentComments, setRecentComments] = useState<Comment[]>([]);
  const [basicStats, setBasicStats] = useState({ totalPosts: 0, lastMonthPosts: 0, totalComments: 0, lastMonthComments: 0 });
  const [adminStats, setAdminStats] = useState<StatsData | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [postsData, commentsData] = await Promise.all([
          postService.getPosts({ limit: 5, adminView: true }),
          commentService.getAllComments({ limit: 5 }),
        ]);
        setRecentPosts(postsData.posts);
        setBasicStats({
          totalPosts: postsData.totalPosts,
          lastMonthPosts: postsData.lastMonthPosts,
          totalComments: commentsData.totalComments,
          lastMonthComments: commentsData.lastMonthComments,
        });
        setRecentComments(commentsData.comments);
      } catch {
        // non-admin fallback
      }

      if (user.isAdmin) {
        try {
          const stats = await apiClient.get<StatsData>('/posts/stats/admin');
          setAdminStats(stats);
        } catch {
          // ignore
        }
      }
    };
    loadData();
  }, [user]);

  const statCards = [
    { title: 'Published', value: adminStats?.counts.published ?? basicStats.totalPosts, icon: <FileText className="h-5 w-5 text-green-600" />, sub: `+${basicStats.lastMonthPosts} this month` },
    { title: 'Drafts', value: adminStats?.counts.drafts ?? 0, icon: <FileText className="h-5 w-5 text-yellow-500" />, sub: 'Unpublished' },
    { title: 'Scheduled', value: adminStats?.counts.scheduled ?? 0, icon: <TrendingUp className="h-5 w-5 text-blue-500" />, sub: 'Queued' },
    { title: 'Comments', value: basicStats.totalComments, icon: <MessageSquare className="h-5 w-5 text-primary" />, sub: `+${basicStats.lastMonthComments} this month` },
  ];

  const categoryLabels = adminStats?.byCategory.map((c) => c._id || 'Uncategorized') ?? [];
  const barChartData = {
    labels: categoryLabels,
    datasets: [
      { label: 'Posts', data: adminStats?.byCategory.map((c) => c.count) ?? [], backgroundColor: 'rgba(249,115,22,0.75)', borderRadius: 4 },
      { label: 'Views', data: adminStats?.byCategory.map((c) => c.totalViews) ?? [], backgroundColor: 'rgba(59,130,246,0.75)', borderRadius: 4 },
      { label: 'Likes', data: adminStats?.byCategory.map((c) => c.totalLikes) ?? [], backgroundColor: 'rgba(124,58,237,0.75)', borderRadius: 4 },
    ],
  };

  const pieChartData = {
    labels: categoryLabels,
    datasets: [{
      data: adminStats?.byCategory.map((c) => c.count) ?? [],
      backgroundColor: PIE_COLORS.slice(0, categoryLabels.length),
      borderWidth: 2,
      borderColor: 'hsl(var(--background))',
    }],
  };

  const totalViews = adminStats?.byCategory.reduce((a, c) => a + c.totalViews, 0) ?? 0;
  const totalLikes = adminStats?.byCategory.reduce((a, c) => a + c.totalLikes, 0) ?? 0;
  const engagementPieData = {
    labels: ['Views', 'Likes', 'Comments'],
    datasets: [{
      data: [totalViews, totalLikes, basicStats.totalComments],
      backgroundColor: ['#3b82f6', '#f43f5e', '#22c55e'],
      borderWidth: 2,
      borderColor: 'hsl(var(--background))',
    }],
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 10, font: { size: 11 } } } },
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Dashboard Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight">{stat.title}</p>
                <span className="shrink-0 ml-1">{stat.icon}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {adminStats && (
        <>
          {/* Bar chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" /> Posts, Views & Likes by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] sm:h-[280px] w-full overflow-hidden">
                <Bar
                  data={barChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
                    scales: { x: { stacked: false, ticks: { font: { size: 10 } } }, y: { beginAtZero: true, ticks: { font: { size: 10 } } } },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pie charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Posts by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[240px]">
                  {categoryLabels.length > 0
                    ? <Pie data={pieChartData} options={pieOptions} />
                    : <p className="text-sm text-muted-foreground text-center pt-10">No category data yet.</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Engagement Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[240px]">
                  {(totalViews + totalLikes + basicStats.totalComments) > 0
                    ? <Pie data={engagementPieData} options={pieOptions} />
                    : <p className="text-sm text-muted-foreground text-center pt-10">No engagement data yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm sm:text-base">Recent Posts</CardTitle>
            <Link href="/dashboard/posts" className="text-xs text-primary hover:underline shrink-0">View all</Link>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentPosts.map((post) => {
                  const status = (post as any).status || 'published';
                  return (
                    <li key={post._id} className="space-y-1">
                      <span className="font-medium text-sm line-clamp-1">{post.title}</span>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        <Badge
                          variant={status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline'}
                          className="text-xs capitalize"
                        >
                          {status}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentComments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentComments.map((comment) => (
                  <li key={comment._id} className="border-b pb-2 last:border-0">
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top viewed posts */}
      {adminStats && adminStats.topViewed.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Eye className="h-4 w-4" /> Top Viewed Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminStats.topViewed.slice(0, 5).map((p, i) => (
                <div key={p.slug} className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs w-4 shrink-0 pt-0.5">{i + 1}.</span>
                  <p className="text-sm font-medium flex-1 min-w-0 line-clamp-1">{p.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {p.views.toLocaleString()}</span>
                    <span className="hidden sm:flex items-center gap-1"><Heart className="h-3 w-3" /> {p.numberOfLikes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
