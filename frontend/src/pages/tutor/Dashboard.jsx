import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, FiUsers, FiCalendar, FiStar, FiTrendingUp
} from 'react-icons/fi';
import { tutorService } from '../../services/tutorService';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
              <FiTrendingUp className="mr-1" size={14} />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
};

const TutorDashboard = () => {
  // Check if tutor profile exists
  const { data: tutorProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['tutor-profile'],
    queryFn: tutorService.getMyProfile,
    retry: false
  });

  const { data: statsData } = useQuery({
    queryKey: ['tutor-stats'],
    queryFn: tutorService.getStats,
    enabled: !!tutorProfile?.data?.tutor, // Only fetch stats if profile exists
  });

  const stats = statsData?.data?.stats || {};
  const recentBookings = statsData?.data?.recentBookings || [];
  const reviews = statsData?.data?.reviews || [];

  // If no tutor profile exists, show application prompt
  if (profileError && profileError.response?.status === 404) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
          <FiUsers className="mx-auto text-blue-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">
            Complete Your Tutor Profile
          </h2>
          <p className="text-blue-600 dark:text-blue-300 mb-6">
            Welcome! To start tutoring, complete your profile by adding your subjects, 
            setting your rates, and providing your background information.
          </p>
          <Link
            to="/tutor/apply"
            className="btn btn-primary inline-flex items-center"
          >
            <FiCalendar className="mr-2" size={16} />
            Complete Profile
          </Link>
          <p className="text-sm text-blue-500 dark:text-blue-400 mt-4">
            Once completed, you'll be immediately listed and able to receive bookings from students!
          </p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tutor Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your performance and manage your sessions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value={`${stats.totalEarnings || 0} ETB`}
          icon={FiDollarSign}
          color="green"
          trend="+12% this month"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={FiUsers}
          color="blue"
        />
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions || 0}
          icon={FiCalendar}
          color="primary"
        />
        <StatCard
          title="Average Rating"
          value={stats.rating?.average?.toFixed(1) || '0.0'}
          icon={FiStar}
          color="yellow"
        />
      </div>

      {/* Booking Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Booking Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.bookingStats?.map((stat) => (
            <div key={stat._id} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.count}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">
                {stat._id}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Bookings
            </h2>
            <Link
              to="/tutor/bookings"
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
            >
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="mx-auto text-gray-400 dark:text-gray-600 mb-2" size={40} />
              <p className="text-gray-600 dark:text-gray-400">
                No recent bookings
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={booking.student?.avatar?.url || 'https://via.placeholder.com/40'}
                      alt={booking.student?.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {booking.student?.firstName} {booking.student?.lastName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {booking.subject?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(booking.sessionDate), 'MMM dd')}
                    </p>
                    <span className={`badge badge-${booking.status === 'confirmed' ? 'primary' : 'warning'} text-xs`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Reviews
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <FiStar className="mx-auto text-gray-400 dark:text-gray-600 mb-2" size={40} />
              <p className="text-gray-600 dark:text-gray-400">
                No reviews yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={review.student?.avatar?.url || 'https://via.placeholder.com/32'}
                        alt={review.student?.firstName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {review.student?.firstName} {review.student?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FiStar className="text-yellow-500 fill-current mr-1" size={16} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/tutor/bookings"
          className="card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
              <FiCalendar className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Bookings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage sessions
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/tutor/profile"
          className="card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Update Profile
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Edit your information
              </p>
            </div>
          </div>
        </Link>

        <div className="card bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">This Month</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalEarnings || 0} ETB
              </p>
            </div>
            <FiDollarSign size={32} className="opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
