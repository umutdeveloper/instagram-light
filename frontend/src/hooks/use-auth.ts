"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/stores/auth-store";
import { createApiClients } from "@/src/lib/api-client";
import { getUsernameFromToken, isTokenValid } from "@/src/lib/auth";
import type { ModelsAuthRequest } from "@/src/api/models";

export function useAuth() {
  const router = useRouter();
  const { token, user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login user
   */
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiClient = createApiClients();
      const body: ModelsAuthRequest = { username, password };

      const response = await apiClient.auth.apiAuthLoginPost({ body });

      if (response.token) {
        // Validate and decode token
        if (!isTokenValid(response.token)) {
          throw new Error("Invalid token received");
        }

        const usernameFromToken = getUsernameFromToken(response.token);

        // Save to store
        setAuth(response.token, {
          username: usernameFromToken || username,
        });

        // Redirect to feed
        router.push("/feed");
        return { success: true };
      } else {
        throw new Error("No token received");
      }
    } catch (err: unknown) {
      let errorMessage = "Login failed";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiClient = createApiClients();
      const body: ModelsAuthRequest = { username, password };

      const response = await apiClient.auth.apiAuthRegisterPost({ body });

      if (response.message) {
        // Auto-login after successful registration
        return await login(username, password);
      } else {
        throw new Error("Registration failed");
      }
    } catch (err: unknown) {
      let errorMessage = "Registration failed";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  /**
   * Check if user is authenticated
   */
  const checkAuth = () => {
    if (!token || !isTokenValid(token)) {
      return false;
    }
    return isAuthenticated;
  };

  return {
    // State
    token,
    user,
    isAuthenticated: token ? isTokenValid(token) : false,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    checkAuth,
  };
}
