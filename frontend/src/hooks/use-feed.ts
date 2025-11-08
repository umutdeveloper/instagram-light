'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/src/stores/auth-store';
import { createApiClients } from '@/src/lib/api-client';
import { getUserIdFromToken } from '@/src/lib/auth';
import type { ModelsPostWithLikes } from '@/src/api/models';

interface UseFeedOptions {
  limit?: number;
}

export function useFeed({ limit = 10 }: UseFeedOptions = {}) {
  const { token } = useAuthStore();
  const [posts, setPosts] = useState<ModelsPostWithLikes[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Intersection observer ref
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch feed posts
  const fetchFeed = useCallback(
    async (pageNum: number) => {
      if (!token || isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const apiClient = createApiClients(token);
        const userId = getUserIdFromToken(token);

        if (!userId) {
          throw new Error('User ID not found in token');
        }

        const response = await apiClient.feed.apiFeedGet({
          userId,
          page: pageNum,
          limit,
        });

        const newPosts = response.posts || [];

        if (pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        // Check if there are more posts
        setHasMore(newPosts.length === limit);
      } catch (err) {
        console.error('Failed to fetch feed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setIsLoading(false);
      }
    },
    [token, limit, isLoading]
  );

  // Toggle like
  const toggleLike = useCallback(
    async (postId: number) => {
      if (!token) return;

      try {
        const apiClient = createApiClients(token);
        const response = await apiClient.posts.apiPostsIdLikePost({ id: postId });

        // Update liked posts set
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (response.liked) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });

        // Update post likes count in the list
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likesCount: response.liked
                    ? (post.likesCount || 0) + 1
                    : Math.max((post.likesCount || 0) - 1, 0),
                }
              : post
          )
        );
      } catch (err) {
        console.error('Failed to toggle like:', err);
        throw err;
      }
    },
    [token]
  );

  // Load more posts
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  }, [page, isLoading, hasMore, fetchFeed]);

  // Refresh feed
  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchFeed(1);
  }, [fetchFeed]);

  // Initial load
  useEffect(() => {
    fetchFeed(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    observerTarget,
    toggleLike,
    refresh,
    likedPosts,
  };
}
