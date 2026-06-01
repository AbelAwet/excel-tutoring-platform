import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiEye, FiDollarSign } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_TABS = ['all', 'under_review', 'completed', 'failed', 'refunded'];

const AdminPayments = () => {
  const qc = useQueryClient();
  const [status, setStatus] = useState('under_review');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', status, page],
    queryFn: () => adminService.getAllPayments({ status: status === 'all' ? undefined : status, page, limit: 20 }),
    keepPreviousData: true
  });

  const approve = useMutation({
    mutationFn: ({ id, notes }) => adminService.approvePayment(id, notes),
    onSuccess: () => { toast.success('Payment approved'); qc.invalidateQueries(['admin-payments']); qc.invalidateQueries(['admin-stats']); setModal(null); setReason(''); }
  });
  const reject = useMutation({
    mutationFn: ({ id, reason }) => adminService.rejectPayment(id, reason),
    onSuccess: () => { toast.success('Payment rejected'); qc.invalidateQueries(['admin-payments']); setModal(null); setReason(''); }
  });
  const refund = useMutation({
    mutationFn: ({ id, reason }) => adminService.processRefund(id, reason),
    onSuccess: () => { toast.success('Refund processed'); qc.invalidateQueries(['admin-payments']); setModal(null); setReason(''); }
  });

  const payments = data?.data?.payments || [];
  const pagination = data?.data?.pagination || {};

  const statusBadge = (s) => {
    const map = {
      completed: 'bg-green-100 text-green-700',
      under_review: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-blue-100 text-blue-700',
      pending: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s.replace('_', ' ')}</span>;
  };

  const methodLabel = (m) => ({ bank_transfer: 'Bank Transfer', cash: 'Cash', other: 'Other' }[m] || m);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setStatus(t); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${status === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t === 'under_review' ? 'Pending Review' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No payments found</td></tr>
              ) : payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{p.user?.firstName} {p.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{p.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{p.amount} ETB</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{methodLabel(p.paymentMethod)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{p.referenceNumber || '—'}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{format(new Date(p.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {p.proofOfPayment?.url && (
                        <a href={p.proofOfPayment.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="View proof">
                          <FiEye size={15} />
                        </a>
                      )}
                      {p.status === 'under_review' && (
                        <>
                          <button onClick={() => setModal({ type: 'approve', payment: p })} className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" title="Approve">
                            <FiCheckCircle size={15} />
                          </button>
                          <button onClick={() => setModal({ type: 'reject', payment: p })} className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject">
                            <FiXCircle size={15} />
                          </button>
                        </>
                      )}
                      {p.status === 'completed' && (
                        <button onClick={() => setModal({ type: 'refund', payment: p })} className="p-1.5 rounded text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" title="Refund">
                          <FiRefreshCw size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${modal.type === 'approve' ? 'bg-green-100 text-green-600' : modal.type === 'refund' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                {modal.type === 'approve' ? <FiCheckCircle size={20} /> : modal.type === 'refund' ? <FiRefreshCw size={20} /> : <FiXCircle size={20} />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modal.type === 'approve' ? 'Approve Payment' : modal.type === 'refund' ? 'Process Refund' : 'Reject Payment'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              Amount: <strong>{modal.payment.amount} ETB</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Student: <strong>{modal.payment.user?.firstName} {modal.payment.user?.lastName}</strong>
            </p>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              rows={3}
              placeholder={modal.type === 'approve' ? 'Optional notes...' : 'Reason...'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setModal(null); setReason(''); }} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              {modal.type === 'approve' && (
                <button onClick={() => approve.mutate({ id: modal.payment._id, notes: reason })} disabled={approve.isPending} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Approve</button>
              )}
              {modal.type === 'reject' && (
                <button onClick={() => reject.mutate({ id: modal.payment._id, reason })} disabled={reject.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Reject</button>
              )}
              {modal.type === 'refund' && (
                <button onClick={() => refund.mutate({ id: modal.payment._id, reason })} disabled={refund.isPending} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">Refund</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
