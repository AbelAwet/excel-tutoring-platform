import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiEdit3 } from 'react-icons/fi';
import { userService } from '../../services/userService';
import useAuthStore from '../../stores/authStore';
import { getImageUrl, handleImageError, validateImageFile } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const { user, setAuth, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        country: user?.address?.country || '',
        zipCode: user?.address?.zipCode || ''
      }
    }
  });

  // Fetch user profile
  const { data: profileData } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userService.getProfile,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      // Update the auth store with new user data
      updateUser(data.data.user);
      queryClient.invalidateQueries(['user-profile']);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Reset form with new data
      reset({
        firstName: data.data.user.firstName || '',
        lastName: data.data.user.lastName || '',
        email: data.data.user.email || '',
        phone: data.data.user.phone || '',
        bio: data.data.user.bio || '',
        address: {
          street: data.data.user.address?.street || '',
          city: data.data.user.address?.city || '',
          state: data.data.user.address?.state || '',
          country: data.data.user.address?.country || '',
          zipCode: data.data.user.address?.zipCode || ''
        }
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: (data) => {
      // Update the auth store with new avatar from server
      updateUser({ avatar: data.data.avatar });
      queryClient.invalidateQueries(['user-profile']);
      toast.success('Avatar updated successfully!');
      setAvatarFile(null);
      
      // Force a small delay to ensure the image is accessible and trigger re-render
      setTimeout(() => {
        updateUser({ avatar: data.data.avatar });
      }, 500);
    },
    onError: (error) => {
      updateUser({ avatar: profileData?.data?.user?.avatar || user?.avatar });
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
      setAvatarFile(null);
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Validate file using utility function
        validateImageFile(file);

        setAvatarFile(file);
        
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (event) => {
          // Temporarily update the avatar in auth store for immediate preview
          updateUser({ avatar: { url: event.target.result } });
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('avatar', file);
        uploadAvatarMutation.mutate(formData);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 profile-container">
      {/* Header */}
      <div className="flex items-center justify-between profile-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <FiEdit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="relative inline-block">
              <img
                src={getImageUrl(user?.avatar?.url)}
                alt={user?.firstName}
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                onError={(e) => handleImageError(e)}
              />
              {isEditing && (
                <label className={`absolute bottom-0 right-0 bg-[#3b82f6] text-white p-2 rounded-full cursor-pointer hover:bg-[#2563eb] transition-colors ${uploadAvatarMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploadAvatarMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <FiCamera size={16} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploadAvatarMutation.isPending}
                  />
                </label>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
            <div className="flex items-center justify-center mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {user?.isEmailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      disabled={!isEditing}
                      className="input pl-10"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      disabled={!isEditing}
                      className="input pl-10"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      disabled={true} // Email should not be editable
                      className="input pl-10 bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      {...register('phone')}
                      disabled={!isEditing}
                      className="input pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                {...register('bio')}
                disabled={!isEditing}
                rows={3}
                className="input"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Street Address
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      {...register('address.street')}
                      disabled={!isEditing}
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    {...register('address.city')}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    {...register('address.state')}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    {...register('address.country')}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    {...register('address.zipCode')}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  <FiSave size={16} />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
