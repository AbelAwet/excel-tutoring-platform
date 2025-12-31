import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FiDollarSign, FiPlus, FiTrash2, FiSave, FiCheck
} from 'react-icons/fi';
import { tutorService } from '../../services/tutorService';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const TutorApplication = () => {
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    subjects: [{ subject: '', level: 'intermediate', pricePerHour: '' }],
    education: '',
    experience: '',
    languages: ['English'],
    teachingStyle: ''
  });

  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Sample subjects for selection
  const availableSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'Computer Science', 'Economics', 'History', 'Art', 'SAT Preparation'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  // Check if already a tutor
  const { data: tutorProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['tutor-profile'],
    queryFn: tutorService.getMyProfile,
    retry: false
  });

  // Apply as tutor mutation
  const applyMutation = useMutation({
    mutationFn: tutorService.applyAsTutor,
    onSuccess: () => {
      toast.success('🎉 Tutor registration successful! You are now listed as a verified tutor.');
      navigate('/tutor');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  });

  // If tutor profile exists, redirect to dashboard
  useEffect(() => {
    if (tutorProfile?.data?.tutor) {
      toast.info('You already have a tutor profile!');
      navigate('/tutor');
    }
  }, [tutorProfile, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setFormData(prev => ({ ...prev, subjects: newSubjects }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { subject: '', level: 'intermediate', pricePerHour: '' }]
    }));
  };

  const removeSubject = (index) => {
    if (formData.subjects.length > 1) {
      const newSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, subjects: newSubjects }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.headline.trim()) {
      toast.error('Please provide a headline');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (formData.subjects.some(s => !s.subject || !s.pricePerHour)) {
      toast.error('Please complete all subject information');
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      subjects: formData.subjects.map(s => ({
        subject: s.subject,
        level: s.level,
        pricePerHour: parseFloat(s.pricePerHour)
      })),
      languages: formData.languages
    };

    applyMutation.mutate(submitData);
  };

  // Show loading while checking profile
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If tutor profile exists, show already registered message
  if (tutorProfile?.data?.tutor) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <FiCheck className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            You're Already a Tutor!
          </h2>
          <p className="text-green-600 dark:text-green-300 mb-4">
            You can manage your tutor profile and view bookings from your dashboard.
          </p>
          <button
            onClick={() => navigate('/tutor')}
            className="btn btn-primary"
          >
            Go to Tutor Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Become a Tutor
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Share your knowledge and help students achieve their goals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="e.g., Experienced Mathematics Tutor with 5+ Years"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About You
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your teaching experience, approach, and what makes you a great tutor..."
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teaching Style
              </label>
              <textarea
                name="teachingStyle"
                value={formData.teachingStyle}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe your teaching methodology and approach..."
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Subjects and Pricing */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Subjects & Pricing
            </h2>
            <button
              type="button"
              onClick={addSubject}
              className="btn btn-secondary btn-sm"
            >
              <FiPlus className="mr-2" size={16} />
              Add Subject
            </button>
          </div>

          <div className="space-y-4">
            {formData.subjects.map((subject, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={subject.subject}
                    onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Select Subject</option>
                    {availableSubjects.map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Level
                  </label>
                  <select
                    value={subject.level}
                    onChange={(e) => handleSubjectChange(index, 'level', e.target.value)}
                    className="input"
                  >
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price per Hour (ETB)
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={subject.pricePerHour}
                      onChange={(e) => handleSubjectChange(index, 'pricePerHour', e.target.value)}
                      placeholder="100"
                      min="1"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  {formData.subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="btn btn-ghost text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Background
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Education
              </label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                rows={3}
                placeholder="Your educational background, degrees, certifications..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={3}
                placeholder="Your teaching or relevant work experience..."
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={applyMutation.isLoading}
            className="btn btn-primary"
          >
            <FiSave className="mr-2" size={16} />
            {applyMutation.isLoading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TutorApplication;
