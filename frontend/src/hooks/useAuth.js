import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.data);
      toast.success('Login successful!');
      
      // Redirect based on role
      const role = data.data.user.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'tutor') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.data);
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-email');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    },
  });
};

export const useVerifyEmail = () => {
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (otp) => authService.verifyEmail(otp),
    onSuccess: (data) => {
      updateUser(data.data.user);
      toast.success('Email verified successfully!');
      navigate('/student/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Verification failed');
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: () => authService.resendOTP(),
    onSuccess: () => {
      toast.success('OTP sent successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('Password reset link sent to your email!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, password }) => authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successful!');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Password reset failed');
    },
  });
};
