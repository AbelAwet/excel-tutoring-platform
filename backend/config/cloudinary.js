import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file, folder = 'excel-tutoring') => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary not configured, using local file storage');
      
      // Use the actual uploaded file name from multer
      const fileName = file.filename;
      // Create full URL for local storage
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const localUrl = `${baseUrl}/uploads/${fileName}`;
      
      return {
        url: localUrl,
        publicId: fileName
      };
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Fallback to local storage using actual file name
    const fileName = file.filename || `${Date.now()}-${file.originalname}`;
    // Create full URL for local storage
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const localUrl = `${baseUrl}/uploads/${fileName}`;
    
    return {
      url: localUrl,
      publicId: fileName
    };
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

export default cloudinary;
