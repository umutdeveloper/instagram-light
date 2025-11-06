import { Configuration } from '@/src/api/runtime';
import { AuthApi } from '@/src/api/apis/AuthApi';
import { PostsApi } from '@/src/api/apis/PostsApi';
import { CommentsApi } from '@/src/api/apis/CommentsApi';
import { FeedApi } from '@/src/api/apis/FeedApi';
import { UsersApi } from '@/src/api/apis/UsersApi';
import { UploadApi } from '@/src/api/apis/UploadApi';

// Base API URL - update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Creates an API configuration with optional JWT token
 */
export function createApiConfig(token?: string | null): Configuration {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new Configuration({
    basePath: API_BASE_URL,
    headers,
  });
}

/**
 * Creates authenticated API clients
 */
export function createApiClients(token?: string | null) {
  const config = createApiConfig(token);

  return {
    auth: new AuthApi(config),
    posts: new PostsApi(config),
    comments: new CommentsApi(config),
    feed: new FeedApi(config),
    users: new UsersApi(config),
    upload: new UploadApi(config),
  };
}

/**
 * Default API clients (without authentication)
 */
export const apiClient = createApiClients();
