import { useState } from 'react';
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi';
import { messageService } from '../services/messageService';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import toast from 'react-hot-toast';

const QuickMessageModal = ({ isOpen, onClose, tutor, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create conversation first
      const conversationResponse = await messageService.createConversation(tutor.user._id);
      
      if (conversationResponse.data.success) {
        // Send the message
        await messageService.sendMessage({
          receiverId: tutor.user._id,
          content: message.trim()
        });
        
        toast.success('Message sent successfully!');
        setMessage('');
        onClose();
        
        if (onSuccess) {
          onSuccess(conversationResponse.data.data.conversation._id);
        }
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FiMessageSquare className="text-[#3b82f6]" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Send Message
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Tutor Info */}
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <img
              src={getImageUrl(tutor.user?.avatar?.url, 'https://via.placeholder.com/40')}
              alt={tutor.user?.firstName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => handleImageError(e, 'https://via.placeholder.com/40')}
            />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {tutor.user?.firstName} {tutor.user?.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tutor.title || 'Professional Tutor'}
              </p>
            </div>
          </div>

          {/* Message Form */}
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Hi! I'm interested in your tutoring services..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <FiSend className="mr-2" size={16} />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Templates */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick templates:</p>
            <div className="space-y-1">
              {[
                "Hi! I'm interested in your tutoring services. When are you available?",
                "Hello! Could you help me with [subject]? I'd like to book a session.",
                "Hi! What's your availability for this week? I need help with my studies."
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(template)}
                  className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-[#3b82f6] dark:hover:text-[#3b82f6] p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  "{template}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMessageModal;