import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiBell, FiCheck, FiTrash2, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const StudentNotifications = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  
  const { data: notificationsData, isLoading, refetch } = useNotifications({
    page,
    limit: 20,
    filter: filter !== 'all' ? filter : undefined
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.data?.notifications || [];
  const pagination = notificationsData?.data?.pagination || {};

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotificationMutation.mutate(id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
        return '📅';
      case 'message':
        return '💬';
      case 'payment':
        return '💳';
      case 'review':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'booking_cancelled':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'payment':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'review':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with your latest activities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="btn btn-secondary inline-flex items-center gap-2"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <FiCheck size={16} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <FiFilter className="text-gray-500" size={20} />
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => {
                  setFilter(filterOption.key);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="card text-center py-12">
            <FiBell className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card transition-all duration-200 ${
                !notification.isRead 
                  ? 'border-l-4 border-l-[#3b82f6] bg-blue-50/50 dark:bg-blue-900/10' 
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          disabled={markAsReadMutation.isPending}
                          className="p-2 text-gray-400 hover:text-[#3b82f6] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Mark as read"
                        >
                          <FiCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Delete notification"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;