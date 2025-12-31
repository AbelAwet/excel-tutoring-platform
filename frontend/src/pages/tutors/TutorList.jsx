import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiStar, FiMapPin, FiDollarSign,
  FiUser, FiBook, FiClock, FiMessageSquare, FiCalendar
} from 'react-icons/fi';
import { tutorService } from '../../services/tutorService';
import { messageService } from '../../services/messageService';
import useAuthStore from '../../stores/authStore';
import QuickMessageModal from '../../components/QuickMessageModal';
import toast from 'react-hot-toast';

// Enhanced TutorList with messaging functionality
const TutorList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch tutors
  const { data: tutorsData, isLoading, error } = useQuery({
    queryKey: ['tutors', searchTerm, selectedSubject, priceRange, sortBy, currentPage],
    queryFn: () => tutorService.getAllTutors({
      search: searchTerm,
      subject: selectedSubject,
      priceRange,
      sortBy,
      page: currentPage,
      limit: 12
    }),
    retry: 1
  });

  const tutors = tutorsData?.data?.tutors || [];
  const pagination = tutorsData?.data?.pagination || {};

  // Mock subjects for filter (you can fetch from API)
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'Computer Science', 'History', 'Geography', 'Economics', 'Art'
  ];

  const priceRanges = [
    { label: 'Under 100 ETB', value: '0-100' },
    { label: '100-300 ETB', value: '100-300' },
    { label: '300-500 ETB', value: '300-500' },
    { label: '500+ ETB', value: '500-999999' }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const handleQuickMessage = (tutor) => {
    if (!isAuthenticated) {
      toast.error('Please login to send a message');
      return;
    }

    if (user?.role !== 'student') {
      toast.error('Only students can send messages to tutors');
      return;
    }

    setSelectedTutor(tutor);
    setShowMessageModal(true);
  };

  const handleMessageSuccess = (conversationId) => {
    // Navigate to messages page with the conversation
    navigate('/student/messages', { 
      state: { 
        conversationId,
        tutorName: `${selectedTutor.user.firstName} ${selectedTutor.user.lastName}`
      }
    });
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Tutors
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {error.message || 'Failed to load tutors. Please try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Find Your Perfect Tutor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse qualified tutors and book personalized learning sessions
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tutors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          {/* Price Range */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="input"
          >
            <option value="">Any Price</option>
            {priceRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="experience">Most Experienced</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pagination.total || 0} tutors found
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSubject('');
              setPriceRange('');
              setSortBy('rating');
            }}
            className="text-sm text-[#3b82f6] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tutors Grid */}
      {tutors.length === 0 ? (
        <div className="card text-center py-12">
          <FiUser className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tutors found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search criteria or browse all tutors
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSubject('');
              setPriceRange('');
            }}
            className="btn btn-primary"
          >
            Show All Tutors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor._id} className="card hover:shadow-xl transition-all duration-300 group">
              {/* Tutor Avatar */}
              <div className="relative mb-4">
                <img
                  src={tutor.user?.avatar?.url || 'https://via.placeholder.com/200'}
                  alt={tutor.user?.firstName}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tutor.isAvailable 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {tutor.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#3b82f6] transition-colors">
                    {tutor.user?.firstName} {tutor.user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tutor.headline || tutor.title || 'Professional Tutor'}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(tutor.rating || 4.5)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {tutor.rating || 4.5} ({tutor.totalReviews || 0} reviews)
                  </span>
                </div>

                {/* Subjects */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FiBook className="mr-2" size={16} />
                  <span className="truncate">
                    {tutor.subjects?.slice(0, 2).map(s => s.subject?.name || s.subject || s.name).join(', ') || 'Multiple Subjects'}
                    {tutor.subjects?.length > 2 && ` +${tutor.subjects.length - 2} more`}
                  </span>
                </div>

                {/* Experience */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FiClock className="mr-2" size={16} />
                  <span>{tutor.experience || 2}+ years experience</span>
                </div>

                {/* Location */}
                {tutor.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiMapPin className="mr-2" size={16} />
                    <span className="truncate">{tutor.location}</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FiDollarSign className="mr-1" size={16} />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tutor.subjects?.[0]?.pricePerHour || tutor.hourlyRate || 200} ETB/hour
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {(tutor.description || tutor.bio) && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                    {tutor.description || tutor.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/tutors/${tutor._id}`}
                    className="flex-1 btn btn-primary btn-sm text-center"
                  >
                    <FiCalendar className="mr-1" size={14} />
                    Book Session
                  </Link>
                  <button 
                    onClick={() => handleQuickMessage(tutor)}
                    className="btn btn-ghost btn-sm"
                    title="Send Message"
                  >
                    <FiMessageSquare size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-ghost"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === page
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
            disabled={currentPage === pagination.pages}
            className="btn btn-ghost"
          >
            Next
          </button>
        </div>
      )}

      {/* Quick Message Modal */}
      {selectedTutor && (
        <QuickMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedTutor(null);
          }}
          tutor={selectedTutor}
          onSuccess={handleMessageSuccess}
        />
      )}
    </div>
  );
};

export default TutorList;
