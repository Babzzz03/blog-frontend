'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { commentService } from '@/services/comment.service';
import { Comment } from '@/types';
import { format } from 'date-fns';

export default function ManageCommentsPage() {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editTarget, setEditTarget] = useState<{ id: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const commentsPerPage = 10;

  const loadComments = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await commentService.getAllComments({
        startIndex: (page - 1) * commentsPerPage,
        limit: commentsPerPage,
      });
      setComments(data.comments);
      setTotalComments(data.totalComments);
    } catch {
      toast({ title: 'Error', description: 'Failed to load comments.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadComments(currentPage); }, [currentPage]);

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      toast({ title: 'Deleted', description: 'Comment removed.', variant: 'destructive' });
      loadComments(currentPage);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      await commentService.editComment(editTarget.id, editTarget.content);
      toast({ title: 'Updated', description: 'Comment has been updated.' });
      setEditTarget(null);
      loadComments(currentPage);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = comments.filter(
    (c) =>
      c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalComments / commentsPerPage);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Manage Comments</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Filter by content or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading comments...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No comments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((comment) => (
                  <TableRow key={comment._id}>
                    <TableCell className="max-w-[250px] truncate">{comment.content}</TableCell>
                    <TableCell className="font-mono text-xs">{comment.userId.slice(-8)}</TableCell>
                    <TableCell>{comment.numberOfLikes}</TableCell>
                    <TableCell>{format(new Date(comment.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditTarget({ id: comment._id, content: comment.content })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(comment._id)}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">{totalComments} total comments</span>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editTarget !== null} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Comment</DialogTitle></DialogHeader>
          <Textarea
            value={editTarget?.content || ''}
            onChange={(e) => setEditTarget((prev) => prev ? { ...prev, content: e.target.value } : null)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
