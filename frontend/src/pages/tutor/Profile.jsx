import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave, FiX, 
  FiCamera, FiBook, FiDollarSign, FiClock, FiStar, FiPlus, FiTrash2
} from 'react-icons/fi';
import { tutorService } from '../../services/tutorService';
import { userService } from '../../services/userService';
import useAuthStore from '../../stores/authStore';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

const TutorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({});
  const [tutorData, setTutorData] = useState({});
  const [newSubject, setNewSubject] = useState({ subject: '', pricePerHour: '' });
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userService.getProfile,
  });

  // Fetch tutor profile
  const { data: tutorProfileData, isLoading: tutorLoading } = useQuery({
    queryKey: ['tutor-profile'],
    queryFn: tutorService.getMyProfile,
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      updateUser(data.data.user);
      queryClient.invalidateQueries(['user-profile']);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Update tutor profile mutation
  const updateTutorMutation = useMutation({
    mutationFn: tutorService.updateProfile,
    onSuccess: () => {
      toast.success('Tutor profile updated successfully');
      queryClient.invalidateQueries(['tutor-profile']);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update tutor profile');
    }
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: (data) => {
      toast.success('Profile picture updated successfully');
      updateUser(data.data.user);
      queryClient.invalidateQueries(['user-profile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    }
  });

  useEffect(() => {
    if (profileData?.data?.user) {
      setFormData(profileData.data.user);
    }
  }, [profileData]);

  useEffect(() => {
    if (tutorProfileData?.data?.tutor) {
      setTutorData(tutorProfileData.data.tutor);
    }
  }, [tutorProfileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === 'personal') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setTutorData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setTutorData(prev => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => i === index ? value : item) || []
    }));
  };

  const addArrayItem = (field, item) => {
    setTutorData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), item]
    }));
  };

  const removeArrayItem = (field, index) => {
    setTutorData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubjectAdd = () => {
    if (newSubject.subject && newSubject.pricePerHour) {
      addArrayItem('subjects', {
        subject: newSubject.subject,
        pricePerHour: parseFloat(newSubject.pricePerHour)
      });
      setNewSubject({ subject: '', pricePerHour: '' });
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      uploadAvatarMutation.mutate(formData);
    }
  };

  const handleSave = () => {
    if (activeTab === 'personal') {
      updateProfileMutation.mutate(formData);
    } else {
      updateTutorMutation.mutate(tutorData);
    }
  };

  const handleCancel = () => {
    if (activeTab === 'personal') {
      setFormData(profileData?.data?.user || {});
    } else {
      setTutorData(tutorProfileData?.data?.tutor || {});
    }
    setIsEditing(false);
  };

  if (profileLoading || tutorLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 profile-container tutor-profile">
      {/* Header */}
      <div className="flex items-center justify-between profile-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your profile and tutoring information
          </p>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX className="mr-2" size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isLoading || updateTutorMutation.isLoading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                <FiSave className="mr-2" size={16} />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <FiEdit3 className="mr-2" size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="card profile-card">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={getImageUrl(user?.avatar?.url, 'https://via.placeholder.com/100')}
              alt={user?.firstName}
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => handleImageError(e, 'https://via.placeholder.com/100')}
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                <FiCamera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Professional Tutor
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <FiStar className="text-yellow-500 mr-1" size={16} />
                <span className="text-gray-900 dark:text-white font-medium">
                  {tutorData?.rating?.average?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  ({tutorData?.rating?.count || 0} reviews)
                </span>
              </div>
              <div className="flex items-center">
                <FiBook className="text-primary-500 mr-1" size={16} />
                <span className="text-gray-900 dark:text-white">
                  {tutorData?.totalSessions || 0} sessions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 tab-navigation">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'personal'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('tutor')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tutor'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Tutor Information
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'personal' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
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
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tutor' && (
        <div className="space-y-6">
          {/* Basic Tutor Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Tutor Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  name="headline"
                  value={tutorData.headline || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., Experienced Math Tutor"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience (years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={tutorData.experience || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={tutorData.description || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Describe your teaching approach and expertise..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Subjects & Pricing
            </h3>
            
            <div className="space-y-4">
              {tutorData.subjects?.map((subject, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={subject.subject?.name || subject.subject}
                      onChange={(e) => handleArrayChange('subjects', index, { ...subject, subject: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Subject name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={subject.pricePerHour}
                        onChange={(e) => handleArrayChange('subjects', index, { ...subject, pricePerHour: parseFloat(e.target.value) })}
                        disabled={!isEditing}
                        placeholder="Price"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeArrayItem('subjects', index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              {isEditing && (
                <div className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newSubject.subject}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Subject name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={newSubject.pricePerHour}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, pricePerHour: e.target.value }))}
                        placeholder="Price"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSubjectAdd}
                    disabled={!newSubject.subject || !newSubject.pricePerHour}
                    className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Education & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Education
              </h3>
              <textarea
                name="education"
                value={tutorData.education || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                placeholder="Your educational background..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
              />
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Languages
              </h3>
              <textarea
                name="languages"
                value={Array.isArray(tutorData.languages) ? tutorData.languages.join(', ') : tutorData.languages || ''}
                onChange={(e) => setTutorData(prev => ({ ...prev, languages: e.target.value.split(', ').filter(l => l.trim()) }))}
                disabled={!isEditing}
                rows={4}
                placeholder="Languages you speak (comma separated)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfile;
