import Subject from '../models/Subject.js';

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Public
export const getAllSubjects = async (req, res) => {
  try {
    const { category, search, isActive = true } = req.query;

    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const subjects = await Subject.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { subjects }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subjects'
    });
  }
};

// @desc    Get subject by ID
// @route   GET /api/v1/subjects/:id
// @access  Public
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { subject }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subject'
    });
  }
};

// @desc    Create subject
// @route   POST /api/v1/subjects
// @access  Private (Admin)
export const createSubject = async (req, res) => {
  try {
    const { name, description, category, icon } = req.body;

    const subject = await Subject.create({
      name,
      description,
      category,
      icon
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { subject }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create subject'
    });
  }
};

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
// @access  Private (Admin)
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: { subject }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update subject'
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private (Admin)
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete subject'
    });
  }
};

// @desc    Get subject categories
// @route   GET /api/v1/subjects/categories/list
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Subject.distinct('category');

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get categories'
    });
  }
};
