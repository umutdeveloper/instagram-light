'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelsPostWithLikes } from '@/src/api/models';

interface PostCardProps {
  post: ModelsPostWithLikes;
  onLike: (postId: number) => Promise<void>;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const router = useRouter();
  const [isLiking, setIsLiking] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(post.isLiked || false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount || 0);

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
      </div>

      {/* Moderation Warning */}
      {post.flagged && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm">
              This post is under review for content moderation
            </p>
          </div>
        </div>
      )}

      {/* Image */}
      {post.mediaUrl && (
        <div className="relative w-full aspect-square bg-muted">
          <Image
            src={getImageUrl(post.mediaUrl)}
            alt={post.caption || 'Post image'}
            fill
            unoptimized
            className={cn(
              'object-cover',
              post.flagged && 'blur-lg'
            )}
            sizes="(max-width: 768px) 100vw, 600px"
          />
          {post.flagged && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <p className="text-white font-semibold text-center px-4">
                Content Under Review
              </p>
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
    </Card>
  );
}
