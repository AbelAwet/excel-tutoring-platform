import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, FiMessageSquare, FiStar, FiClock,
  FiCheckCircle, FiXCircle, FiArrowRight
} from 'react-icons/fi';
import { bookingService } from '../../services/bookingService';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/50',
    green: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/50',
    blue: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/50',
    yellow: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/50',
    purple: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/50',
  };

  return (
    <div className="card-gradient hover-lift transition-all-smooth">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
          <p className="text-4xl font-bold gradient-text mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-lg ${colorClasses[color]}`}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { data: bookingsData } = useQuery({
    queryKey: ['student-bookings'],
    queryFn: () => bookingService.getUserBookings({ limit: 5 }),
  });

  const bookings = bookingsData?.data?.bookings || [];

  // Calculate stats
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-warning',
      confirmed: 'badge badge-primary',
      completed: 'badge badge-success',
      cancelled: 'badge badge-error',
      rejected: 'badge badge-error',
    };
    return badges[status] || 'badge';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FiClock,
      confirmed: FiCheckCircle,
      completed: FiCheckCircle,
      cancelled: FiXCircle,
      rejected: FiXCircle,
    };
    return icons[status] || FiClock;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome Back!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Here's what's happening with your learning journey ✨
          </p>
        </div>
        <Link
          to="/tutors"
          className="btn btn-primary glow-blue"
        >
          <FiCalendar className="mr-2" />
          Find Tutors
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.total}
          icon={FiCalendar}
          color="purple"
        />
        <StatCard
          title="Upcoming Sessions"
          value={stats.upcoming}
          icon={FiClock}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={FiCheckCircle}
          color="green"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={FiClock}
          color="yellow"
        />
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Bookings
          </h2>
          <Link
            to="/student/bookings"
            className="text-primary-600 dark:text-primary-400 hover:underline flex items-center text-sm"
          >
            View All
            <FiArrowRight className="ml-1" size={16} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No bookings yet
            </p>
            <Link to="/tutors" className="btn btn-primary">
              Browse Tutors
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status);
              
              return (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <img
                      src={booking.tutor?.user?.avatar?.url || 'https://via.placeholder.com/48'}
                      alt={booking.tutor?.user?.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {booking.tutor?.user?.firstName} {booking.tutor?.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.subject?.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {format(new Date(booking.sessionDate), 'MMM dd, yyyy')} • {booking.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(booking.status)}>
                      <StatusIcon className="mr-1" size={14} />
                      {booking.status}
                    </span>
                    <Link
                      to={`/student/bookings`}
                      className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/tutors"
          className="card-gradient hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <FiCalendar className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold gradient-text-blue">
                Book a Session
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find and book qualified tutors
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/student/messages"
          className="card-gradient hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group border-2 border-transparent hover:border-purple-500"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all">
              <FiMessageSquare className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold gradient-text-purple">
                Messages
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chat with your tutors
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
