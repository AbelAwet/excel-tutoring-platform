import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiSend, FiSearch, FiMessageCircle, FiUser } from 'react-icons/fi';
import { messageService } from '../../services/messageService';
import useAuthStore from '../../stores/authStore';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TutorMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversationsData, isLoading, error: conversationsError, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: messageService.getConversations,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch messages for selected conversation
  const { data: messagesData, error: messagesError, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.otherUser?._id],
    queryFn: () => messageService.getMessages(selectedConversation.otherUser._id),
    enabled: !!selectedConversation,
    retry: 3,
    retryDelay: 1000,
  });

  const conversations = conversationsData?.data?.conversations || [];
  const messages = messagesData?.data?.messages || [];

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messageService.sendMessage({
        receiverId: selectedConversation.otherUser._id,
        content: newMessage.trim()
      });
      setNewMessage('');
      queryClient.invalidateQueries(['messages', selectedConversation.otherUser._id]);
      queryClient.invalidateQueries(['conversations']);
      toast.success('Message sent successfully');
    } catch {
      toast.error('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiMessageCircle className="mx-auto text-red-400 mb-4" size={48} />
          <p className="text-red-600 dark:text-red-400 mb-2">Failed to load conversations</p>
          <button
            onClick={() => refetchConversations()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-200px)] flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h2>
              <button
                onClick={() => {
                  refetchConversations();
                  toast.success('Refreshing conversations...');
                }}
                className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <FiMessageCircle className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'No conversations match your search' : 'No conversations yet'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {searchTerm ? 'Try a different search term' : 'Students will message you when they book sessions'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherParticipant = conversation.otherUser;
                const isSelected = selectedConversation?.conversationId === conversation.conversationId;
                
                return (
                  <div
                    key={conversation.conversationId}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-r-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={getImageUrl(otherParticipant?.avatar?.url, 'https://via.placeholder.com/40')}
                          alt={otherParticipant?.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => handleImageError(e, 'https://via.placeholder.com/40')}
                        />
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {otherParticipant?.firstName} {otherParticipant?.lastName}
                          </h3>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                            Student
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <img
                    src={getImageUrl(selectedConversation.otherUser?.avatar?.url, 'https://via.placeholder.com/40')}
                    alt={selectedConversation.otherUser?.firstName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    onError={(e) => handleImageError(e, 'https://via.placeholder.com/40')}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {selectedConversation.otherUser?.firstName} {selectedConversation.otherUser?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <FiUser className="mr-1" size={12} />
                      Student
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender._id === user._id;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] md:max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${
                            isOwn
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 md:px-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 md:px-4 md:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <FiMessageCircle className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default TutorMessages;
