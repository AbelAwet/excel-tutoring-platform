import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: { user: user.getPublicProfile() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get user profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'bio', 'address', 'preferences'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: { user: user.getPublicProfile() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

// @desc    Upload avatar
// @route   POST /api/v1/users/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar?.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await deleteFromCloudinary(user.avatar.publicId);
      } catch {
        // Non-fatal — old avatar cleanup failure shouldn't block upload
      }
    }

    const result = await uploadToCloudinary(req.file, 'avatars');
    user.avatar = { url: result.url, publicId: result.publicId };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: user.avatar, user: user.getPublicProfile() }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to upload avatar' });
  }
};

// @desc    Change password
// @route   PUT /api/v1/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to change password' });
  }
};

// @desc    Deactivate account
// @route   DELETE /api/v1/users/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = false;
    await user.save();
    res.status(200).json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete account' });
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: { user: user.getPublicProfile() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get user' });
  }
};
