const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

// ─── GET /api/students/profile ────────────────────────────────────────────────
router.get('/profile', protect, roleGuard('student'), async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email'
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/students/profile ─────────────────────────────────────────────────
router.put(
  '/profile',
  protect,
  roleGuard('student'),
  [
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Invalid level value'),
    body('bio')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Bio cannot exceed 5000 characters'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const allowedFields = [
        'skills',
        'level',
        'bio',
        'resume',
        'fullName',
        'position',
        'experienceType',
        'experienceValue',
        'tools',
        'gmail',
        'portfolioUrl',
        'schooling',
        'relocate',
        'languages',
        'projects',
        'workSamples'
      ];
      const updateData = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updateData[field] = req.body[field];
      });

      const student = await Student.findOneAndUpdate(
        { userId: req.user._id },
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email');

      if (!student) {
        return res.status(404).json({ message: 'Student profile not found.' });
      }

      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
