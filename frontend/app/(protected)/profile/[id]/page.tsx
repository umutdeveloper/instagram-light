'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/src/stores/auth-store';
import { createApiClients } from '@/src/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Grid3x3, Calendar } from 'lucide-react';
import type { ModelsUser, ModelsPost } from '@/src/api/models';
import Image from 'next/image';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { token } = useAuthStore();
  const [user, setUser] = useState<ModelsUser | null>(null);
  const [posts, setPosts] = useState<ModelsPost[]>([]);
  const [followers, setFollowers] = useState<ModelsUser[]>([]);
  const [following, setFollowing] = useState<ModelsUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token || !userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const apiClients = createApiClients(token);

        // Fetch user info, followers, following, and posts in parallel
        const [userResponse, followersResponse, followingResponse, postsResponse] = await Promise.all([
          apiClients.users.apiUsersIdGet({ id: parseInt(userId) }),
          apiClients.users.apiUsersIdFollowersGet({ id: parseInt(userId) }),
          apiClients.users.apiUsersIdFollowingGet({ id: parseInt(userId) }),
          apiClients.posts.apiPostsGet({ page: 1, limit: 50 }),
        ]);

        setUser(userResponse);
        setFollowers(followersResponse);
        setFollowing(followingResponse);
        
        // Filter posts by user ID
        const userPosts = postsResponse.posts?.filter(post => post.userId === parseInt(userId)) || [];
        setPosts(userPosts);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [token, userId]);

  const getImageUrl = (mediaUrl?: string) => {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl;
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${apiBaseUrl}/${mediaUrl}`;
  };

  const getUserInitials = (username?: string) => {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-destructive">{error || 'User not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Avatar */}
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white font-bold text-4xl shrink-0">
            {getUserInitials(user.username)}
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-6 w-full">
            {/* Username and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Follow
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 text-sm">
              <div className="flex flex-col items-center sm:items-start">
                <span className="font-semibold text-lg">{posts.length}</span>
                <span className="text-muted-foreground">posts</span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="font-semibold text-lg">{followers.length}</span>
                <span className="text-muted-foreground">followers</span>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <span className="font-semibold text-lg">{following.length}</span>
                <span className="text-muted-foreground">following</span>
              </div>
            </div>

            {/* Bio Info */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Grid3x3 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Posts</h2>
        </div>

        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No posts yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square bg-muted cursor-pointer group overflow-hidden rounded-sm"
              >
                <Image
                  src={getImageUrl(post.mediaUrl)}
                  alt={post.caption || 'Post'}
                  fill
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 33vw, 25vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm px-4 text-center line-clamp-2">
                    {post.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
