'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Heart, ShoppingBag, TrendingUp, CreditCard, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { paymentService } from '@/services/payment.service';

const PRIMARY = 'hsl(24.6,95%,53.1%)';
const PRIMARY_DIM = 'hsl(24.6,95%,53.1%,0.15)';
const MUTED = 'hsl(25,5.3%,44.7%)';

function StatCard({
  title, value, sub, icon: Icon, highlight = false,
}: {
  title: string; value: string; sub?: string; icon: React.ElementType; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/30 bg-primary/5' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold mt-1 tabular-nums ${highlight ? 'text-primary' : ''}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-9 w-9 rounded-lg shrink-0 flex items-center justify-center ${highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MonetizationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getAnalytics().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <DollarSign className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="font-semibold">No data yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">Revenue will appear here once readers start tipping or purchasing premium articles.</p>
      </div>
    );
  }

  const { summary, revenueByDay, byArticle, gatewaySplit, recentTransactions } = data;
  const totalRevenue = (summary.totalTips || 0) + (summary.totalPurchases || 0);
  const monthRevenue = (summary.monthTips || 0) + (summary.monthPurchases || 0);

  const gatewayMap: Record<string, number> = {};
  [...(gatewaySplit.tips || []), ...(gatewaySplit.purchases || [])].forEach((g: any) => {
    gatewayMap[g._id] = (gatewayMap[g._id] || 0) + g.total;
  });
  const pieData = Object.entries(gatewayMap).map(([name, value]) => ({
    name, value: Math.round(value as number),
  }));
  // Two shades: primary and primary/40 for the pie segments
  const PIE_COLORS = [PRIMARY, 'hsl(24.6,60%,75%)'];

  const articleMap: Record<string, { title: string; tips: number; sales: number }> = {};
  (byArticle.tips || []).forEach((a: any) => { articleMap[a._id] = { title: a.title, tips: a.tipTotal, sales: 0 }; });
  (byArticle.purchases || []).forEach((a: any) => {
    if (articleMap[a._id]) articleMap[a._id].sales = a.saleTotal;
    else articleMap[a._id] = { title: a.title, tips: 0, sales: a.saleTotal };
  });
  const topArticles = Object.values(articleMap)
    .map((a) => ({ ...a, total: a.tips + a.sales }))
    .sort((x, y) => y.total - x.total)
    .slice(0, 7);

  const customTooltipStyle = {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  };

  return (
    <div className=" space-y-6 ">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Monetizations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tips and premium article revenue</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₦${totalRevenue.toLocaleString()}`}
          sub={`${(summary.tipCount || 0) + (summary.purchaseCount || 0)} transactions`}
          icon={DollarSign}
          highlight
        />
        <StatCard
          title="This Month"
          value={`₦${monthRevenue.toLocaleString()}`}
          sub={format(new Date(), 'MMMM yyyy')}
          icon={TrendingUp}
        />
        <StatCard
          title="Tips"
          value={`₦${(summary.totalTips || 0).toLocaleString()}`}
          sub={`${summary.tipCount || 0} tips`}
          icon={Heart}
        />
        <StatCard
          title="Premium Sales"
          value={`₦${(summary.totalPurchases || 0).toLocaleString()}`}
          sub={`${summary.purchaseCount || 0} purchases`}
          icon={ShoppingBag}
        />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Revenue — Last 30 Days</CardTitle>
          <CardDescription className="text-xs">Tips and premium sales combined (NGN)</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueByDay.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
              No revenue data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueByDay} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tipsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MUTED} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={MUTED} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₦${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(v: ValueType | undefined, name: string | number | undefined) => [`₦${Number(v ?? 0).toLocaleString()}`, name === 'tips' ? 'Tips' : 'Sales']}
                  labelFormatter={(l) => format(new Date(l), 'MMM d, yyyy')}
                />
                <Area type="monotone" dataKey="tips" stroke={PRIMARY} strokeWidth={2} fill="url(#tipsGrad)" name="Tips" dot={false} />
                <Area type="monotone" dataKey="purchases" stroke={MUTED} strokeWidth={1.5} fill="url(#salesGrad)" name="Sales" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top articles + Gateway */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Earning Articles</CardTitle>
            <CardDescription className="text-xs">By total revenue (tips + sales)</CardDescription>
          </CardHeader>
          <CardContent>
            {topArticles.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No article revenue yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topArticles} layout="vertical" margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₦${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    tickFormatter={(v) => v.length > 17 ? v.slice(0, 17) + '…' : v}
                  />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(v: ValueType | undefined) => [`₦${Number(v ?? 0).toLocaleString()}`]} />
                  <Bar dataKey="tips" name="Tips" stackId="a" fill={PRIMARY} />
                  <Bar dataKey="sales" name="Sales" stackId="a" fill="hsl(24.6,60%,78%)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Gateways</CardTitle>
            <CardDescription className="text-xs">Revenue split by payment provider</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={customTooltipStyle} formatter={(v: ValueType | undefined) => [`₦${Number(v ?? 0).toLocaleString()}`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 pt-2 border-t">
                  {pieData.map((g, i) => {
                    const pct = totalRevenue > 0 ? Math.round((g.value / totalRevenue) * 100) : 0;
                    return (
                      <div key={g.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            {g.name === 'paystack' ? <Smartphone className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                            <span className="capitalize font-medium text-foreground">{g.name}</span>
                          </span>
                          <span className="font-semibold tabular-nums">₦{g.value.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
          <CardDescription className="text-xs">Latest successful payments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No transactions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payer</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Gateway</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx: any, i: number) => (
                    <tr key={tx._id} className={`border-b last:border-0 transition-colors hover:bg-muted/40 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                      <td className="px-6 py-3.5 text-muted-foreground whitespace-nowrap text-xs">
                        {format(new Date(tx.createdAt), 'MMM d, yyyy · HH:mm')}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          tx.transactionType === 'tip'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-foreground'
                        }`}>
                          {tx.transactionType === 'tip' ? 'Tip' : 'Premium'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 max-w-[200px] truncate text-muted-foreground text-xs">
                        {tx.postTitle || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground text-xs truncate max-w-[160px]">
                        {tx.payerEmail || tx.payerName || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold tabular-nums">
                        {tx.currency === 'USD' ? '$' : '₦'}{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                          {tx.paymentGateway === 'paystack'
                            ? <Smartphone className="h-3 w-3" />
                            : <CreditCard className="h-3 w-3" />}
                          {tx.paymentGateway}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
