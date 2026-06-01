import Tutor from '../models/Tutor.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Apply as tutor
// @route   POST /api/v1/tutors/apply
// @access  Private
export const applyAsTutor = async (req, res) => {
  try {
    const {
      subjects,
      education,
      experience,
      certifications,
      languages,
      headline,
      description,
      teachingStyle,
      bankDetails
    } = req.body;

    // Check if already a tutor
    const existingTutor = await Tutor.findOne({ user: req.user._id });
    if (existingTutor) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied as a tutor'
      });
    }

    // Process subjects - find or create subject documents
    const processedSubjects = [];
    for (const subjectData of subjects) {
      let subject = await Subject.findOne({ name: subjectData.subject });
      
      // If subject doesn't exist, create it
      if (!subject) {
        subject = await Subject.create({
          name: subjectData.subject,
          category: 'Other', // Default category
          description: `${subjectData.subject} tutoring`
        });
      }

      processedSubjects.push({
        subject: subject._id,
        level: subjectData.level,
        pricePerHour: subjectData.pricePerHour
      });
    }

    // Process education - convert string to array format
    const processedEducation = education ? [{
      degree: education,
      institution: 'Not specified',
      current: false
    }] : [];

    // Process experience - convert string to array format
    const processedExperience = experience ? [{
      title: 'Teaching Experience',
      description: experience,
      current: false
    }] : [];

    // Process languages - convert array of strings to array of objects
    const processedLanguages = Array.isArray(languages) 
      ? languages.map(lang => ({
          language: typeof lang === 'string' ? lang : lang.language || 'English',
          proficiency: typeof lang === 'object' ? lang.proficiency || 'fluent' : 'fluent'
        }))
      : [{ language: 'English', proficiency: 'fluent' }];

    // Create tutor profile
    const tutor = await Tutor.create({
      user: req.user._id,
      subjects: processedSubjects,
      education: processedEducation,
      experience: processedExperience,
      certifications: certifications || [],
      languages: processedLanguages,
      headline,
      description,
      teachingStyle,
      bankDetails,
      verificationStatus: 'verified' // Auto-verify tutors on registration
    });

    // Update user role if not already tutor
    if (req.user.role !== 'tutor') {
      await User.findByIdAndUpdate(req.user._id, { role: 'tutor' });
    }

    res.status(201).json({
      success: true,
      message: 'Tutor registration successful! You are now listed as a verified tutor.',
      data: { tutor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit tutor application'
    });
  }
};

// @desc    Get all tutors
// @route   GET /api/v1/tutors
// @access  Public
export const getAllTutors = async (req, res) => {
  try {
    const {
      subject,
      minPrice,
      maxPrice,
      minRating,
      search,
      page = 1,
      limit = 12,
      sortBy = 'rating'
    } = req.query;

    const query = { verificationStatus: 'verified', isAvailable: true };

    // Filter by subject
    if (subject) {
      query['subjects.subject'] = subject;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query['subjects.pricePerHour'] = {};
      if (minPrice) query['subjects.pricePerHour'].$gte = parseFloat(minPrice);
      if (maxPrice) query['subjects.pricePerHour'].$lte = parseFloat(maxPrice);
    }

    // Filter by rating
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Search by name or description
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(u => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { headline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'price_low':
        sort = { 'subjects.pricePerHour': 1 };
        break;
      case 'price_high':
        sort = { 'subjects.pricePerHour': -1 };
        break;
      case 'experience':
        sort = { totalSessions: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const tutors = await Tutor.find(query)
      .populate('user', 'firstName lastName avatar email')
      .populate('subjects.subject', 'name category')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tutor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        tutors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tutors'
    });
  }
};

// @desc    Get tutor by ID
// @route   GET /api/v1/tutors/:id
// @access  Public
export const getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate('user', 'firstName lastName avatar email bio')
      .populate('subjects.subject', 'name category description');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { tutor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tutor'
    });
  }
};

// @desc    Get my tutor profile
// @route   GET /api/v1/tutors/me/profile
// @access  Private (Tutor)
export const getMyTutorProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id })
      .populate('user')
      .populate('subjects.subject');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { tutor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tutor profile'
    });
  }
};

// @desc    Update tutor profile
// @route   PUT /api/v1/tutors/me
// @access  Private (Tutor)
export const updateTutorProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    const allowedUpdates = [
      'subjects',
      'education',
      'experience',
      'certifications',
      'languages',
      'availability',
      'headline',
      'description',
      'teachingStyle',
      'isAvailable',
      'bankDetails'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        tutor[field] = req.body[field];
      }
    });

    await tutor.save();

    res.status(200).json({
      success: true,
      message: 'Tutor profile updated successfully',
      data: { tutor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update tutor profile'
    });
  }
};

// @desc    Upload verification documents
// @route   POST /api/v1/tutors/me/documents
// @access  Private (Tutor)
export const uploadVerificationDocuments = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedDocs = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file, 'tutor-documents');
      uploadedDocs.push({
        type: req.body.type || 'other',
        url: result.url,
        publicId: result.publicId
      });
    }

    tutor.verificationDocuments.push(...uploadedDocs);
    await tutor.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: { documents: uploadedDocs }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload documents'
    });
  }
};

// @desc    Get tutor dashboard stats
// @route   GET /api/v1/tutors/me/stats
// @access  Private (Tutor)
export const getTutorStats = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user._id });
    if (!tutor) return res.status(404).json({ success: false, message: 'Tutor profile not found' });

    // Static imports used — no dynamic import overhead
    const bookingStats = await Booking.aggregate([
      { $match: { tutor: tutor._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentBookings = await Booking.find({ tutor: tutor._id })
      .populate('student', 'firstName lastName avatar')
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const reviews = await Review.find({ tutor: tutor._id })
      .populate('student', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEarnings: tutor.totalEarnings,
          totalSessions: tutor.totalSessions,
          totalStudents: tutor.totalStudents,
          rating: tutor.rating,
          bookingStats
        },
        recentBookings,
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get tutor stats' });
  }
};
