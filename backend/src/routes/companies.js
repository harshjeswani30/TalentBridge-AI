const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

// ─── GET /api/company/profile ─────────────────────────────────────────────────
router.get('/profile', protect, roleGuard('company'), async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email'
    );

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found.' });
    }

    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/company/profile ──────────────────────────────────────────────────
router.put(
  '/profile',
  protect,
  roleGuard('company'),
  [
    body('companyName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Company name cannot be blank'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const allowedFields = [
        'companyName',
        'description',
        'location',
        'logo',
        'website',
        'industry',
      ];
      const updateData = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updateData[field] = req.body[field];
      });

      const company = await Company.findOneAndUpdate(
        { userId: req.user._id },
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email');

      if (!company) {
        return res.status(404).json({ message: 'Company profile not found.' });
      }

      res.status(200).json(company);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
