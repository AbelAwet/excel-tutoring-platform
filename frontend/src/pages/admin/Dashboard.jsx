import { useQuery } from '@tanstack/react-query';
import { 
  FiUsers, FiDollarSign, FiCalendar, FiTrendingUp,
  FiUserCheck, FiClock, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { adminService } from '../../services/adminService';
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
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
              <FiTrendingUp className="mr-1" size={14} />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const statsData = stats?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of platform statistics and activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={statsData.users?.total || 0}
          icon={FiUsers}
          color="primary"
        />
        <StatCard
          title="Total Revenue"
          value={`${statsData.payments?.totalRevenue || 0} ETB`}
          icon={FiDollarSign}
          color="green"
        />
        <StatCard
          title="Total Bookings"
          value={statsData.bookings?.total || 0}
          icon={FiCalendar}
          color="blue"
        />
        <StatCard
          title="Pending Tutors"
          value={statsData.users?.pendingTutors || 0}
          icon={FiUserCheck}
          color="yellow"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Students
            </h3>
            <FiUsers className="text-primary-600 dark:text-primary-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {statsData.users?.students || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Verified Tutors
            </h3>
            <FiUserCheck className="text-green-600 dark:text-green-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {statsData.users?.tutors || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Completed Bookings
            </h3>
            <FiCheckCircle className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {statsData.bookings?.completed || 0}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Log */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {statsData.recentActivity?.slice(0, 5).map((activity) => (
              <div
                key={activity._id}
                className="flex items-start space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                    <FiClock className="text-primary-600 dark:text-primary-400" size={16} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.user?.firstName} {activity.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Revenue (Last 6 Months)
          </h3>
          <div className="space-y-3">
            {statsData.monthlyRevenue?.map((month) => (
              <div key={`${month._id.year}-${month._id.month}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(month._id.year, month._id.month - 1), 'MMM yyyy')}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {month.revenue} ETB
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((month.revenue / Math.max(...(statsData.monthlyRevenue?.map(m => m.revenue) || [1]))) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Payment Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Completed Payments
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {statsData.payments?.completedPayments || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Failed Payments
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {statsData.payments?.failedPayments || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Success Rate
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {statsData.payments?.completedPayments && statsData.payments?.failedPayments
                ? Math.round(
                    (statsData.payments.completedPayments /
                      (statsData.payments.completedPayments + statsData.payments.failedPayments)) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
