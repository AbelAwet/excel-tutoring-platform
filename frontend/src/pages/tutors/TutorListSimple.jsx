import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FiStar, FiCalendar, FiUser, FiMessageSquare } from 'react-icons/fi';
import { tutorService } from '../../services/tutorService';
import { messageService } from '../../services/messageService';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

// Add CSS animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

const TutorListSimple = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Inject styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  // Fetch tutors
  const { data: tutorsData, isLoading, error } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => tutorService.getAllTutors({}),
    retry: 1
  });

  const tutors = tutorsData?.data?.tutors || [];

  const handleSendMessage = async (tutor) => {
    if (!isAuthenticated) {
      toast.error('Please login to send a message');
      navigate('/login');
      return;
    }

    if (user?.role !== 'student') {
      toast.error('Only students can send messages to tutors');
      return;
    }

    try {
      const loadingToast = toast.loading('Creating conversation...');
      const response = await messageService.createConversation(tutor.user._id);
      toast.dismiss(loadingToast);

      const conversationData = response.data.data?.conversation || response.data.conversation;
      
      if (conversationData) {
        toast.success('Opening conversation...');
        navigate('/student/messages', { 
          state: { 
            conversationId: conversationData._id,
            tutorId: tutor.user._id,
            tutorName: `${tutor.user.firstName} ${tutor.user.lastName}`,
            fromTutorList: true
          }
        });
      } else {
        toast.error('Failed to create conversation');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to start conversation');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading tutors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold">Error Loading Tutors</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Find Your Perfect Tutor
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Browse qualified tutors and book personalized learning sessions with EXCEL Tutoring experts
        </p>
      </div>

      {/* Stats Bar */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-3 rounded-full border border-blue-200 dark:border-blue-800">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {tutors.length} Expert Tutor{tutors.length !== 1 ? 's' : ''} Available
          </span>
        </div>
      </div>

      {/* Tutors List */}
      {tutors.length === 0 ? (
        <div className="text-center py-12">
          <FiUser className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tutors found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No verified tutors are currently available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutors.map((tutor, index) => (
            <div 
              key={tutor._id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {/* Tutor Avatar */}
              <div className="text-center mb-6 relative">
                <div className="relative inline-block">
                  <img
                    src={tutor.user?.avatar?.url || 'https://via.placeholder.com/120'}
                    alt={tutor.user?.firstName || 'Tutor'}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white dark:border-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tutor.user?.firstName} {tutor.user?.lastName}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3 font-medium">
                  {tutor.headline || 'Professional Tutor'}
                </p>

                {/* Status */}
                <div className="mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                    tutor.isAvailable 
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                  }`}>
                    ✓ {tutor.isAvailable ? 'Available Now' : 'Busy'}
                  </span>
                </div>

                {/* Subjects */}
                <div className="mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  {tutor.subjects && tutor.subjects.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        📚 {tutor.subjects[0].subject?.name || 'Subject'}
                      </p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {tutor.subjects[0].pricePerHour} ETB/hour
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {tutor.subjects[0].level} level
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No subjects listed</p>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center mb-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(tutor.rating?.average || 4.5) 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {tutor.rating?.average || 4.5} ({tutor.rating?.count || 0} reviews)
                  </span>
                </div>

                {/* Description */}
                {tutor.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
                    "{tutor.description.substring(0, 80)}..."
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-2 mt-6">
                  <Link
                    to={`/tutors/${tutor._id}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                  >
                    <FiCalendar className="mr-2 group-hover:animate-bounce" size={18} />
                    View Profile & Book
                  </Link>
                  <button
                    onClick={() => handleSendMessage(tutor)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                  >
                    <FiMessageSquare className="mr-2 group-hover:animate-pulse" size={18} />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorListSimple;