'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, CornerDownRight } from 'lucide-react';
import { commentService } from '@/services/comment.service';
import { Comment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Props {
  postId: string;
}

interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export default function CommentSection({ postId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  const loadComments = async () => {
    try {
      const data = await commentService.getPostComments(postId);
      // Group replies under their parent
      const topLevel = data.filter((c: Comment) => !c.parentId);
      const withReplies: CommentWithReplies[] = topLevel.map((c: Comment) => ({
        ...c,
        replies: data.filter((r: Comment) => r.parentId === c._id),
      }));
      setComments(withReplies);
    } catch {
      setComments([]);
    }
  };

  useEffect(() => { loadComments(); }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to comment.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await commentService.createComment({ content: newComment.trim(), postId, userId: user._id });
      setNewComment('');
      toast({ title: 'Comment added!' });
      loadComments();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return;
    setIsReplySubmitting(true);
    try {
      await commentService.createComment({ content: replyText.trim(), postId, userId: user._id, parentId });
      setReplyText('');
      setReplyingTo(null);
      toast({ title: 'Reply added!' });
      loadComments();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to like.', variant: 'destructive' });
      return;
    }
    try {
      const updated = await commentService.likeComment(commentId);
      loadComments();
    } catch {
      // silent
    }
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">Comments ({totalCount})</h2>

      {comments.length === 0 ? (
        <p className="text-muted-foreground mb-6">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div key={comment._id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.userId}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleLike(comment._id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" /> {comment.numberOfLikes}
                    </button>
                    {user && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <CornerDownRight className="h-3 w-3" /> Reply
                      </button>
                    )}
                  </div>

                  {replyingTo === comment._id && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReply(comment._id)} disabled={isReplySubmitting || !replyText.trim()}>
                          {isReplySubmitting ? 'Posting...' : 'Post Reply'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-8 mt-2 space-y-2">
                  {comment.replies.map((reply) => (
                    <Card key={reply._id} className="border-l-4 border-l-primary/30">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${reply.userId}`} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <p className="text-xs text-muted-foreground">{format(new Date(reply.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                        <button
                          onClick={() => handleLike(reply._id)}
                          className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ThumbsUp className="h-3 w-3" /> {reply.numberOfLikes}
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="text-lg font-semibold">Leave a Comment</h3>
        {!user && <p className="text-sm text-muted-foreground">You must be signed in to comment.</p>}
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? 'Write your comment...' : 'Sign in to comment...'}
          disabled={!user}
          rows={4}
        />
        <Button type="submit" disabled={!user || isSubmitting || !newComment.trim()}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    </div>
  );
}
