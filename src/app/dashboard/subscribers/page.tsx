'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Download, Send, Mail, Users, TrendingUp } from 'lucide-react';
import { subscriberService, Subscriber } from '@/services/subscriber.service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function SubscribersPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({ total: 0, totalActive: 0, lastMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [newsletterModal, setNewsletterModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const limit = 20;

  const load = async (p = 1) => {
    setIsLoading(true);
    try {
      const data = await subscriberService.getSubscribers({ startIndex: (p - 1) * limit, limit });
      setSubscribers(data.subscribers);
      setStats({ total: data.total, totalActive: data.totalActive, lastMonth: data.lastMonth });
    } catch {
      toast({ title: 'Error loading subscribers', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      await subscriberService.deleteSubscriber(id);
      toast({ title: 'Subscriber removed' });
      load(page);
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/subscribers/export`, '_blank');
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: 'Subject and body required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const html = body.replace(/\n/g, '<br/>');
      const result = await subscriberService.sendNewsletter(subject, html);
      toast({ title: `Sent to ${result.sent} subscribers!` });
      setNewsletterModal(false);
      setSubject('');
      setBody('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const totalPages = Math.ceil(stats.total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Subscribers</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          <Button size="sm" onClick={() => setNewsletterModal(true)}><Send className="h-4 w-4 mr-2" />Send Newsletter</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Active Subscribers</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalActive}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" />New Last 30 Days</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">+{stats.lastMonth}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" />Total All Time</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Subscriber List</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-10 text-muted-foreground">Loading...</p>
          ) : subscribers.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No subscribers yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">{s.name || '—'}</TableCell>
                    <TableCell><Badge variant="outline">{s.source}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(s.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">{stats.totalActive} active subscribers</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={newsletterModal} onOpenChange={setNewsletterModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5" />Send Newsletter</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input placeholder="Your newsletter subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea
                placeholder="Write your newsletter content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">Plain text — line breaks become &lt;br&gt; tags. Will be sent to {stats.totalActive} active subscribers.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewsletterModal(false)}>Cancel</Button>
            <Button onClick={handleSendNewsletter} disabled={sending}>
              {sending ? 'Sending...' : `Send to ${stats.totalActive} Subscribers`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
