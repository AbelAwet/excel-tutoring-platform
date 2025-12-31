import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import AnimatedContainer from '../../components/AnimatedContainer';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.data);
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-email');
    },
    onError: (error) => {
      console.error('Registration error:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Image */}
      <div className="hidden lg:block relative bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <AnimatedContainer animation="fade-in-left" duration={0.8}>
            <div className="text-center text-white">
              <img 
                src="/logo/logo.png" 
                alt="EXCEL Tutoring" 
                className="h-16 mx-auto mb-8 animate-bounce-in"
              />
              <h1 className="text-4xl font-bold mb-4 animate-fade-in-up animate-delay-300">
                Excellence in Education
              </h1>
              <p className="text-xl text-blue-100 mb-8 animate-fade-in-up animate-delay-500">
                One Student at a Time
              </p>
              <img 
                src="/images/online-tutoring.png" 
                alt="Online tutoring" 
                className="rounded-2xl shadow-2xl max-w-md mx-auto hover-lift transition-all-smooth animate-fade-in-up animate-delay-700"
              />
            </div>
          </AnimatedContainer>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <AnimatedContainer animation="fade-in-right" duration={0.6}>
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <img 
                src="/logo/logo.png" 
                alt="EXCEL Tutoring" 
                className="h-12 mx-auto mb-4 lg:hidden animate-bounce-in"
              />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white animate-fade-in-up">
                Create Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 animate-fade-in-up animate-delay-200">
                Join EXCEL Tutoring Platform today
              </p>
            </div>

            <div className="card animate-scale-in animate-delay-300">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  className="input"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  className="input"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="input pl-10"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone (Optional)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  {...register('phone', {
                    pattern: {
                      value: /^[0-9+\-\s()]{10,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className="input pl-10"
                  placeholder="0912345678 or +251912345678"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number'
                    }
                  })}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I want to
              </label>
              <select {...register('role')} className="input">
                <option value="student">Learn (Student)</option>
                <option value="tutor">Teach (Tutor)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="btn btn-primary w-full hover-scale transition-all-smooth"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
              </form>

              <div className="mt-6 text-center animate-fade-in-up animate-delay-500">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium transition-all-smooth"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
};

export default Register;
