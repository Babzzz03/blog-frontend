'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { postService } from '@/services/post.service';
import { useAuth } from '@/context/AuthContext';
import { Post } from '@/types';
import { format } from 'date-fns';

export default function ManagePostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const postsPerPage = 10;

  const loadPosts = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const data = await postService.getPosts({
        startIndex: (page - 1) * postsPerPage,
        limit: postsPerPage,
        searchTerm: search || undefined,
        adminView: true,
      });
      setPosts(data.posts);
      setTotalPosts(data.totalPosts);
    } catch {
      toast({ title: 'Error', description: 'Failed to load posts.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts(1, searchTerm);
  };

  const handleDelete = async (post: Post) => {
    if (!user) return;
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await postService.deletePost(post._id, user._id);
      toast({ title: 'Post Deleted', description: 'Post has been deleted.' });
      loadPosts(currentPage, searchTerm);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Manage Posts</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-2">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="outline">Search</Button>
            </form>
            <Button asChild>
              <Link href="/dashboard/posts/create">
                <Plus className="mr-2 h-4 w-4" /> New Post
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No posts found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const status = (post as any).status || 'published';
                  const statusVariant =
                    status === 'published' ? 'default' :
                    status === 'draft' ? 'secondary' : 'outline';
                  return (
                  <TableRow key={post._id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{post.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant} className="capitalize">{status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(post.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{post.numberOfLikes}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/posts/${post._id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">
              {totalPosts} total posts
            </span>
            <div className="space-x-2">
              <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} variant="outline">
                Previous
              </Button>
              <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages} variant="outline">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isModalOpen && selectedPost && (
          <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Post Details</DialogTitle>
              </DialogHeader>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <div className="space-y-3 py-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <p className="font-medium">{selectedPost.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <p>{selectedPost.category}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Slug</Label>
                    <p className="text-sm font-mono">{selectedPost.slug}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Created</Label>
                    <p>{format(new Date(selectedPost.createdAt), 'PPP')}</p>
                  </div>
                </div>
              </motion.div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                <Button asChild>
                  <Link href={`/blog/${selectedPost.slug}`}>View Post</Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
