import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { format } from 'date-fns';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

const AdminBookings = () => {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', status, page],
    queryFn: () => adminService.getAllBookings({ status: status === 'all' ? undefined : status, page, limit: 20 }),
    keepPreviousData: true
  });

  const bookings = data?.data?.bookings || [];
  const pagination = data?.data?.pagination || {};

  const statusBadge = (s) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-600',
      rejected: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
  };

  const paymentBadge = (s) => {
    const map = { paid: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', refunded: 'bg-blue-100 text-blue-700', failed: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setStatus(t); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${status === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Tutor</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Session</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No bookings found</td></tr>
              ) : bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FiUser size={13} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{b.student?.firstName} {b.student?.lastName}</p>
                        <p className="text-xs text-gray-500">{b.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 dark:text-white">{b.tutor?.user?.firstName} {b.tutor?.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{b.tutor?.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.subject?.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <FiCalendar size={12} />
                      <span>{format(new Date(b.sessionDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <FiClock size={11} />
                      <span>{b.startTime} – {b.endTime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.totalAmount} ETB</td>
                  <td className="px-4 py-3">{statusBadge(b.status)}</td>
                  <td className="px-4 py-3">{paymentBadge(b.paymentStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} bookings)</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
