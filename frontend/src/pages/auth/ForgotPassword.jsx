import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/forgot-password', { 
        email: email.toLowerCase().trim() 
      });
      
      console.log('Forgot password response:', response.data);
      
      if (response.data.success) {
        setIsEmailSent(true);
        if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl);
          toast.success('Password reset link generated! (Email not configured)');
        } else {
          toast.success('Password reset email sent! Check your inbox.');
        }
      } else {
        toast.error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <FiCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Check Your Email
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We've sent a password reset link to
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {email}
            </p>
          </div>

          {resetUrl ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                <strong>⚠️ Email service not configured</strong>
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                Use this link to reset your password:
              </p>
              <a
                href={resetUrl}
                className="block w-full p-2 bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {resetUrl}
              </a>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Link expires in 15 minutes
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• The link expires in 15 minutes</li>
                <li>• Make sure you entered the correct email</li>
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail('');
              }}
              className="w-full btn btn-secondary"
            >
              Try Different Email
            </button>
            
            <Link
              to="/login"
              className="w-full btn btn-ghost flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Forgot Password?
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <Link
              to="/login"
              className="w-full btn btn-ghost flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" size={16} />
              Back to Login
            </Link>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
