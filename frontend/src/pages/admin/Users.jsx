import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiUserX, FiUserCheck, FiTrash2, FiUser } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLES = ['all', 'student', 'tutor', 'admin'];

const AdminUsers = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type, user }
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role, page],
    queryFn: () =>
      adminService.getAllUsers({ search: search || undefined, role: role === 'all' ? undefined : role, page, limit: 20 }),
    keepPreviousData: true
  });

  const suspend = useMutation({
    mutationFn: ({ id, reason }) => adminService.suspendUser(id, reason),
    onSuccess: () => { toast.success('User suspended'); qc.invalidateQueries(['admin-users']); setModal(null); setReason(''); }
  });
  const unsuspend = useMutation({
    mutationFn: (id) => adminService.unsuspendUser(id),
    onSuccess: () => { toast.success('User unsuspended'); qc.invalidateQueries(['admin-users']); setModal(null); }
  });
  const remove = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries(['admin-users']); setModal(null); }
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  const roleBadge = (r) => {
    const map = { admin: 'bg-purple-100 text-purple-700', tutor: 'bg-blue-100 text-blue-700', student: 'bg-green-100 text-green-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[r] || 'bg-gray-100 text-gray-600'}`}>{r}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
        >
          {ROLES.map((r) => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar?.url ? (
                        <img src={u.avatar.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <FiUser className="text-primary-600" size={14} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{roleBadge(u.role)}</td>
                  <td className="px-4 py-3">
                    {u.isSuspended ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Suspended</span>
                    ) : u.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u.isSuspended ? (
                        <button onClick={() => setModal({ type: 'unsuspend', user: u })} className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" title="Unsuspend">
                          <FiUserCheck size={16} />
                        </button>
                      ) : (
                        <button onClick={() => setModal({ type: 'suspend', user: u })} className="p-1.5 rounded text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" title="Suspend">
                          <FiUserX size={16} />
                        </button>
                      )}
                      <button onClick={() => setModal({ type: 'delete', user: u })} className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Deactivate">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} users)</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            {modal.type === 'suspend' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Suspend User</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Suspending <strong>{modal.user.firstName} {modal.user.lastName}</strong>. Provide a reason:</p>
                <textarea className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4" rows={3} placeholder="Reason for suspension..." value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => { setModal(null); setReason(''); }} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                  <button onClick={() => suspend.mutate({ id: modal.user._id, reason })} disabled={suspend.isPending} className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50">Suspend</button>
                </div>
              </>
            )}
            {modal.type === 'unsuspend' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unsuspend User</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Restore access for <strong>{modal.user.firstName} {modal.user.lastName}</strong>?</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                  <button onClick={() => unsuspend.mutate(modal.user._id)} disabled={unsuspend.isPending} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Unsuspend</button>
                </div>
              </>
            )}
            {modal.type === 'delete' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Deactivate User</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Deactivate <strong>{modal.user.firstName} {modal.user.lastName}</strong>? Their data will be preserved.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                  <button onClick={() => remove.mutate(modal.user._id)} disabled={remove.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Deactivate</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
