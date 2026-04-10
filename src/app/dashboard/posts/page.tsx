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

  const statusVariant = (status: string) =>
    status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline';

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Manage Posts</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search + New Post */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline" className="shrink-0">Search</Button>
            </form>
            <Button asChild className="shrink-0">
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
            <>
              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {posts.map((post) => {
                  const status = (post as any).status || 'published';
                  return (
                    <div key={post._id} className="border rounded-lg p-3 space-y-2">
                      <p className="font-medium text-sm leading-snug line-clamp-2">{post.title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        <Badge variant={statusVariant(status)} className="text-xs capitalize">{status}</Badge>
                        {(post as any).isPremium && <Badge variant="outline" className="text-xs">Premium</Badge>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                        <span>{post.numberOfLikes} likes</span>
                      </div>
                      <div className="flex gap-1 pt-1 border-t">
                        <Button variant="ghost" size="sm" className="h-8 px-2 flex-1"
                          onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 flex-1" asChild>
                          <Link href={`/dashboard/posts/${post._id}/edit`}>
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 flex-1"
                          onClick={() => handleDelete(post)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" />
                          <span className="text-destructive">Delete</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                      return (
                        <TableRow key={post._id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                          <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                          <TableCell><Badge variant={statusVariant(status)} className="capitalize">{status}</Badge></TableCell>
                          <TableCell>{format(new Date(post.createdAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{post.numberOfLikes}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon"
                                onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}>
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
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <span className="text-sm text-muted-foreground">{totalPosts} total posts</span>
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1} variant="outline" size="sm">
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-1">
                {currentPage} / {totalPages || 1}
              </span>
              <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages} variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isModalOpen && selectedPost && (
          <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
            <DialogContent className="sm:max-w-[600px] mx-4">
              <DialogHeader>
                <DialogTitle>Post Details</DialogTitle>
              </DialogHeader>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <div className="space-y-3 py-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <p className="font-medium text-sm">{selectedPost.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <p className="text-sm">{selectedPost.category}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Slug</Label>
                    <p className="text-sm font-mono break-all">{selectedPost.slug}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Created</Label>
                    <p className="text-sm">{format(new Date(selectedPost.createdAt), 'PPP')}</p>
                  </div>
                </div>
              </motion.div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Close</Button>
                <Button asChild className="w-full sm:w-auto">
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
