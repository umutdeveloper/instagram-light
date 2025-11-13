import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  username: string;
  id: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: User) => {
        // Set cookie for middleware
        Cookies.set('auth-token', token, { 
          expires: 7, // 7 days
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        });
        
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        // Remove cookie
        Cookies.remove('auth-token');
        
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage', // LocalStorage key
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
