'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Heart, MessageCircle, Send, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { ModelsPostWithLikes } from '@/src/api/models';

interface PostDialogProps {
  post: ModelsPostWithLikes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike: (postId: number) => Promise<void>;
  onDelete?: (postId: number) => Promise<void>;
  currentUserId?: number;
}

export function PostDialog({ post, open, onOpenChange, onLike, onDelete, currentUserId }: PostDialogProps) {
  const router = useRouter();
  const [isLiking, setIsLiking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localIsLiked, setLocalIsLiked] = useState(post?.isLiked || false);
  const [localLikesCount, setLocalLikesCount] = useState(post?.likesCount || 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }, [commentText]);

  // Update local state when post changes
  useEffect(() => {
    if (post) {
      setLocalIsLiked(post.isLiked || false);
      setLocalLikesCount(post.likesCount || 0);
    }
  }, [post]);

  if (!post) return null;

  const isOwnPost = currentUserId && post.userId === currentUserId;

  // Convert relative path to absolute URL
  const getImageUrl = (mediaUrl?: string) => {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl;
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${apiBaseUrl}/${mediaUrl}`;
  };

  const getDisplayName = () => {
    return post.username || `User ${post.userId}`;
  };

  const getAvatarUrl = () => {
    // TODO: Add avatar URL when available in post model
    return '';
  };

  const handleLike = async () => {
    if (isLiking || !post.id) return;

    setIsLiking(true);
    
    // Optimistic update
    const newLikedState = !localIsLiked;
    setLocalIsLiked(newLikedState);
    setLocalLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      await onLike(post.id);
    } catch (error) {
      // Revert on error
      setLocalIsLiked(!newLikedState);
      setLocalLikesCount((prev) => (newLikedState ? prev - 1 : prev + 1));
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!post.id || !onDelete) return;

    try {
      await onDelete(post.id);
      onOpenChange(false);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // TODO: Implement comment submission
    console.log('Submitting comment:', commentText);
    setCommentText('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Post by {getDisplayName()}</DialogTitle>
          <div className="flex h-full">
            {/* Left side - Image */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              {post.mediaUrl && (
                <Image
                  src={getImageUrl(post.mediaUrl)}
                  alt={post.caption || 'Post image'}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="60vw"
                />
              )}
            </div>

            {/* Right side - Comments and interactions */}
            <div className="w-96 flex flex-col border-l">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b min-h-[60px]">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar 
                    size="sm"
                    src={getAvatarUrl()}
                    fallback={getDisplayName().charAt(0).toUpperCase()}
                  />
                  <button 
                    onClick={() => {
                      if (post.userId) {
                        router.push(`/profile/${post.userId}`);
                        onOpenChange(false);
                      }
                    }}
                    className="font-semibold hover:underline cursor-pointer"
                  >
                    {getDisplayName()}
                  </button>
                </div>
                {isOwnPost && (
                  <div className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Comments area */}
              <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Original post caption as first "comment" */}
                {post.caption && (
                  <div className="flex gap-3 p-4 border-b">
                    <Avatar 
                      size="sm"
                      src={getAvatarUrl()}
                      fallback={getDisplayName().charAt(0).toUpperCase()}
                    />
                    <div className="flex-1 flex items-center pt-1">
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">
                        <button 
                          onClick={() => {
                            if (post.userId) {
                              router.push(`/profile/${post.userId}`);
                              onOpenChange(false);
                            }
                          }}
                          className="font-semibold hover:underline cursor-pointer mr-2"
                        >
                          {getDisplayName()}
                        </button>
                        {post.caption}
                      </p>
                    </div>
                  </div>
                )}

                {/* TODO: Comments list will go here */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Start the conversation</p>
                </div>
              </div>

              {/* Actions and comment form */}
              <div className="border-t">
                {/* Like and comment buttons */}
                <div className="flex items-center gap-4 p-4 pb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    disabled={isLiking}
                    className="h-8 w-8"
                  >
                    <Heart
                      className={cn(
                        'h-5 w-5',
                        localIsLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
                      )}
                    />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </div>

                {/* Likes count */}
                {localLikesCount > 0 && (
                  <div className="px-4 pb-3">
                    <p className="text-sm font-semibold">
                      {localLikesCount} {localLikesCount === 1 ? 'like' : 'likes'}
                    </p>
                  </div>
                )}

                {/* Comment form */}
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 p-4 border-t">
                  <Avatar 
                    size="sm"
                    src={getAvatarUrl()}
                    fallback={getDisplayName().charAt(0).toUpperCase()}
                  />
                  <Textarea
                    ref={textareaRef}
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (commentText.trim()) {
                          handleCommentSubmit(e);
                        }
                      }
                    }}
                    className="flex-1 border-0 focus-visible:ring-0 shadow-none px-0 resize-none min-h-10 overflow-hidden"
                    rows={1}
                  />
                  {commentText.trim() && (
                    <Button type="submit" variant="ghost" size="icon" className="h-8 w-8">
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}