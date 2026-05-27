const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { calculateMatch } = require('../utils/skillMatcher');

// ─── POST /api/jobs  (company only) ──────────────────────────────────────────
router.post(
  '/',
  protect,
  roleGuard('company'),
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('jobType')
      .optional()
      .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
      .withMessage('Invalid job type'),
    body('experienceLevel')
      .optional()
      .isIn(['entry', 'junior', 'mid', 'senior', 'lead'])
      .withMessage('Invalid experience level'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const company = await Company.findOne({ userId: req.user._id });
      if (!company) {
        return res.status(404).json({ message: 'Company profile not found.' });
      }

      const job = await Job.create({
        ...req.body,
        company: company._id,
      });

      await job.populate('company');
      res.status(201).json(job);
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /api/jobs  (public — search, filter, paginate) ──────────────────────
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = req.query;

    const filter = { isActive: true };

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    // Filters
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (minSalary) filter['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) filter['salary.max'] = { $lte: Number(maxSalary) };

    // Sort
    const sortMap = {
      newest: { postedDate: -1 },
      oldest: { postedDate: 1 },
      salary_high: { 'salary.max': -1 },
      salary_low: { 'salary.min': 1 },
    };
    const sortQuery = sortMap[sort] || { postedDate: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('company', 'companyName location logo industry')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    // If authenticated student, attach skill match
    let studentSkills = [];
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.id);
        if (user && user.role === 'student') {
          const student = await Student.findOne({ userId: decoded.id });
          if (student) studentSkills = student.skills;
        }
      } catch (_) {
        // Anonymous — no match score
      }
    }

    const jobsWithMatch = jobs.map((job) => {
      const obj = job.toObject();
      if (studentSkills.length > 0) {
        obj.skillMatch = calculateMatch(studentSkills, job.requiredSkills);
      }
      return obj;
    });

    res.status(200).json({
      jobs: jobsWithMatch,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'company',
      'companyName location logo description industry website'
    );

    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const obj = job.toObject();

    // Attach skill match if authenticated student
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.id);
        if (user && user.role === 'student') {
          const student = await Student.findOne({ userId: decoded.id });
          if (student) {
            obj.skillMatch = calculateMatch(student.skills, job.requiredSkills);
          }
        }
      } catch (_) {}
    }

    res.status(200).json(obj);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/jobs/:id  (company owner only) ──────────────────────────────────
router.put(
  '/:id',
  protect,
  roleGuard('company'),
  async (req, res, next) => {
    try {
      const company = await Company.findOne({ userId: req.user._id });
      const job = await Job.findById(req.params.id);

      if (!job) return res.status(404).json({ message: 'Job not found.' });
      if (job.company.toString() !== company._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this job.' });
      }

      const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate('company', 'companyName location logo');

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /api/jobs/:id  (company owner only) ───────────────────────────────
router.delete(
  '/:id',
  protect,
  roleGuard('company'),
  async (req, res, next) => {
    try {
      const company = await Company.findOne({ userId: req.user._id });
      const job = await Job.findById(req.params.id);

      if (!job) return res.status(404).json({ message: 'Job not found.' });
      if (job.company.toString() !== company._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this job.' });
      }

      await Job.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Job deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
