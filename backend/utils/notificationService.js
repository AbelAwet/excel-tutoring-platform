import Notification from '../models/Notification.js';

// Create notification
export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Emit socket event if io is available
    if (global.io) {
      global.io.to(data.recipient.toString()).emit('notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send booking notification
export const sendBookingNotification = async (recipientId, senderId, type, bookingData) => {
  const notificationMessages = {
    booking_request: {
      title: 'New Booking Request',
      message: `You have a new booking request for ${bookingData.subject}`
    },
    booking_confirmed: {
      title: 'Booking Confirmed',
      message: `Your booking for ${bookingData.subject} has been confirmed`
    },
    booking_cancelled: {
      title: 'Booking Cancelled',
      message: `A booking for ${bookingData.subject} has been cancelled`
    },
    booking_completed: {
      title: 'Session Completed',
      message: `Your tutoring session for ${bookingData.subject} is complete`
    }
  };

  const { title, message } = notificationMessages[type];

  return await createNotification({
    recipient: recipientId,
    sender: senderId,
    type,
    title,
    message,
    link: `/bookings/${bookingData.bookingId}`,
    data: bookingData
  });
};

// Send payment notification
export const sendPaymentNotification = async (recipientId, type, paymentData) => {
  const notificationMessages = {
    payment_received: {
      title: 'Payment Approved',
      message: `Your payment of ${paymentData.amount} ETB has been approved`
    },
    payment_failed: {
      title: 'Payment Rejected',
      message: `Your payment of ${paymentData.amount} ETB was rejected${paymentData.reason ? ': ' + paymentData.reason : '. Please resubmit.'}`
    }
  };

  const { title, message } = notificationMessages[type];

  return await createNotification({
    recipient: recipientId,
    type,
    title,
    message,
    link: `/payments/${paymentData.paymentId}`,
    data: paymentData,
    priority: type === 'payment_failed' ? 'high' : 'medium'
  });
};

// Send message notification
export const sendMessageNotification = async (recipientId, senderId, senderName) => {
  return await createNotification({
    recipient: recipientId,
    sender: senderId,
    type: 'new_message',
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    link: `/messages/${senderId}`
  });
};

// Send review notification
export const sendReviewNotification = async (tutorId, studentId, studentName, rating) => {
  return await createNotification({
    recipient: tutorId,
    sender: studentId,
    type: 'new_review',
    title: 'New Review',
    message: `${studentName} left you a ${rating}-star review`,
    link: `/reviews`
  });
};

// Send tutor verification notification
export const sendTutorVerificationNotification = async (tutorId, status, notes) => {
  const messages = {
    verified: {
      title: 'Tutor Application Approved',
      message: 'Congratulations! Your tutor application has been approved'
    },
    rejected: {
      title: 'Tutor Application Rejected',
      message: notes || 'Your tutor application has been rejected. Please contact support for more information'
    }
  };

  const { title, message } = messages[status];

  return await createNotification({
    recipient: tutorId,
    type: status === 'verified' ? 'tutor_verified' : 'tutor_rejected',
    title,
    message,
    link: '/tutor/profile',
    priority: 'high'
  });
};

// Send system announcement
export const sendSystemAnnouncement = async (recipientIds, title, message) => {
  const notifications = recipientIds.map(recipientId => ({
    recipient: recipientId,
    type: 'system_announcement',
    title,
    message,
    priority: 'high'
  }));

  return await Notification.insertMany(notifications);
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Delete old notifications (cleanup job)
export const deleteOldNotifications = async (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};
