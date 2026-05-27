const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [80, 'Skill name cannot exceed 80 characters'],
    },
    category: {
      type: String,
      enum: [
        'frontend',
        'backend',
        'database',
        'devops',
        'mobile',
        'ai-ml',
        'design',
        'testing',
        'other',
      ],
      default: 'other',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
