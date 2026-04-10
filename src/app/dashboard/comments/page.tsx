'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Edit, ThumbsUp } from 'lucide-react';
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
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Manage Comments</h1>

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
            <>
              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {filtered.map((comment) => (
                  <div key={comment._id} className="border rounded-lg p-3 space-y-2">
                    <p className="text-sm line-clamp-3">{comment.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">#{comment.userId.slice(-8)}</span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {comment.numberOfLikes}
                      </span>
                      <span>{format(new Date(comment.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex gap-2 pt-1 border-t">
                      <Button variant="outline" size="sm" className="flex-1 h-8"
                        onClick={() => setEditTarget({ id: comment._id, content: comment.content })}>
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-destructive border-destructive/30"
                        onClick={() => handleDelete(comment._id)}>
                        <Trash className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                            <Button variant="ghost" size="icon"
                              onClick={() => setEditTarget({ id: comment._id, content: comment.content })}>
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
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <span className="text-sm text-muted-foreground">{totalComments} total comments</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-1">
                {currentPage} / {totalPages || 1}
              </span>
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editTarget !== null} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="mx-4 sm:mx-auto">
          <DialogHeader><DialogTitle>Edit Comment</DialogTitle></DialogHeader>
          <Textarea
            value={editTarget?.content || ''}
            onChange={(e) => setEditTarget((prev) => prev ? { ...prev, content: e.target.value } : null)}
            rows={4}
          />
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSaveEdit} className="w-full sm:w-auto">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
