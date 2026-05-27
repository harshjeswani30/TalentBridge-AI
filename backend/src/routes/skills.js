const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Skill = require('../models/Skill');
const { protect } = require('../middleware/auth');

// ─── GET /api/skills ──────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skills = await Skill.find(filter).sort({ category: 1, name: 1 });
    res.status(200).json(skills);
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/skills  (authenticated — any role can add) ─────────────────────
router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('category')
      .optional()
      .isIn(['frontend', 'backend', 'database', 'devops', 'mobile', 'ai-ml', 'design', 'testing', 'other'])
      .withMessage('Invalid category'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const skill = await Skill.create({
        name: req.body.name.toLowerCase().trim(),
        category: req.body.category || 'other',
      });
      res.status(201).json(skill);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'This skill already exists.' });
      }
      next(error);
    }
  }
);

module.exports = router;
