import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiStar, FiTrash2, FiEyeOff, FiCheck } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar key={s} size={13} className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
);

const AdminReviews = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reported-reviews'],
    queryFn: adminService.getReportedReviews
  });

  const remove = useMutation({
    mutationFn: (id) => adminService.deleteReview(id),
    onSuccess: () => { toast.success('Review deleted'); qc.invalidateQueries(['admin-reported-reviews']); }
  });
  const unpublish = useMutation({
    mutationFn: (id) => adminService.unpublishReview(id),
    onSuccess: () => { toast.success('Review unpublished'); qc.invalidateQueries(['admin-reported-reviews']); }
  });
  const dismiss = useMutation({
    mutationFn: (id) => adminService.dismissReviewReport(id),
    onSuccess: () => { toast.success('Report dismissed'); qc.invalidateQueries(['admin-reported-reviews']); }
  });

  const reviews = data?.data?.reviews || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Moderation</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Reported reviews awaiting moderation</p>
      </div>

      {isLoading ? (
        <div className="card text-center py-8 text-gray-500">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="card text-center py-12">
          <FiCheck size={40} className="mx-auto text-green-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No reported reviews</p>
          <p className="text-sm text-gray-500 mt-1">All clear!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card border-l-4 border-red-400">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <StarRating rating={r.rating} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      by <strong>{r.student?.firstName} {r.student?.lastName}</strong>
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      for <strong>{r.tutor?.user?.firstName} {r.tutor?.user?.lastName}</strong>
                    </span>
                    <span className="text-xs text-gray-400">{format(new Date(r.createdAt), 'MMM dd, yyyy')}</span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3">{r.comment}</p>

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Report reason:</p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">{r.reportReason || 'No reason provided'}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => dismiss.mutate(r._id)}
                    disabled={dismiss.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    title="Dismiss report — keep review published"
                  >
                    <FiCheck size={14} /> Dismiss
                  </button>
                  <button
                    onClick={() => unpublish.mutate(r._id)}
                    disabled={unpublish.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 disabled:opacity-50"
                    title="Hide review from public"
                  >
                    <FiEyeOff size={14} /> Unpublish
                  </button>
                  <button
                    onClick={() => remove.mutate(r._id)}
                    disabled={remove.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    title="Permanently delete review"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
