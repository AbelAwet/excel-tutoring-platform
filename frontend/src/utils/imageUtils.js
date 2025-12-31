// Image utility functions

export const getImageUrl = (imageUrl, fallback = 'https://via.placeholder.com/150') => {
  if (!imageUrl) return fallback;
  
  // If it's already a full URL, return as is (with cache busting for uploaded images)
  if (imageUrl.startsWith('http')) {
    // Add cache busting parameter for uploaded images to ensure they refresh
    if (imageUrl.includes('/uploads/')) {
      const separator = imageUrl.includes('?') ? '&' : '?';
      return `${imageUrl}${separator}t=${Date.now()}`;
    }
    return imageUrl;
  }
  
  // If it's a relative URL, construct the full URL
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  const fullUrl = `${baseUrl}${imageUrl}`;
  
  // Add cache busting parameter for uploaded images
  if (imageUrl.includes('/uploads/')) {
    return `${fullUrl}?t=${Date.now()}`;
  }
  
  return fullUrl;
};

export const handleImageError = (event, fallback = 'https://via.placeholder.com/150') => {
  event.target.src = fallback;
  event.target.onerror = null; // Prevent infinite loop
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please select a valid image file (JPG, JPEG, PNG, or WebP)');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  return true;
};