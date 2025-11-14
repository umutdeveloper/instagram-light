'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/src/stores/auth-store';
import { createApiClients } from '@/src/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PostDialog } from '@/src/components/feed/post-dialog';
import { Loader2, Grid3x3, Calendar, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelsUser, ModelsPost } from '@/src/api/models';
import Image from 'next/image';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { token, user: currentUser } = useAuthStore();
  const [user, setUser] = useState<ModelsUser | null>(null);
  const [posts, setPosts] = useState<ModelsPost[]>([]);
  const [followers, setFollowers] = useState<ModelsUser[]>([]);
  const [following, setFollowing] = useState<ModelsUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [dropdownOpenPostId, setDropdownOpenPostId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<ModelsPost | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [pendingPost, setPendingPost] = useState<ModelsPost | null>(null);

  const isOwnProfile = currentUser?.id === parseInt(userId);

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

    const handleDeletePost = async (postId: number) => {
    setDeletingPostId(postId);
  };

  const confirmDeletePost = async (postId: number) => {
    if (!token) return;

    try {
      const apiClients = createApiClients(token);
      await apiClients.posts.apiPostsIdDelete({ id: postId });
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setDeletingPostId(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
      setDeletingPostId(null);
    }
  };

  const handlePostClick = (post: ModelsPost) => {
    if (post.flagged) {
      setPendingPost(post);
      setShowContentWarning(true);
    } else {
      setSelectedPost(post);
      setShowPostDialog(true);
    }
  };

  const handleViewSensitiveContent = () => {
    if (pendingPost) {
      setSelectedPost(pendingPost);
      setShowPostDialog(true);
    }
    setShowContentWarning(false);
    setPendingPost(null);
  };

  const handleCancelViewContent = () => {
    setShowContentWarning(false);
    setPendingPost(null);
  };

  const handleLike = async (postId: number) => {
    if (!token) return;
    
    try {
      const apiClients = createApiClients(token);
      await apiClients.posts.apiPostsIdLikePost({ id: postId });
      // TODO: Update local state or refetch posts to get updated like count
      console.log('Post liked:', postId);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
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
                className="relative aspect-square bg-muted group overflow-hidden rounded-sm cursor-pointer"
                data-state={dropdownOpenPostId === post.id ? 'open' : 'closed'}
                onClick={() => handlePostClick(post)}
              >
                <Image
                  src={getImageUrl(post.mediaUrl)}
                  alt={post.caption || 'Post'}
                  fill
                  unoptimized
                  className={cn(
                    "object-cover transition-transform group-hover:scale-105",
                    post.flagged && "blur-xl"
                  )}
                  sizes="(max-width: 768px) 33vw, 25vw"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-data-[state=open]:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm px-4 text-center line-clamp-3">
                    {post.caption}
                  </p>
                </div>
                {/* Delete button */}
                {isOwnProfile && post.id && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-data-[state=open]:opacity-100 transition-opacity">
                    <DropdownMenu 
                      onOpenChange={(open) => {
                        setDropdownOpenPostId(open ? post.id! : null);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70 border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4 text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePost(post.id!);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingPostId !== null} onOpenChange={() => setDeletingPostId(null)}>
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
              onClick={() => deletingPostId && confirmDeletePost(deletingPostId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sensitive Content Warning Dialog */}
      <AlertDialog open={showContentWarning} onOpenChange={setShowContentWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-lg">Sensitive Content Warning</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This post may contain sensitive images or content that some users might find disturbing. 
              Are you sure you want to view it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={handleCancelViewContent}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleViewSensitiveContent}
              className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              View Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Post Dialog */}
      {selectedPost && (
        <PostDialog
          post={{
            ...selectedPost,
            isLiked: false, // TODO: Get real like status from API
            likesCount: 0, // TODO: Get real likes count from API  
            username: user?.username
          }}
          open={showPostDialog}
          onOpenChange={setShowPostDialog}
          onLike={handleLike}
          onDelete={confirmDeletePost}
          currentUserId={currentUser?.id}
        />
      )}
    </div>
  );
}
