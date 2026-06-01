import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiRefreshCw } from 'react-icons/fi';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();

  const verifyMutation = useMutation({
    mutationFn: (otpCode) => authService.verifyEmail({ otp: otpCode }),
    onSuccess: (data) => {
      setAuth(data.data);
      toast.success('Email verified successfully!');
      
      // Redirect based on role
      const role = data.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'tutor') navigate('/tutor');
      else navigate('/student');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Verification failed';
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        toast.error(`${message}: ${errors[0].message}`);
      } else {
        toast.error(message);
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: authService.resendOTP,
    onSuccess: () => {
      toast.success('OTP sent to your email!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    },
  });

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value) {
      const otpCode = newOtp.join('');
      if (otpCode.length === 6) {
        verifyMutation.mutate(otpCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    
    if (pastedData.length === 6) {
      verifyMutation.mutate(pastedData);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      verifyMutation.mutate(otpCode);
    } else {
      toast.error('Please enter the complete 6-digit OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMail className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-[#3b82f6] font-medium">
            {user?.email}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Enter OTP Code
              </label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={verifyMutation.isPending}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isPending || otp.join('').length !== 6}
              className="btn btn-primary w-full"
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="btn btn-ghost inline-flex items-center gap-2"
            >
              <FiRefreshCw className={resendMutation.isPending ? 'animate-spin' : ''} />
              {resendMutation.isPending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> If you don't see the email, check your spam folder. 
              The OTP expires in 10 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
