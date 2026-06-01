import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiCalendar, FiClock, FiUser, FiDollarSign, FiCheck, FiX, 
  FiFilter, FiSearch, FiEye, FiMessageCircle, FiStar, FiVideo
} from 'react-icons/fi';
import { bookingService } from '../../services/bookingService';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const TutorBookings = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ['tutor-bookings', statusFilter],
    queryFn: () => bookingService.getUserBookings({ status: statusFilter === 'all' ? '' : statusFilter }),
  });

  // Confirm booking mutation
  const confirmMutation = useMutation({
    mutationFn: (bookingId) => bookingService.confirmBooking(bookingId),
    onSuccess: () => {
      toast.success('Booking confirmed successfully');
      queryClient.invalidateQueries(['tutor-bookings']);
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to confirm booking');
    }
  });

  // Reject booking mutation
  const rejectMutation = useMutation({
    mutationFn: ({ bookingId, reason }) => bookingService.rejectBooking(bookingId, reason),
    onSuccess: () => {
      toast.success('Booking rejected');
      queryClient.invalidateQueries(['tutor-bookings']);
      setShowModal(false);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    }
  });

  // Complete booking mutation
  const completeMutation = useMutation({
    mutationFn: (bookingId) => bookingService.completeBooking(bookingId),
    onSuccess: () => {
      toast.success('Booking marked as completed');
      queryClient.invalidateQueries(['tutor-bookings']);
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete booking');
    }
  });

  const bookings = bookingsData?.data?.bookings || [];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleAction = (booking, action) => {
    setSelectedBooking(booking);
    setActionType(action);
    setShowModal(true);
  };

  const executeAction = () => {
    if (!selectedBooking) return;

    switch (actionType) {
      case 'confirm':
        confirmMutation.mutate(selectedBooking._id);
        break;
      case 'reject':
        if (!rejectionReason.trim()) {
          toast.error('Please provide a reason for rejection');
          return;
        }
        rejectMutation.mutate({ 
          bookingId: selectedBooking._id, 
          reason: rejectionReason 
        });
        break;
      case 'complete':
        completeMutation.mutate(selectedBooking._id);
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiCalendar className="mx-auto text-red-400 mb-4" size={48} />
          <p className="text-red-600 dark:text-red-400">Failed to load bookings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Bookings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your tutoring sessions
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="card text-center py-12">
            <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Students will book sessions with you soon'}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={getImageUrl(booking.student?.avatar?.url, 'https://via.placeholder.com/48')}
                    alt={booking.student?.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => handleImageError(e, 'https://via.placeholder.com/48')}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {booking.student?.firstName} {booking.student?.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FiUser className="mr-2" size={14} />
                        {booking.subject?.name}
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" size={14} />
                        {format(parseISO(booking.sessionDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2" size={14} />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="flex items-center">
                        <FiDollarSign className="mr-2" size={14} />
                        {booking.totalAmount || (booking.pricePerHour * booking.duration)} ETB
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(booking, 'confirm')}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Confirm Booking"
                      >
                        <FiCheck size={16} />
                      </button>
                      <button
                        onClick={() => handleAction(booking, 'reject')}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Reject Booking"
                      >
                        <FiX size={16} />
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => navigate(`/video-session/${booking._id}`)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Join Video Call"
                      >
                        <FiVideo size={16} />
                      </button>
                      <button
                        onClick={() => handleAction(booking, 'complete')}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Mark as Completed"
                      >
                        <FiCheck size={16} />
                      </button>
                    </>
                  )}

                  <Link
                    to={`/tutor/messages`}
                    className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                    title="Message Student"
                  >
                    <FiMessageCircle size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {actionType === 'confirm' && 'Confirm Booking'}
              {actionType === 'reject' && 'Reject Booking'}
              {actionType === 'complete' && 'Complete Booking'}
            </h3>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                Student: {selectedBooking?.student?.firstName} {selectedBooking?.student?.lastName}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Subject: {selectedBooking?.subject?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Date: {selectedBooking && format(parseISO(selectedBooking.sessionDate), 'MMM dd, yyyy')}
              </p>
            </div>

            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={confirmMutation.isPending || rejectMutation.isPending || completeMutation.isPending}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  actionType === 'confirm' ? 'bg-green-500 hover:bg-green-600' :
                  actionType === 'reject' ? 'bg-red-500 hover:bg-red-600' :
                  'bg-blue-500 hover:bg-blue-600'
                } disabled:opacity-50`}
              >
                {confirmMutation.isPending || rejectMutation.isPending || completeMutation.isPending ? 'Processing...' : 
                 actionType === 'confirm' ? 'Confirm' :
                 actionType === 'reject' ? 'Reject' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorBookings;
