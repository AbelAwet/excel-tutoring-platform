import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiVideo, FiArrowLeft } from 'react-icons/fi';
import VideoCall from '../components/VideoCall';
import { bookingService } from '../services/bookingService';
import useAuthStore from '../stores/authStore';

const VideoSession = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isCallActive, setIsCallActive] = useState(false);

  // Fetch booking details
  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBookingById(bookingId),
    enabled: !!bookingId,
  });

  const booking = bookingData?.data?.booking;

  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Session Not Found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isCallActive) {
    const roomName = `TutoringSession_${bookingId}`;
    const displayName = `${user.firstName} ${user.lastName}`;

    return (
      <VideoCall
        roomName={roomName}
        displayName={displayName}
        bookingId={bookingId}
        onClose={handleEndCall}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <FiArrowLeft size={20} />
          Back
        </button>

        {/* Session Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiVideo className="text-blue-600 dark:text-blue-400" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Live Tutoring Session
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to start your online tutoring session
            </p>
          </div>

          {/* Session Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Session Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {booking.subject?.name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tutor:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {booking.tutor?.user?.firstName} {booking.tutor?.user?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Student:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {booking.student?.firstName} {booking.student?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(booking.sessionDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {booking.duration} minutes
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
              Before you start:
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li>• Make sure your camera and microphone are working</li>
              <li>• Find a quiet place with good lighting</li>
              <li>• Have your study materials ready</li>
              <li>• Test your internet connection</li>
              <li>• Use headphones for better audio quality</li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartCall}
            className="w-full btn btn-primary py-4 text-lg flex items-center justify-center gap-3"
          >
            <FiVideo size={24} />
            Join Video Session
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Powered by Jitsi Meet - Secure & Private
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoSession;
