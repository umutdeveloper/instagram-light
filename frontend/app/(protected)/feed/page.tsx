'use client';

import { useAuth } from '@/src/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Feed! 🎉</CardTitle>
          <CardDescription>
            You are successfully logged in as <strong>{user?.username}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This is a protected page. Only authenticated users can see this content.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">View Profile</Button>
            <Button variant="outline">Upload Post</Button>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feed Posts</CardTitle>
          <CardDescription>Posts from people you follow will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No posts yet. Start following people to see their posts!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
