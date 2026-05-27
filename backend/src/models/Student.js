const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    bio: {
      type: String,
      maxlength: [5000, 'Bio cannot exceed 5000 characters'],
      default: '',
    },
    resume: {
      type: String,
      default: '',
    },
    fullName: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: 'Graphic Designer',
    },
    experienceType: {
      type: String,
      default: 'months',
    },
    experienceValue: {
      type: Number,
      default: 0,
    },
    tools: {
      type: [String],
      default: [],
    },
    gmail: {
      type: String,
      default: '',
    },
    portfolioUrl: {
      type: String,
      default: '',
    },
    schooling: {
      type: String,
      default: '',
    },
    relocate: {
      type: Boolean,
      default: false,
    },
    languages: {
      type: Array,
      default: [],
    },
    projects: {
      type: Array,
      default: [],
    },
    workSamples: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
