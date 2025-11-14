'use client';

import { useFeed } from '@/src/hooks/use-feed';
import { useAuthStore } from '@/src/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PostCard } from '@/src/components/feed/post-card';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuthStore();
  const {
    posts,
    isLoading,
    error,
    hasMore,
    observerTarget,
    toggleLike,
    deletePost,
    refresh,
  } = useFeed({ limit: 10 });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              {error}
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={refresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      {!error && (
        <div className="space-y-6 max-w-lg mx-auto">
          {posts.length === 0 && !isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground text-lg">
                    No posts yet in your feed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start following people to see their posts here!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={toggleLike}
                  onDelete={deletePost}
                  currentUserId={user?.id}
                />
              ))}

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div
                  ref={observerTarget}
                  className="flex justify-center py-8"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* End of Feed */}
              {!hasMore && posts.length > 0 && (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-center text-muted-foreground text-sm">
                      You&apos;re all caught up! 🎉
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Initial Loading State */}
      {isLoading && posts.length === 0 && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                </div>
                <div className="w-full aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
