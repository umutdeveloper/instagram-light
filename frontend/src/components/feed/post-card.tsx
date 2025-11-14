'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { PostDialog } from './post-dialog';
import { Heart, MessageCircle, AlertCircle, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelsPostWithLikes } from '@/src/api/models';

interface PostCardProps {
  post: ModelsPostWithLikes;
  onLike: (postId: number) => Promise<void>;
  onDelete?: (postId: number) => Promise<void>;
  currentUserId?: number;
}

export function PostCard({ post, onLike, onDelete, currentUserId }: PostCardProps) {
  const router = useRouter();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(post.isLiked || false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount || 0);

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
    if (!post.id || !onDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(post.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  // Generate user initials from username
  const getUserInitials = (username?: string) => {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  // Get display name (username or fallback to User ID)
  const getDisplayName = () => {
    return post.username || `User ${post.userId}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white font-semibold">
          {getUserInitials(post.username)}
        </div>
        <div className="flex-1">
          <button 
            onClick={() => {
              if (post.userId) router.push(`/profile/${post.userId}`);
            }}
            className="font-semibold text-sm hover:underline cursor-pointer text-left"
          >
            {getDisplayName()}
          </button>
          {post.createdAt && (
            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
          )}
        </div>
        {isOwnPost && onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Moderation Warning */}
      {/* Image */}
      {post.mediaUrl && (
        <div className="relative w-full aspect-square bg-muted overflow-hidden">
          <Image
            src={getImageUrl(post.mediaUrl)}
            alt={post.caption || 'Post image'}
            fill
            unoptimized
            className={cn(
              'object-cover',
              post.flagged && 'blur-xl'
            )}
            sizes="(max-width: 768px) 100vw, 600px"
          />
          {post.flagged && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-center p-4">
              <AlertCircle className="h-12 w-12 mb-3 text-yellow-500" />
              <h3 className="font-semibold mb-2">Sensitive Content Warning</h3>
              <p className="text-sm opacity-90 mb-4">
                This content may contain sensitive images
              </p>
              <Button 
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPostDialog(true);
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                View post
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 pt-3">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'hover:scale-110 transition-transform',
            localIsLiked && 'text-red-500'
          )}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart
            className={cn('h-6 w-6', localIsLiked && 'fill-current')}
          />
        </Button>
        <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Likes count */}
      {localLikesCount > 0 && (
        <div className="px-4 pt-2">
          <p className="text-sm font-semibold">
            {localLikesCount} {localLikesCount === 1 ? 'like' : 'likes'}
          </p>
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-4 py-2">
          <p className="text-sm whitespace-pre-wrap wrap-break-word">
            <button 
              onClick={() => {
                if (post.userId) router.push(`/profile/${post.userId}`);
              }}
              className="font-semibold mr-2 hover:underline cursor-pointer"
            >
              {getDisplayName()}
            </button>
            {post.caption}
          </p>
        </div>
      )}

      {/* Post Dialog */}
      <PostDialog
        post={post}
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
        onLike={onLike}
        onDelete={onDelete}
        currentUserId={currentUserId}
      />

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
    </Card>
  );
}
