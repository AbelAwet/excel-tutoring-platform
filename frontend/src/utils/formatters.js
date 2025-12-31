import { format, formatDistance, formatRelative } from 'date-fns';

// Format currency
export const formatCurrency = (amount, currency = 'ETB') => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

// Format time
export const formatTime = (date, formatStr = 'HH:mm') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

// Format date time
export const formatDateTime = (date, formatStr = 'MMM dd, yyyy HH:mm') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

// Format relative date (e.g., "Today at 3:00 PM")
export const formatRelativeDate = (date) => {
  if (!date) return '';
  return formatRelative(new Date(date), new Date());
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return 'U';
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

// Format rating
export const formatRating = (rating) => {
  if (!rating) return '0.0';
  return Number(rating).toFixed(1);
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    completed: 'green',
    cancelled: 'red',
    rejected: 'red',
    paid: 'green',
    failed: 'red',
    refunded: 'gray',
    processing: 'blue',
    verified: 'green',
  };
  return colors[status?.toLowerCase()] || 'gray';
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  const color = getStatusColor(status);
  return `badge badge-${color === 'yellow' ? 'warning' : color === 'green' ? 'success' : color === 'red' ? 'error' : 'primary'}`;
};
