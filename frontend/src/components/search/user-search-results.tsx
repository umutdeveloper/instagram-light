'use client';

import { Card } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import type { ModelsUser } from '@/src/api/models';

interface UserSearchResultsProps {
  users: ModelsUser[];
  isLoading: boolean;
  searchQuery: string;
  onUserClick: (user: ModelsUser) => void;
}

export function UserSearchResults({
  users,
  isLoading,
  searchQuery,
  onUserClick,
}: UserSearchResultsProps) {
  // Generate user initials from username
  const getUserInitials = (username?: string) => {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Searching...</span>
        </div>
      </Card>
    );
  }

  if (!searchQuery) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Search className="h-8 w-8" />
          <p>Search for users by username or email</p>
        </div>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Search className="h-8 w-8" />
          <p>No users found for &quot;{searchQuery}&quot;</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserClick(user)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white font-semibold shrink-0">
              {getUserInitials(user.username)}
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{user.username || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
