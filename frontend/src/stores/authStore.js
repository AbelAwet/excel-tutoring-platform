import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import socketService from '../lib/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (data) => {
        const { user, accessToken, refreshToken } = data;
        
        // First, clear any existing data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Disconnect any existing socket
        socketService.disconnect();
        
        // Store new tokens in localStorage
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        // Connect socket with new token
        if (accessToken) {
          socketService.connect(accessToken);
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Disconnect socket
        socketService.disconnect();

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      isStudent: () => {
        return get().user?.role === 'student';
      },

      isTutor: () => {
        return get().user?.role === 'tutor';
      },

      isAdmin: () => {
        return get().user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
