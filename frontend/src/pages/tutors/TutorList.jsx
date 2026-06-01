import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiStar, FiBook, FiDollarSign, FiUser, FiMessageSquare, FiCalendar, FiX, FiSend } from 'react-icons/fi';
import { tutorService } from '../../services/tutorService';
import { messageService } from '../../services/messageService';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const TutorList = () => {
  const [search, setSearch] = useState('');
  const [msgModal, setMsgModal] = useState(null); // tutor object
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['tutors', search],
    queryFn: () => tutorService.getAllTutors({ search: search || undefined }),
  });

  const tutors = data?.data?.tutors || [];

  const handleMessage = (tutor) => {
    if (!isAuthenticated) {
      toast.error('Please login to send a message');
      navigate('/login');
      return;
    }
    if (user?.role !== 'student') {
      toast.error('Only students can message tutors');
      return;
    }
    setMsgModal(tutor);
    setMsgText('');
  };

  const handleSendMessage = async () => {
    if (!msgText.trim()) {
      toast.error('Please write a message');
      return;
    }
    setSending(true);
    try {
      // Create or get conversation
      await messageService.createConversation(msgModal.user._id);
      // Send the message
      await messageService.sendMessage({
        receiverId: msgModal.user._id,
        content: msgText.trim()
      });
      toast.success('Message sent!');
      setMsgModal(null);
      setMsgText('');
      // Navigate to messages
      navigate('/student/messages');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-semibold">Failed to load tutors</p>
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find a Tutor</h1>
        <p className="text-gray-600 dark:text-gray-400">Browse qualified tutors and book a session</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} found
      </p>

      {/* Tutors Grid */}
      {tutors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <FiUser className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tutors found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {search ? 'Try a different search term' : 'No verified tutors are available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl transition-shadow flex flex-col">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={tutor.user?.avatar?.url || `https://ui-avatars.com/api/?name=${tutor.user?.firstName}+${tutor.user?.lastName}&background=3b82f6&color=fff`}
                  alt={tutor.user?.firstName}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${tutor.user?.firstName || 'T'}&background=3b82f6&color=fff`; }}
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {tutor.user?.firstName} {tutor.user?.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {tutor.headline || 'Professional Tutor'}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tutor.rating?.average?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-gray-400">({tutor.rating?.count || 0})</span>
              </div>

              {/* Subjects */}
              {tutor.subjects?.length > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <FiBook size={13} className="text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {tutor.subjects.slice(0, 2).map(s => s.subject?.name || 'Subject').join(', ')}
                    {tutor.subjects.length > 2 && ` +${tutor.subjects.length - 2}`}
                  </span>
                </div>
              )}

              {/* Price */}
              {tutor.subjects?.[0]?.pricePerHour && (
                <div className="flex items-center gap-1 mb-3">
                  <FiDollarSign size={13} className="text-green-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tutor.subjects[0].pricePerHour} ETB/hr
                  </span>
                </div>
              )}

              {/* Status */}
              <div className="mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  tutor.isAvailable
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {tutor.isAvailable ? '● Available' : '● Busy'}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-2">
                <Link
                  to={`/tutors/${tutor._id}`}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl font-medium transition-colors text-sm"
                >
                  <FiCalendar size={14} />
                  Book
                </Link>
                <button
                  onClick={() => handleMessage(tutor)}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-xl font-medium transition-colors text-sm"
                >
                  <FiMessageSquare size={14} />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {msgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={msgModal.user?.avatar?.url || `https://ui-avatars.com/api/?name=${msgModal.user?.firstName}&background=3b82f6&color=fff`}
                  alt={msgModal.user?.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${msgModal.user?.firstName || 'T'}&background=3b82f6&color=fff`; }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Message {msgModal.user?.firstName} {msgModal.user?.lastName}
                  </h3>
                  <p className="text-xs text-gray-500">{msgModal.headline || 'Tutor'}</p>
                </div>
              </div>
              <button
                onClick={() => setMsgModal(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Quick templates */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Quick messages:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Hi! I'd like to book a session with you.",
                  "Are you available this week?",
                  "Can you help me with my studies?"
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setMsgText(t)}
                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Message input */}
            <div className="p-5">
              <textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setMsgModal(null)}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !msgText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <FiSend size={16} />
                  )}
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorList;
