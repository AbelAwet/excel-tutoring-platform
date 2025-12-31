import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiClock, FiUser, FiMapPin, FiDollarSign,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiEye, FiMessageSquare,
  FiStar, FiFilter, FiPlus, FiVideo
} from 'react-icons/fi';
import { bookingService } from '../../services/bookingService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StudentBookings = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['student-bookings', statusFilter, currentPage],
    queryFn: () => bookingService.getUserBookings({
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: currentPage,
      limit: 10
    }),
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['student-bookings']);
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    },
  });

  const bookings = bookingsData?.data?.bookings || [];
  const pagination = bookingsData?.data?.pagination || {};

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: FiClock, text: 'Pending' },
      confirmed: { class: 'badge-primary', icon: FiCheckCircle, text: 'Confirmed' },
      completed: { class: 'badge-success', icon: FiCheckCircle, text: 'Completed' },
      cancelled: { class: 'badge-error', icon: FiXCircle, text: 'Cancelled' },
      rejected: { class: 'badge-error', icon: FiXCircle, text: 'Rejected' },
    };
    return badges[status] || { class: 'badge', icon: FiAlertCircle, text: status };
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const canCancelBooking = (booking) => {
    return ['pending', 'confirmed'].includes(booking.status) && 
           new Date(booking.sessionDate) > new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tutoring sessions
          </p>
        </div>
        <Link to="/tutors" className="btn btn-primary inline-flex items-center gap-2">
          <FiPlus size={16} />
          Book New Session
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-2 px-3 text-sm"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {pagination.total || 0} total bookings
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <FiCalendar className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {statusFilter === 'all' 
              ? "You haven't booked any sessions yet"
              : `No ${statusFilter} bookings found`
            }
          </p>
          <Link to="/tutors" className="btn btn-primary">
            Browse Tutors
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status);
            const StatusIcon = statusBadge.icon;
            
            return (
              <div key={booking._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Tutor Avatar */}
                      <img
                        src={booking.tutor?.user?.avatar?.url || 'https://via.placeholder.com/60'}
                        alt={booking.tutor?.user?.firstName}
                        className="w-15 h-15 rounded-full object-cover"
                      />
                      
                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {booking.tutor?.user?.firstName} {booking.tutor?.user?.lastName}
                          </h3>
                          <span className={`badge ${statusBadge.class} inline-flex items-center gap-1`}>
                            <StatusIcon size={14} />
                            {statusBadge.text}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiUser className="mr-2" size={16} />
                            {booking.subject?.name}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiCalendar className="mr-2" size={16} />
                            {format(new Date(booking.sessionDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiClock className="mr-2" size={16} />
                            {booking.startTime} - {booking.endTime}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiDollarSign className="mr-2" size={16} />
                            {booking.totalAmount} ETB
                          </div>
                        </div>

                        {booking.sessionType === 'in-person' && booking.location && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400 mt-2 text-sm">
                            <FiMapPin className="mr-2" size={16} />
                            {booking.location}
                          </div>
                        )}

                        {booking.notes && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className="btn btn-ghost btn-sm inline-flex items-center gap-1"
                      title="View Details"
                    >
                      <FiEye size={14} />
                      View
                    </button>
                    
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => navigate(`/video-session/${booking._id}`)}
                          className="btn btn-primary btn-sm inline-flex items-center gap-1"
                          title="Join Video Call"
                        >
                          <FiVideo size={14} />
                          Join Call
                        </button>
                        <button
                          className="btn btn-ghost btn-sm inline-flex items-center gap-1"
                          title="Message Tutor"
                        >
                          <FiMessageSquare size={14} />
                          Message
                        </button>
                      </>
                    )}

                    {booking.status === 'completed' && !booking.review && (
                      <button
                        className="btn btn-ghost btn-sm inline-flex items-center gap-1"
                        title="Leave Review"
                      >
                        <FiStar size={14} />
                        Review
                      </button>
                    )}

                    {canCancelBooking(booking) && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelBookingMutation.isPending}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                        title="Cancel Booking"
                      >
                        <FiXCircle size={14} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-ghost btn-sm"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
            disabled={currentPage === pagination.pages}
            className="btn btn-ghost btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentBookings;
