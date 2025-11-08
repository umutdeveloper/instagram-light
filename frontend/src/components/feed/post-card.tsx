'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelsPostWithLikes } from '@/src/api/models';

interface PostCardProps {
  post: ModelsPostWithLikes;
  onLike: (postId: number) => Promise<void>;
  isLiked?: boolean;
}

export function PostCard({ post, onLike, isLiked = false }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount || 0);

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

  // Generate user initials from userId (simple approach)
  const getUserInitials = (userId?: number) => {
    if (!userId) return 'U';
    const str = `User${userId}`;
    return str.substring(0, 2).toUpperCase();
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
          {getUserInitials(post.userId)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">User {post.userId}</p>
          {post.createdAt && (
            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
          )}
        </div>
      </div>

      {/* Image */}
      {post.mediaUrl && (
        <div className="relative w-full aspect-square bg-muted">
          <Image
            src={post.mediaUrl}
            alt={post.caption || 'Post image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
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
          <p className="text-sm">
            <span className="font-semibold mr-2">User {post.userId}</span>
            {post.caption}
          </p>
        </div>
      )}
    </Card>
  );
}
