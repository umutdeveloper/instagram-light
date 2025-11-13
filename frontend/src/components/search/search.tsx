'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from './search-bar';
import { UserSearchResults } from './user-search-results';
import { createApiClients } from '@/src/lib/api-client';
import { useAuthStore } from '@/src/stores/auth-store';
import type { ModelsUser } from '@/src/api/models';

interface SearchProps {
  token?: string | null;
  className?: string;
  showDropdown?: boolean;
}

export function Search({ token, className = '', showDropdown = true }: SearchProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [users, setUsers] = useState<ModelsUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, showDropdown]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setUsers([]);
        setError(null);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsOpen(true);

      try {
        const apiClients = createApiClients(token);
        const results = await apiClients.users.apiUsersSearchGet({
          q: debouncedQuery,
        });
        // Filter out current user from search results
        const filteredResults = results.filter(
          (user) => user.username !== currentUser?.username
        );
        setUsers(filteredResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search users');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, token, currentUser?.username]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setUsers([]);
    setError(null);
    setIsOpen(false);
  }, []);

  const handleUserClick = useCallback(
    (user: ModelsUser) => {
      if (user.id) {
        router.push(`/profile/${user.id}`);
        setIsOpen(false);
      }
    },
    [router]
  );

  const resultsVisible = showDropdown ? isOpen && (searchQuery || isLoading) : (searchQuery || isLoading);

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={handleClear}
        placeholder="Search users..."
      />
      {resultsVisible && (
        <div className={showDropdown ? 'absolute z-50 w-full max-w-md mt-2' : 'mt-2'}>
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : (
            <UserSearchResults
              users={users}
              isLoading={isLoading}
              searchQuery={debouncedQuery}
              onUserClick={handleUserClick}
            />
          )}
        </div>
      )}
    </div>
  );
}
