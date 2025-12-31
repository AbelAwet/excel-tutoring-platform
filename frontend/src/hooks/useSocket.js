import { useEffect } from 'react';
import socketService from '../lib/socket';
import useAuthStore from '../stores/authStore';

const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketService.connect(accessToken);
    }

    return () => {
      // Don't disconnect on unmount, only on logout
    };
  }, [isAuthenticated, accessToken]);

  return socketService;
};

export default useSocket;
