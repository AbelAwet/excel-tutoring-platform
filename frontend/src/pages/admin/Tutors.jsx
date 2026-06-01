import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheckCircle, FiXCircle, FiStar, FiBook } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_TABS = ['all', 'pending', 'verified', 'rejected'];

const AdminTutors = () => {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tutors', status, page],
    queryFn: () => adminService.getAllTutors({ verificationStatus: status === 'all' ? undefined : status, page, limit: 20 }),
    keepPreviousData: true
  });

  const verify = useMutation({
    mutationFn: ({ id, notes }) => adminService.verifyTutor(id, notes),
    onSuccess: () => { toast.success('Tutor verified'); qc.invalidateQueries(['admin-tutors']); setModal(null); setNotes(''); }
  });
  const reject = useMutation({
    mutationFn: ({ id, notes }) => adminService.rejectTutor(id, notes),
    onSuccess: () => { toast.success('Tutor rejected'); qc.invalidateQueries(['admin-tutors']); setModal(null); setNotes(''); }
  });

  const tutors = data?.data?.tutors || [];
  const pagination = data?.data?.pagination || {};

  const statusBadge = (s) => {
    const map = { verified: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tutor Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setStatus(t); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${status === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="card text-center py-8 text-gray-500">Loading...</div>
        ) : tutors.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">No tutors found</div>
        ) : tutors.map((tutor) => (
          <div key={tutor._id} className="card">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {tutor.user?.avatar?.url ? (
                  <img src={tutor.user.avatar.url} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-lg">
                    {tutor.user?.firstName?.[0]}{tutor.user?.lastName?.[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{tutor.user?.firstName} {tutor.user?.lastName}</h3>
                  {statusBadge(tutor.verificationStatus)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tutor.user?.email}</p>
                {tutor.headline && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{tutor.headline}</p>}

                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><FiBook size={13} /> {tutor.subjects?.length || 0} subjects</span>
                  <span className="flex items-center gap-1"><FiStar size={13} /> {tutor.rating?.average?.toFixed(1) || '0.0'} ({tutor.rating?.count || 0} reviews)</span>
                  <span>Joined {format(new Date(tutor.createdAt), 'MMM dd, yyyy')}</span>
                </div>

                {tutor.subjects?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tutor.subjects.slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                        {s.subject?.name || 'Subject'} — {s.pricePerHour} ETB/hr
                      </span>
                    ))}
                  </div>
                )}

                {tutor.verificationNotes && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">Notes: {tutor.verificationNotes}</p>
                )}
              </div>

              {/* Actions */}
              {tutor.verificationStatus === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setModal({ type: 'verify', tutor })}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FiCheckCircle size={14} /> Verify
                  </button>
                  <button
                    onClick={() => setModal({ type: 'reject', tutor })}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <FiXCircle size={14} /> Reject
                  </button>
                </div>
              )}
              {tutor.verificationStatus === 'verified' && (
                <button
                  onClick={() => setModal({ type: 'reject', tutor })}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                >
                  <FiXCircle size={14} /> Revoke
                </button>
              )}
              {tutor.verificationStatus === 'rejected' && (
                <button
                  onClick={() => setModal({ type: 'verify', tutor })}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-green-300 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 flex-shrink-0"
                >
                  <FiCheckCircle size={14} /> Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
            <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {modal.type === 'verify' ? 'Verify Tutor' : 'Reject Tutor'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {modal.type === 'verify' ? 'Approve' : 'Reject'} <strong>{modal.tutor.user?.firstName} {modal.tutor.user?.lastName}</strong>?
            </p>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              rows={3}
              placeholder={modal.type === 'verify' ? 'Optional notes...' : 'Reason for rejection...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setModal(null); setNotes(''); }} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              {modal.type === 'verify' ? (
                <button onClick={() => verify.mutate({ id: modal.tutor._id, notes })} disabled={verify.isPending} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Verify</button>
              ) : (
                <button onClick={() => reject.mutate({ id: modal.tutor._id, notes })} disabled={reject.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Reject</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTutors;
