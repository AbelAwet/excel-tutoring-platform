import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  FiStar, FiMapPin, FiClock, FiDollarSign, FiCalendar,
  FiMessageSquare, FiBook, FiAward, FiUsers, FiArrowLeft
} from 'react-icons/fi';
import { tutorService } from '../../services/tutorService';
import { bookingService } from '../../services/bookingService';
import { messageService } from '../../services/messageService';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessionType, setSessionType] = useState('online');
  const [notes, setNotes] = useState('');

  // Fetch tutor profile
  const { data: tutorData, isLoading } = useQuery({
    queryKey: ['tutor-profile', id],
    queryFn: () => tutorService.getTutorById(id),
  });

  // Book session mutation
  const bookSessionMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: async (data) => {
      toast.success('Session booked successfully!');
      setShowBookingModal(false);
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      
      // Automatically create conversation after booking
      try {
        await messageService.createConversation(tutor.user._id);
        
        // Show success message with option to go to messages
        toast.success(
          <div>
            <p>Session booked! You can now message your tutor.</p>
            <button
              onClick={() => navigate('/student/messages')}
              className="mt-2 text-sm bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100"
            >
              Go to Messages
            </button>
          </div>,
          { duration: 5000 }
        );
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to book session');
    },
  });

  const tutor = tutorData?.data?.tutor;

  const handleBookSession = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book a session');
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    // Calculate end time (1 hour session by default)
    const [hours, minutes] = selectedTime.split(':');
    const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:${minutes}`;

    bookSessionMutation.mutate({
      tutorId: id,
      subjectId: selectedSubject,
      sessionDate: selectedDate,
      startTime: selectedTime,
      endTime: endTime,
      duration: 60, // 1 hour in minutes
      notes: notes.trim()
    });
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to send a message');
      return;
    }

    if (user?.role !== 'student') {
      toast.error('Only students can send messages to tutors');
      return;
    }

    try {
      // Create or get existing conversation
      const response = await messageService.createConversation(tutor.user._id);

      if (response.data.success) {
        // Navigate to messages page with the conversation
        navigate('/student/messages', { 
          state: { 
            conversationId: response.data.data.conversation._id,
            tutorName: `${tutor.user.firstName} ${tutor.user.lastName}`
          }
        });
        toast.success('Opening conversation...');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  // Generate time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
            <div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tutor Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The tutor you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/tutors" className="btn btn-primary">
            Browse Other Tutors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Back Button */}
      <Link
        to="/tutors"
        className="inline-flex items-center text-[#3b82f6] hover:underline mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Tutors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tutor Header */}
          <div className="card">
            <div className="flex items-start space-x-6">
              <img
                src={tutor.user?.avatar?.url || 'https://via.placeholder.com/150'}
                alt={tutor.user?.firstName}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tutor.user?.firstName} {tutor.user?.lastName}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                      {tutor.title || 'Professional Tutor'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tutor.isAvailable 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {tutor.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>

                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center">
                    {renderStars(tutor.rating?.average || 4.5)}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {tutor.rating?.average?.toFixed(1) || '4.5'} ({tutor.rating?.count || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiClock className="mr-1" />
                    {tutor.experience || 2}+ years
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiUsers className="mr-1" />
                    {tutor.totalStudents || 0} students
                  </div>
                </div>

                {tutor.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <FiMapPin className="mr-1" />
                    {tutor.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {tutor.bio || 'This tutor has not provided a bio yet.'}
            </p>
          </div>

          {/* Subjects */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Subjects
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tutor.subjects?.map((subjectItem) => (
                <div key={subjectItem._id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiBook className="text-[#3b82f6]" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {subjectItem.subject?.name || subjectItem.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {subjectItem.pricePerHour} ETB/hr
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-600 dark:text-gray-400 col-span-full">
                  No subjects listed
                </p>
              )}
            </div>
          </div>

          {/* Education & Certifications */}
          {tutor.education && tutor.education.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Education & Certifications
              </h2>
              <div className="space-y-4">
                {tutor.education.map((edu, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <FiAward className="text-[#3b82f6] mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {edu.institution} • {edu.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <div className="card">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {tutor.hourlyRate || 200} ETB
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                per hour
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowBookingModal(true)}
                disabled={!tutor.isAvailable}
                className="btn btn-primary w-full"
              >
                <FiCalendar className="mr-2" />
                Book Session
              </button>

              <button 
                onClick={handleSendMessage}
                className="btn btn-ghost w-full"
              >
                <FiMessageSquare className="mr-2" />
                Send Message
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div className="flex justify-between">
                  <span>Response time:</span>
                  <span className="font-medium">Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Session types:</span>
                  <span className="font-medium">Online & In-person</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tutor.totalSessions || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tutor.successRate || 95}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(tutor.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Book Session with {tutor.user?.firstName}
              </h2>

              <form onSubmit={handleBookSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Select subject</option>
                    {tutor.subjects?.map((subject) => (
                      <option 
                        key={subject._id} 
                        value={subject.subject?._id || subject.subject}
                      >
                        {subject.subject?.name || subject.name} - {subject.pricePerHour} ETB/hr
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Type
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="input"
                  >
                    <option value="online">Online</option>
                    <option value="in-person">In-person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="input"
                    placeholder="Any specific topics or requirements..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookSessionMutation.isPending}
                    className="flex-1 btn btn-primary"
                  >
                    {bookSessionMutation.isPending ? 'Booking...' : 'Book Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfile;
