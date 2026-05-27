const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

// ─── POST /api/applications  (student only) ────────────────────────────────────
router.post(
  '/',
  protect,
  roleGuard('student'),
  [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('coverLetter')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Cover letter cannot exceed 2000 characters'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found.' });
      }

      const job = await Job.findById(req.body.jobId);
      if (!job) return res.status(404).json({ message: 'Job not found.' });
      if (!job.isActive) {
        return res.status(400).json({ message: 'This job is no longer accepting applications.' });
      }

      // Check duplicate
      const existing = await Application.findOne({ student: student._id, job: job._id });
      if (existing) {
        return res.status(409).json({ message: 'You have already applied for this job.' });
      }

      const application = await Application.create({
        student: student._id,
        job: job._id,
        coverLetter: req.body.coverLetter || '',
      });

      await application.populate([
        { path: 'job', select: 'title location jobType', populate: { path: 'company', select: 'companyName logo' } },
        { path: 'student', select: 'skills level' },
      ]);

      res.status(201).json(application);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'You have already applied for this job.' });
      }
      next(error);
    }
  }
);

// ─── GET /api/applications  (student — my applications) ───────────────────────
router.get('/', protect, roleGuard('student'), async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const applications = await Application.find({ student: student._id })
      .populate({
        path: 'job',
        select: 'title location jobType salary requiredSkills isActive',
        populate: { path: 'company', select: 'companyName logo location' },
      })
      .sort({ appliedDate: -1 });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/applications/company  (company — all apps for their jobs) ───────
router.get('/company', protect, roleGuard('company'), async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) return res.status(404).json({ message: 'Company profile not found.' });

    const companyJobs = await Job.find({ company: company._id }).select('_id');
    const jobIds = companyJobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate({
        path: 'student',
        select: 'skills level bio',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('job', 'title location jobType')
      .sort({ appliedDate: -1 });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/applications/:id  (company — update status) ─────────────────────
router.put(
  '/:id',
  protect,
  roleGuard('company'),
  [
    body('status')
      .isIn(['pending', 'reviewed', 'accepted', 'rejected'])
      .withMessage('Invalid status value'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const company = await Company.findOne({ userId: req.user._id });
      const application = await Application.findById(req.params.id).populate('job');

      if (!application) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      // Verify the job belongs to this company
      if (application.job.company.toString() !== company._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this application.' });
      }

      application.status = req.body.status;
      await application.save();

      await application.populate([
        { path: 'job', select: 'title location jobType' },
        {
          path: 'student',
          select: 'skills level',
          populate: { path: 'userId', select: 'name email' },
        },
      ]);

      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
